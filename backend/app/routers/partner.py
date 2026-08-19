from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api", tags=["partner"])


@router.post("/partner")
def partner(payload: schemas.PartnerCreate, db: Session = Depends(get_db)):
    interest = models.PartnerInterest(**payload.model_dump())
    db.add(interest)
    db.commit()
    return {"status": "ok"}
