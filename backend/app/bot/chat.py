import json
import re

from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..core.config import settings
from ..database import get_db
from ..models.chat import ChatMessage
from ..models.knowledge import KnowledgeChunk

router = APIRouter(prefix="/api/bot", tags=["bot"])
HISTORY_TURNS = 6
RETRIEVAL_K = 5

SYSTEM_PROMPT = """You are the CareerForge Assistant.

Your job is to help users with questions about CareerForge while also
maintaining a friendly, natural conversation.

RULES:

1. FRIENDLY CONVERSATION
You may respond naturally to simple conversational messages that do not
require information from the CONTEXT, such as:
- "Hello"
- "Hi"
- "How are you?"
- "Good morning"
- "Thank you"
- "You're welcome"
- "Bye"
- "Who are you?"
- "Nice to meet you"

Keep these responses short, warm, and friendly.

2. TECHIESTART INFORMATION
For questions about TechieStart's programs, courses, fees, schedules,
registration, requirements, instructors, services, or any other specific
TechieStart information, answer ONLY using the CONTEXT provided below.

The CONTEXT comes from the official TechieStart FAQ and program information.

3. MIXED QUESTIONS
If a message contains both casual conversation and a TechieStart question,
respond naturally to the casual part and answer the TechieStart question using
ONLY the CONTEXT.

For example, if the user says:
"Hi, how are you? Also, when does the AI program start?"

Respond naturally to the greeting, then answer the program question using only
the information available in the CONTEXT.

4. IF INFORMATION IS NOT IN THE CONTEXT
If a user asks a TechieStart-related question and the answer cannot be found
in the CONTEXT, do not guess, assume, or invent information.

Instead, politely say that you are not sure and suggest that the user contact
the TechieStart support line for accurate information.

5. DO NOT INVENT DETAILS
Never make up:
- Program details
- Fees
- Dates
- Schedules
- Course content
- Requirements
- Contact information
- Statistics
- Policies
- Promises or guarantees

6. STYLE
Be concise, friendly, helpful, and encouraging.
Avoid unnecessarily long explanations.

7. WHATSAPP SUPPORT
If the user asks to speak with a human, contact support, continue the
conversation on WhatsApp, or requests assistance that requires a human,
politely offer to transfer them to TechieStart support on WhatsApp.

If the requested TechieStart information is not available in the CONTEXT,
you may also suggest continuing with the TechieStart support team on WhatsApp.

Do not invent or guess the WhatsApp number. Only provide the WhatsApp link
or number if it is explicitly provided in the CONTEXT or application
configuration.

"""


class ChatRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=100)
    message: str = Field(min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    reply: str


def get_client() -> OpenAI:
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="Chatbot API key is not configured.")
    return OpenAI(api_key=settings.OPENAI_API_KEY, base_url=settings.OPENAI_BASE_URL)


def embed(text: str) -> list[float] | None:
    try:
        result = get_client().embeddings.create(model=settings.EMBEDDING_MODEL, input=text)
        return result.data[0].embedding
    except Exception:
        return None


def parse_embedding(value: str | None) -> list[float] | None:
    if not value:
        return None
    try:
        parsed = json.loads(value)
    except (TypeError, ValueError):
        return None
    if isinstance(parsed, list) and parsed and all(isinstance(item, (int, float)) for item in parsed):
        return [float(item) for item in parsed]
    return None


def cosine_similarity(left: list[float] | None, right: list[float] | None) -> float:
    if not left or not right or len(left) != len(right):
        return 0.0
    dot_product = sum(a * b for a, b in zip(left, right))
    left_norm = sum(a * a for a in left) ** 0.5
    right_norm = sum(b * b for b in right) ** 0.5
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return dot_product / (left_norm * right_norm)


def retrieve_context(db: Session, query: str, limit: int = RETRIEVAL_K) -> str:
    query_terms = set(re.findall(r"\w+", query.lower()))
    query_embedding = embed(query)
    scored_chunks = []
    for chunk in db.query(KnowledgeChunk).all():
        chunk_terms = set(re.findall(r"\w+", chunk.content.lower()))
        keyword_score = len(query_terms & chunk_terms)
        embedding_score = cosine_similarity(query_embedding, parse_embedding(chunk.embedding))
        score = embedding_score if embedding_score > 0 else keyword_score
        scored_chunks.append((score, chunk))

    scored_chunks.sort(key=lambda item: item[0], reverse=True)
    chunks = [chunk for _, chunk in scored_chunks[:limit]]
    if not chunks:
        return "(no matching context found)"
    return "\n\n".join(f"[{chunk.source} — {chunk.section}]\n{chunk.content}" for chunk in chunks)


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    client = get_client()
    db.add(ChatMessage(session_id=payload.session_id, role="user", content=payload.message))
    db.commit()

    context = retrieve_context(db, payload.message)
    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == payload.session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(HISTORY_TURNS)
        .all()[::-1]
    )
    messages = [{"role": "system", "content": f"{SYSTEM_PROMPT}\n\nCONTEXT:\n{context}"}]
    messages.extend({"role": item.role, "content": item.content} for item in history)

    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_CHAT_MODEL,
            messages=messages,
            temperature=0.3,
            max_tokens=400,
        )
        reply = response.choices[0].message.content or "I could not generate a response."
    except Exception as exc:
        # Surface what actually went wrong instead of a fixed guess — an
        # invalid key, a rate limit, and a bad model name all look
        # identical to the caller unless the real message gets through.
        detail = str(exc)
        status_code = getattr(exc, "status_code", None) or getattr(getattr(exc, "response", None), "status_code", None)
        if status_code == 429:
            raise HTTPException(
                status_code=502,
                detail=f"Chatbot provider rate limit hit ({settings.OPENAI_CHAT_MODEL}): {detail}",
            ) from exc
        if status_code in (401, 403):
            raise HTTPException(
                status_code=502,
                detail=f"Chatbot provider rejected the request (auth): {detail}",
            ) from exc
        raise HTTPException(
            status_code=502,
            detail=f"Chatbot provider error ({settings.OPENAI_CHAT_MODEL}): {detail}",
        ) from exc

    db.add(ChatMessage(session_id=payload.session_id, role="assistant", content=reply))
    db.commit()
    return ChatResponse(reply=reply)
