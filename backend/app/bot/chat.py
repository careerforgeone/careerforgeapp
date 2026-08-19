"""
Space reserved for the CareerForge chatbot.

This is a stub — the actual bot logic isn't built here. Fill it in
yourself, then wire it up:

  1. Build your bot logic in this file (or import it from wherever you're
     keeping it — a separate module, an LLM API call, whatever you're using).
  2. In app/main.py, uncomment the two lines under the "BOT INTEGRATION"
     comment block to mount this router at /api/bot/chat.
  3. If you want the frontend's chat widget to actually call this endpoint
     instead of its current client-side FAQ logic, update
     src/components/ChatWidget.jsx in the frontend project to POST the
     user's message here and render whatever `reply` comes back.

The request/response shape below is just a starting point — change it to
whatever your bot actually needs.
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/bot", tags=["bot"])


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest):
    # TODO: replace this with your actual bot logic.
    return {"reply": "The CareerForge bot isn't wired up yet."}
