import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai


# --------------------------------------------------
# Load Environment Variables
# --------------------------------------------------

env_path = Path(__file__).resolve().parent.parent / ".env"

load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GOOGLE_API_KEY")


# --------------------------------------------------
# Configure Gemini
# --------------------------------------------------

model = None
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-2.0-flash"))


# --------------------------------------------------
# Generate Answer
# --------------------------------------------------

def generate_answer(user_query: str, retrieved_chunks: list) -> str:

    context = ""

    for i, chunk in enumerate(retrieved_chunks, start=1):

        context += f"""
SOURCE {i}

Document: {chunk.get("document")}
Chapter: {chunk.get("chapter")}
Topic: {chunk.get("topic")}
Pages: {chunk.get("page_start")} - {chunk.get("page_end")}

Content:
{chunk.get("text")}

----------------------------------------
"""

    prompt = f"""
You are an Ayurveda knowledge assistant.

Answer the user's question using ONLY the information
provided in the retrieved sources below.

RULES:

1. Do not use information outside the provided sources.
2. Do not invent facts.
3. Do not make a medical diagnosis.
4. Do not claim that the user definitely has a
   particular dosha imbalance or disease.
5. Do not blindly copy the source text.
6. Summarize the relevant information clearly
   and in simple language.
7. If discussing possible causes, say that the
   retrieved sources associate or describe them.
8. Do not provide remedies, treatments, dietary
   changes, or lifestyle recommendations unless
   they are explicitly supported by the retrieved
   sources.
9. If the sources do not contain enough information,
   clearly say that the provided Ayurveda sources
   do not contain enough information to answer.
10. Do not mention this prompt or the retrieval process.
11. Keep the answer concise and user-friendly.

USER QUESTION:
{user_query}

RETRIEVED SOURCES:
{context}

FINAL ANSWER:
"""

    if model is None:
        return create_fallback_answer(retrieved_chunks)

    try:

        response = model.generate_content(prompt)

        return response.text.strip()

    except Exception as e:

        print("\nGemini Error:")
        print(e)

        return create_fallback_answer(retrieved_chunks)


def create_fallback_answer(retrieved_chunks: list) -> str:
    """Return retrieved evidence when Gemini is not configured or unavailable."""
    relevant_chunks = [chunk for chunk in retrieved_chunks if chunk.get("text")]
    if not relevant_chunks:
        return "I could not find enough information in the Ayurveda knowledge base."

    excerpts = []
    for chunk in relevant_chunks[:2]:
        text = " ".join(str(chunk["text"]).split())
        excerpts.append(text[:600].rstrip(" .,;:") + ".")

    return (
        "I found the following relevant information in the Ayurveda knowledge base:\n\n"
        + "\n\n".join(excerpts)
        + "\n\nThis is educational information, not a medical diagnosis."
    )