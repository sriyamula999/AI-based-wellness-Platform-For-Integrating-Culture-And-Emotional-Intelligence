import json
import os
from pathlib import Path

import faiss
import google.generativeai as genai

from dotenv import load_dotenv
from flask import Blueprint, jsonify, request
from sentence_transformers import SentenceTransformer

from query_enhancer import enhance_query
from answer_generator import generate_answer


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

VECTOR_DIR = BASE_DIR / "vector_db"

INDEX_PATH = VECTOR_DIR / "faiss.index"
METADATA_PATH = VECTOR_DIR / "metadata.json"


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)


# ============================================================
# GEMINI MODEL
# ============================================================

gemini_model = (
    genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-2.0-flash"))
    if GOOGLE_API_KEY
    else None
)


# ============================================================
# LOAD EMBEDDING MODEL
# ============================================================

print("=" * 70)
print("Loading Ayurveda RAG system...")
print("=" * 70)

print("Loading embedding model...")

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

print("Embedding model loaded.")


# ============================================================
# LOAD FAISS INDEX
# ============================================================

if not INDEX_PATH.exists():

    raise FileNotFoundError(
        f"FAISS index not found:\n{INDEX_PATH}"
    )

print("Loading FAISS index...")

faiss_index = faiss.read_index(
    str(INDEX_PATH)
)

print(
    f"FAISS index loaded. "
    f"Vectors: {faiss_index.ntotal}"
)


# ============================================================
# LOAD METADATA
# ============================================================

if not METADATA_PATH.exists():

    raise FileNotFoundError(
        f"Metadata file not found:\n{METADATA_PATH}"
    )

print("Loading metadata...")

with open(
    METADATA_PATH,
    "r",
    encoding="utf-8"
) as f:

    metadata = json.load(f)


print(
    f"Metadata loaded. "
    f"Chunks: {len(metadata)}"
)

print("=" * 70)
print("Ayurveda RAG system ready!")
print("=" * 70)


# ============================================================
# FLASK BLUEPRINT
# ============================================================

rag_api = Blueprint(
    "rag_api",
    __name__
)


# ============================================================
# RETRIEVE CHUNKS
# ============================================================

def retrieve_chunks(
    user_query,
    top_k=5
):

    # --------------------------------------------------------
    # STEP 1: ENHANCE QUERY
    # --------------------------------------------------------

    enhanced_query = enhance_query(
        user_query
    )

    print("\n" + "=" * 70)
    print("Original Query")
    print("=" * 70)
    print(user_query)

    print("\n" + "=" * 70)
    print("Enhanced Query")
    print("=" * 70)
    print(enhanced_query)


    # --------------------------------------------------------
    # STEP 2: CREATE EMBEDDING
    # --------------------------------------------------------

    query_embedding = embedding_model.encode(
        [enhanced_query],
        convert_to_numpy=True
    ).astype("float32")


    # --------------------------------------------------------
    # STEP 3: SEARCH FAISS
    # --------------------------------------------------------

    distances, indices = faiss_index.search(
        query_embedding,
        top_k
    )


    # --------------------------------------------------------
    # STEP 4: GET METADATA
    # --------------------------------------------------------

    retrieved_chunks = []

    for rank, idx in enumerate(
        indices[0],
        start=1
    ):

        if idx < 0 or idx >= len(metadata):
            continue

        chunk = dict(
            metadata[idx]
        )

        chunk["_rank"] = rank

        chunk["_distance"] = float(
            distances[0][rank - 1]
        )

        retrieved_chunks.append(
            chunk
        )


    # --------------------------------------------------------
    # PRINT RETRIEVED RESULTS
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("Retrieved Sources")
    print("=" * 70)

    for chunk in retrieved_chunks:

        print(
            f"\nRank: {chunk['_rank']}"
        )

        print(
            f"Distance: {chunk['_distance']}"
        )

        print(
            f"Document: "
            f"{chunk.get('document', '')}"
        )

        print(
            f"Chapter: "
            f"{chunk.get('chapter', '')}"
        )

        print(
            f"Topic: "
            f"{chunk.get('topic', '')}"
        )

        print(
            f"Pages: "
            f"{chunk.get('page_start', '')} - "
            f"{chunk.get('page_end', '')}"
        )


    return (
        enhanced_query,
        retrieved_chunks
    )


# ============================================================
# GENERATE FOLLOW-UP QUESTIONS
# ============================================================

