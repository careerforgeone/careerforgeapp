import json
import re
import sys
from pathlib import Path

from openai import OpenAI

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.config import settings
from app.database import SessionLocal
from app.models.knowledge import KnowledgeChunk

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
MAX_WORDS_PER_CHUNK = 180


def chunk_text(text: str, source: str) -> list[dict[str, str]]:
    sections = re.split(r"\n(?=#{1,3} )", text)
    chunks = []
    for section in sections:
        section = section.strip()
        if not section:
            continue
        header = re.match(r"#{1,3} (.+)", section)
        section_title = header.group(1).strip() if header else source
        words = section.split()
        for start in range(0, len(words), MAX_WORDS_PER_CHUNK):
            content = " ".join(words[start:start + MAX_WORDS_PER_CHUNK])
            if content:
                chunks.append({"source": source, "section": section_title, "content": content})
    return chunks


def ingest_file(client: OpenAI, db, path: Path, source: str) -> int:
    if not path.exists():
        return 0
    chunks = chunk_text(path.read_text(encoding="utf-8"), source)
    db.query(KnowledgeChunk).filter(KnowledgeChunk.source == source).delete()
    for chunk in chunks:
        result = client.embeddings.create(model=settings.EMBEDDING_MODEL, input=chunk["content"])
        embedding = result.data[0].embedding
        db.add(KnowledgeChunk(**chunk, embedding=json.dumps(embedding)))
    return len(chunks)


def main():
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("Set OPENAI_API_KEY or API_KEY in backend/.env before ingestion.")
    client = OpenAI(api_key=settings.OPENAI_API_KEY, base_url=settings.OPENAI_BASE_URL)
    db = SessionLocal()
    try:
        total = 0
        for path, source in (
            (DATA_DIR / "participant_handbook.md", "handbook"),
            (DATA_DIR / "curriculum.md", "curriculum"),
            (DATA_DIR / "faq.md", "faq"),
        ):
            count = ingest_file(client, db, path, source)
            total += count
            print(f"{source}: {count} chunks")
        db.commit()
        print(f"Ingested {total} knowledge chunks.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
