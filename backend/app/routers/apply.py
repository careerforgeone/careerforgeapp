import hashlib
import hmac
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request as UrlRequest, urlopen

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from sqlalchemy.orm import Session

from .. import models
from ..core.config import settings
from ..database import get_db
import requests

router = APIRouter(prefix="/api", tags=["apply"])

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB — matches the frontend's own check
# The fee is read from settings.APPLICATION_FEE_KOBO (env: APPLICATION_FEE,
# in naira, or APPLICATION_FEE_KOBO directly — see core/config.py) so that
# render.yaml's APPLICATION_FEE_KOBO env var actually controls what gets
# charged. Never read an amount from the request — see initialize_payment().


def paystack_request(path: str, payload: dict | None = None) -> dict:
    if not settings.PAYSTACK_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Payment service is not configured.")

    request = UrlRequest(
        f"https://api.paystack.co/{path}",
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json",
        },
        method="POST" if payload is not None else "GET",
    )
    try:
        with urlopen(request, timeout=60) as response:
            return json.loads(response.read().decode())
    except HTTPError as exc:
        if exc.code in (401, 403):
            raise HTTPException(
                status_code=502,
                detail="Paystack rejected the secret key. Check that it is an active Paystack secret key.",
            ) from exc
        raise HTTPException(status_code=502, detail="Paystack returned an error.") from exc
    except (URLError, TimeoutError) as exc:
        raise HTTPException(status_code=502, detail="Unable to contact payment service.") from exc


