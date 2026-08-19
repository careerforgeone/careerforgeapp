from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..core.deps import require_admin
from ..database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
def stats(db: Session = Depends(get_db), _admin: models.User = Depends(require_admin)):
    return {
        "applicants": db.query(models.Application).count(),
        "mentors": 0,  # wire up once you have a Mentor model
        "partnerOrgs": db.query(models.PartnerInterest).count(),
        "activeCohort": 1,
    }


@router.get("/applicants", response_model=list[schemas.ApplicationOut])
def applicants(db: Session = Depends(get_db), _admin: models.User = Depends(require_admin)):
    return db.query(models.Application).order_by(models.Application.created_at.desc()).all()
