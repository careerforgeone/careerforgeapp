import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from .. import models
from ..core.config import settings
from ..database import get_db

router = APIRouter(prefix="/api", tags=["apply"])

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB — matches the frontend's own check
PAYMENT_AMOUNT_KOBO = 3_500_000


def paystack_request(path: str, payload: dict | None = None) -> dict:
    if not settings.PAYSTACK_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Payment service is not configured.")

    request = Request(
        f"https://api.paystack.co/{path}",
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json",
        },
        method="POST" if payload is not None else "GET",
    )
    try:
        with urlopen(request, timeout=15) as response:
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
        "payment_amount": PAYMENT_AMOUNT_KOBO,
    }


@router.post("/payment/initialize/{application_id}")
@router.post("/applications/{application_id}/initialize-payment")
def initialize_payment(application_id: int, db: Session = Depends(get_db)):
    application = db.query(models.Application).filter_by(id=application_id).first()
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found.")

    payment = paystack_request(
        "transaction/initialize",
        {
            "email": application.email,
            "amount": PAYMENT_AMOUNT_KOBO,
            "reference": f"careerforge-{application.id}-{uuid.uuid4().hex[:12]}",
            "callback_url": f"{settings.FRONTEND_URL}/payment-success",
            "metadata": {"application_id": application.id},
        },
    )
    if not payment.get("status") or not payment.get("data", {}).get("authorization_url"):
        raise HTTPException(status_code=502, detail="Unable to initialize payment.")

    application.payment_reference = payment["data"]["reference"]
    application.payment_amount = payment["data"].get("amount", PAYMENT_AMOUNT_KOBO)
    db.commit()
    return {
        "status": "payment_required",
        "application_id": application.id,
        "reference": application.payment_reference,
        "authorizationUrl": payment["data"]["authorization_url"],
    }


@router.get("/payment/verify/{reference}")
def verify_payment(reference: str, db: Session = Depends(get_db)):
    application = db.query(models.Application).filter_by(payment_reference=reference).first()
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found.")

    payment = paystack_request(f"transaction/verify/{reference}")
    paid = payment.get("status") and payment.get("data", {}).get("status") == "success"
    if paid:
        application.payment_status = True
        application.payment_paid_at = datetime.now(timezone.utc)
        application.status = "paid"
        db.commit()

    return {"paymentStatus": bool(paid), "applicationId": application.id}