def generate_followups(
    user_query,
    answer
):

    prompt = f"""
You generate follow-up questions for an
Ayurveda knowledge assistant.

User question:
{user_query}

Answer:
{answer}

Generate exactly 3 short and natural
follow-up questions related to the same topic.

Rules:

1. Questions only.
2. Do not answer the questions.
3. Do not diagnose the user.
4. Do not prescribe remedies.
5. Do not prescribe treatments.
6. Keep each question under 12 words.
7. Return ONLY a JSON array of strings.

Example:

[
    "What are the main Ayurvedic concepts involved?",
    "What symptoms are commonly associated with this?",
    "What does Ayurveda say about this condition?"
]
"""

    if gemini_model is None:
        return []

    try:

        response = gemini_model.generate_content(
            prompt
        )

        text = response.text.strip()


        # ----------------------------------------------------
        # Remove markdown code fences if Gemini adds them
        # ----------------------------------------------------

        if text.startswith("```"):

            text = text.replace(
                "```json",
                ""
            )

            text = text.replace(
                "```",
                ""
            )

            text = text.strip()


        followups = json.loads(
            text
        )


        if not isinstance(
            followups,
            list
        ):

            return []


        return [
            str(question).strip()
            for question in followups[:3]
            if str(question).strip()
        ]


    except Exception as e:

        print(
            "\nFollow-up generation error:"
        )

        print(e)

        return []


# ============================================================
# CREATE SOURCE INFORMATION
# ============================================================

def create_sources(
    retrieved_chunks
):

    sources = []

    for chunk in retrieved_chunks:

        sources.append({

            "doc": chunk.get(
                "document",
                "Ayurveda source"
            ),

            "chapter": chunk.get(
                "chapter",
                ""
            ),

            "topic": chunk.get(
                "topic",
                ""
            ),

            "page": chunk.get(
                "page_start",
                ""
            ),

            "page_end": chunk.get(
                "page_end",
                ""
            ),

            "snippet": str(
                chunk.get(
                    "text",
                    ""
                )
            )[:240]
        })

    return sources


# ============================================================
# MAIN RAG API
# ============================================================

@rag_api.route(
    "/api/ask",
    methods=["POST"]
)
def ask():

    # --------------------------------------------------------
    # GET USER QUERY
    # --------------------------------------------------------

    data = request.get_json(
        silent=True
    ) or {}

    user_query = str(
        data.get(
            "query",
            ""
        )
    ).strip()


    # --------------------------------------------------------
    # EMPTY QUERY
    # --------------------------------------------------------

    if not user_query:

        return jsonify({

            "error":
                "Please enter a question."

        }), 400


    try:

        # ====================================================
        # STEP 1 + 2 + 3: ENHANCE + EMBED + RETRIEVE
        # ====================================================

        (
            enhanced_query,
            retrieved_chunks
        ) = retrieve_chunks(
            user_query,
            top_k=5
        )


        # ====================================================
        # NO RESULTS
        # ====================================================

        if not retrieved_chunks:

            return jsonify({

                "answer":
                    "I couldn't find relevant "
                    "information in the Ayurveda "
                    "knowledge base.",

                "sources": [],

                "followups": [],

                "enhanced_query":
                    enhanced_query

            })


        # ====================================================
        # STEP 4: GENERATE ANSWER
        # ====================================================

        print("\n" + "=" * 70)
        print("Generating final answer...")
        print("=" * 70)

        answer = generate_answer(
            user_query,
            retrieved_chunks
        )


        # ====================================================
        # STEP 5: CREATE SOURCES
        # ====================================================

        sources = create_sources(
            retrieved_chunks
        )


        # ====================================================
        # STEP 6: GENERATE FOLLOW-UPS
        # ====================================================

        print("\n" + "=" * 70)
        print("Generating follow-up questions...")
        print("=" * 70)

        followups = generate_followups(
            user_query,
            answer
        )


        # ====================================================
        # FINAL RESPONSE
        # ====================================================

        print("\n" + "=" * 70)
        print("RAG RESPONSE READY")
        print("=" * 70)

        return jsonify({

            "answer": answer,

            "sources": sources,

            "followups": followups,

            "enhanced_query":
                enhanced_query

        })


    except Exception as e:

        # ----------------------------------------------------
        # SERVER ERROR
        # ----------------------------------------------------

        print("\n" + "=" * 70)
        print("RAG API ERROR")
        print("=" * 70)

        print(e)

        return jsonify({

            "error":
                "The Ayurveda knowledge service "
                "could not process your question."

        }), 500