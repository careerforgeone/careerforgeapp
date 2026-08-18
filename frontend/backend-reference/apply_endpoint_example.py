"""
Reference FastAPI snippet for receiving the CareerForge Apply form now that
the CV is uploaded as a real file (multipart/form-data) instead of a link.

Drop the relevant pieces of this into your existing backend's /api/apply
route. This is a reference, not a drop-in replacement — merge it with
whatever your current route already does (saving other application
fields to the database, sending notification emails, etc.).
"""

import os
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse

router = APIRouter()

# Folder on the BACKEND server (not the frontend) where uploaded résumés
# are stored. Create this folder in your backend project, e.g.:
#   backend/
#     uploads/
#       resumes/        <- files land here
UPLOAD_DIR = Path(__file__).parent / "uploads" / "resumes"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB, matches the frontend's check


@router.post("/api/apply")
async def apply(
    name: str = Form(...),
    email: str = Form(...),
    track: str = Form(...),
    applicationType: str = Form(...),
    password: str = Form(...),
    confirmPassword: str = Form(...),
    portfolioUrl: str = Form(None),
    linkedinUrl: str = Form(None),
    cv: UploadFile = File(None),
):
    cv_path_for_db = None

    if applicationType == "Internship" and cv is not None:
        ext = Path(cv.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            return JSONResponse(status_code=400, content={"error": "Unsupported file type."})

        contents = await cv.read()
        if len(contents) > MAX_FILE_SIZE:
            return JSONResponse(status_code=400, content={"error": "File too large."})

        # Unique filename so two applicants can't overwrite each other's CV
        safe_filename = f"{uuid.uuid4().hex}{ext}"
        destination = UPLOAD_DIR / safe_filename
        with open(destination, "wb") as f:
            f.write(contents)

        # This is the "path" you store in the database against the
        # application record — not the file itself. Store it as a
        # relative path or a served URL, e.g. "/uploads/resumes/<file>.pdf"
        cv_path_for_db = f"/uploads/resumes/{safe_filename}"

    # TODO: save `name`, `email`, `track`, `applicationType`, `portfolioUrl`,
    # `linkedinUrl`, and `cv_path_for_db` to your database here, the same
    # way your existing /api/apply route already saves other fields.
    # Never store the plaintext password — hash it the same way the rest
    # of your auth system does.

    return {"status": "ok", "cvPath": cv_path_for_db}


# To let admins download/view a stored résumé later, serve the uploads
# folder as static files in your main FastAPI app (once, at startup):
#
#   from fastapi.staticfiles import StaticFiles
#   app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
#
# Then a résumé stored as "/uploads/resumes/<file>.pdf" becomes reachable
# at:  https://careerforge-api-i1v3.onrender.com/uploads/resumes/<file>.pdf