@router.post("/apply")
async def apply(
    name: str = Form(...),
    email: str = Form(...),
    state: str = Form(...),
    country: str = Form(...),
    countryCode: str = Form(...),
    phoneNumber: str = Form(...),
    hearAboutUs: str = Form(...),
    track: str = Form(...),
    applicationType: str = Form(...),
    portfolioUrl: str | None = Form(None),
    linkedinUrl: str | None = Form(None),
    cv: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    cv_path = None

    if applicationType == "Internship":
        if cv is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A CV file is required for internship applicants.",
            )

        ext = Path(cv.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type.")

        contents = await cv.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large.")

        # Unique filename so two applicants can never overwrite each other's CV
        safe_filename = f"{uuid.uuid4().hex}{ext}"
        destination = settings.RESUME_DIR / safe_filename
        with open(destination, "wb") as f:
            f.write(contents)

        # Store the PATH here, not the file — the file itself lives in
        # app/uploads/resumes/ on this server.
        cv_path = f"/uploads/resumes/{safe_filename}"

    application = models.Application(
        name=name,
        email=email,
        state=state,
        country=country,
        country_code=countryCode,
        phone_number=phoneNumber,
        hear_about_us=hearAboutUs,
        track=track,
        application_type=applicationType,
        portfolio_url=portfolioUrl,
        linkedin_url=linkedinUrl,
        cv_path=cv_path,
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    return {
        "success": True,
        "message": "Application submitted successfully",
        "application_id": application.id,
        "payment_status": application.payment_status,
        "payment_amount": settings.APPLICATION_FEE_KOBO,
    }


@router.post("/payment/initialize/{application_id}")
@router.post("/applications/{application_id}/initialize-payment")
def initialize_payment(application_id: int, db: Session = Depends(get_db)):
    # 1 & 2 — find the application, confirm it exists.
    application = db.query(models.Application).filter_by(id=application_id).first()
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found.")

    # 4 & 5 — the fee (settings.APPLICATION_FEE_KOBO, ₦35,000 = 3,500,000
    # kobo by default) is fixed server-side config, never client input, so
    # a request can't alter what actually gets charged.
    payment = paystack_request(
        "transaction/initialize",
        {
            # 3 — applicant's email, from the DB record, not the request.
            "email": application.email,
            "amount": settings.APPLICATION_FEE_KOBO,
            # 6 — Paystack transaction reference, unique per attempt.
            "reference": f"careerforge-{application.id}-{uuid.uuid4().hex[:12]}",
            "callback_url": f"{settings.FRONTEND_URL}/payment-success",
            # 7 — application ID travels in Paystack metadata.
            "metadata": {"application_id": application.id},
        },
    )
    # 8 — call Paystack's initialize endpoint (see paystack_request above).
    if not payment.get("status") or not payment.get("data", {}).get("authorization_url"):
        raise HTTPException(status_code=502, detail="Unable to initialize payment.")

    application.payment_reference = payment["data"]["reference"]
    application.payment_amount = payment["data"].get("amount", settings.APPLICATION_FEE_KOBO)
    db.commit()
    return {
        "status": "payment_required",
        "application_id": application.id,
        "reference": application.payment_reference,
        "authorizationUrl": payment["data"]["authorization_url"],
    }


def _confirm_payment(application: models.Application, reference: str, db: Session) -> str:
    """The single source of truth for whether a payment actually succeeded.

    Always asks Paystack directly (never trusts a webhook payload or the
    frontend simply reaching the success page), and never sets
    payment_status = True for anything Paystack doesn't report as
    "success". Safe to call twice for the same reference — once it's
    already confirmed, this is a no-op — so the webhook and the
    success-page poll can both call it without double-processing.

    Returns the Paystack transaction status string.
    """
    if application.payment_status:
        return "success"  # already confirmed — idempotent no-op

    payment = paystack_request(f"transaction/verify/{reference}")
    data = payment.get("data") or {}
    paystack_status = data.get("status")  # "success" | "failed" | "abandoned" | ...

    if paystack_status != "success":
        # Reflect failed/abandoned/pending state on the existing `status`
        # field so it's visible in the admin dashboard, without ever
        # setting payment_status = True for anything but a verified success.
        application.status = f"payment_{paystack_status}" if paystack_status else "payment_unverified"
        db.commit()
        return paystack_status or "unknown"

    # Belt-and-braces: confirm this transaction really is for this exact
    # application and the exact fee, not just that *some* payment succeeded.
    metadata_app_id = (data.get("metadata") or {}).get("application_id")
    amount_matches = data.get("amount") == settings.APPLICATION_FEE_KOBO
    reference_matches = data.get("reference") == reference
    metadata_matches = metadata_app_id is None or int(metadata_app_id) == application.id

    if not (amount_matches and reference_matches and metadata_matches):
        application.status = "payment_verification_mismatch"
        db.commit()
        return "mismatch"

    application.payment_status = True
    application.payment_amount = data.get("amount")
    application.payment_paid_at = datetime.now(timezone.utc)
    application.status = "paid"
    db.commit()
    return "success"


@router.get("/payment/verify/{reference}")
def verify_payment(reference: str, db: Session = Depends(get_db)):
    application = db.query(models.Application).filter_by(payment_reference=reference).first()
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found.")

    paystack_status = _confirm_payment(application, reference, db)
    db.refresh(application)

    return {
        # Original shape the frontend already reads — unchanged.
        "paymentStatus": application.payment_status,
        "applicationId": application.id,
        # Additive fields for the receipt page.
        "status": paystack_status,
        "application": {
            "id": application.id,
            "name": application.name,
            "email": application.email,
            "track": application.track,
            "applicationType": application.application_type,
        },
        "payment": {
            "reference": application.payment_reference,
            "amount": application.payment_amount,
            "paidAt": application.payment_paid_at.isoformat() if application.payment_paid_at else None,
            "status": paystack_status,
        },
    }


@router.post("/payment/webhook")
async def paystack_webhook(request: Request, db: Session = Depends(get_db)):
    """Paystack calls this directly, server-to-server — not through the
    browser, so CORS doesn't apply here. The signature check below is what
    proves a request genuinely came from Paystack, using the same secret
    key already used for the outgoing API calls above (Paystack doesn't
    use a separate webhook secret).
    """
    body = await request.body()
    signature = request.headers.get("x-paystack-signature", "")
    expected_signature = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode("utf-8"), body, hashlib.sha512
    ).hexdigest() if settings.PAYSTACK_SECRET_KEY else ""

    if not expected_signature or not signature or not hmac.compare_digest(expected_signature, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    event = json.loads(body)
    if event.get("event") == "charge.success":
        reference = (event.get("data") or {}).get("reference")
        if reference:
            application = db.query(models.Application).filter_by(payment_reference=reference).first()
            # An unrecognized reference isn't necessarily an error on our
            # end — acknowledge with 200 either way so Paystack doesn't
            # retry indefinitely, without leaking whether it matched.
            if application is not None:
                _confirm_payment(application, reference, db)

    return {"received": True}
