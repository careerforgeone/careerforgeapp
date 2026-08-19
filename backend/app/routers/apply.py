import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from .. import models
from ..core.config import settings
from ..database import get_db

router = APIRouter(prefix="/api", tags=["apply"])

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB — matches the frontend's own check


@router.post("/apply")
async def apply(
    name: str = Form(...),
    email: str = Form(...),
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
        track=track,
        application_type=applicationType,
        portfolio_url=portfolioUrl,
        linkedin_url=linkedinUrl,
        cv_path=cv_path,
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    return {"status": "ok", "id": application.id, "cvPath": cv_path}
