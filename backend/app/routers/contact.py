from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api", tags=["contact"])


@router.post("/contact")
def contact(payload: schemas.ContactCreate, db: Session = Depends(get_db)):
    message = models.ContactMessage(**payload.model_dump())
    db.add(message)
    db.commit()
    return {"status": "ok"}
