import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai


# --------------------------------------------------
# Load Environment Variables
# --------------------------------------------------

env_path = Path(__file__).resolve().parent / ".env"

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
# Query Enhancement Prompt
# --------------------------------------------------

SYSTEM_PROMPT = """
You are a query rewriting component for an Ayurveda
Retrieval-Augmented Generation (RAG) system.

Your ONLY job is to rewrite the user's question into
a better search query for retrieving relevant information
from an Ayurveda knowledge base.

STRICT RULES:

1. Do NOT answer the user's question.
2. Do NOT provide remedies.
3. Do NOT provide treatments.
4. Do NOT provide dietary advice.
5. Do NOT provide lifestyle advice.
6. Do NOT make a diagnosis.
7. Do NOT state that the user has a particular dosha
   imbalance or disease.
8. Do NOT explain Ayurvedic concepts.
9. Preserve the user's original intent.
10. Expand vague expressions into useful search terms.
11. Add relevant symptoms and synonyms.
12. Add relevant Ayurvedic terminology only when
    naturally related to the user's query.
13. The Ayurvedic terminology is only for improving
    document retrieval.
14. Return ONLY the rewritten search query.
15. Keep the rewritten query under 80 words.

Example:

User:
"I feel sleepy and tired all the time."

Good:
"Persistent fatigue, excessive daytime sleepiness,
lethargy, drowsiness, Tandra, Alasya, Klama,
Ayurvedic causes associated with these symptoms."

Bad:
"Drink ginger tea, exercise, improve digestion,
and follow a Kapha-balancing diet."

Remember:
You are creating a SEARCH QUERY, not an ANSWER.
"""


# --------------------------------------------------
# Query Enhancer Function
# --------------------------------------------------

def enhance_query(user_query: str) -> str:

    prompt = f"""
{SYSTEM_PROMPT}

User Query:
{user_query}

Rewritten Search Query:
"""

    if model is None:
        return user_query

    try:

        response = model.generate_content(prompt)

        return response.text.strip()

    except Exception as e:

        print("\nGemini Error:")
        print(e)

        # If Gemini fails, use original query
        return user_query


# --------------------------------------------------
# Testing
# --------------------------------------------------

if __name__ == "__main__":

    print("=" * 70)
    print("Ayurveda Query Enhancer")
    print("=" * 70)

    while True:

        query = input("\nAsk your question: ")

        if query.lower() in ["exit", "quit"]:
            break

        enhanced = enhance_query(query)

        print("\nEnhanced Query")
        print("-" * 70)
        print(enhanced)