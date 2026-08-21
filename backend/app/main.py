from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .core.config import settings
from .database import Base, engine, ensure_application_payment_columns
from .bot import chat as bot_chat
from .routers import admin, apply, auth, contact, partner

Base.metadata.create_all(bind=engine)
ensure_application_payment_columns()

app = FastAPI(title="CareerForge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serves uploaded résumés at, e.g.,
# https://careerforge-api-i1v3.onrender.com/uploads/resumes/<file>.pdf
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_ROOT), name="uploads")

app.include_router(auth.router)
app.include_router(apply.router)
app.include_router(contact.router)
app.include_router(partner.router)
app.include_router(admin.router)
app.include_router(bot_chat.router)


@app.get("/")
def root():
    return {"status": "CareerForge API running"}
