import json
import sys
from pathlib import Path

import faiss
from sentence_transformers import SentenceTransformer

HERITAGE_DIR = Path(__file__).resolve().parent.parent / "heritage_explorer"
sys.path.insert(0, str(HERITAGE_DIR))

from query_enhancer import enhance_query
from answer_generator import generate_answer


# ---------------------------------------
# Load Embedding Model
# ---------------------------------------

print("Loading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2")


# ---------------------------------------
# Load FAISS Index
# ---------------------------------------

print("Loading FAISS index...")

index = faiss.read_index(str(HERITAGE_DIR / "vector_db" / "faiss.index"))


# ---------------------------------------
# Load Metadata
# ---------------------------------------

print("Loading metadata...")

with open(HERITAGE_DIR / "vector_db" / "metadata.json", "r", encoding="utf-8") as f:
    metadata = json.load(f)

print("Knowledge Base Loaded!\n")


# ---------------------------------------
# User Query
# ---------------------------------------

query = input("Ask your question: ")


# ---------------------------------------
# Enhance Query
# ---------------------------------------

print("\nEnhancing query...")

enhanced_query = enhance_query(query)

print("\n" + "=" * 70)
print("Enhanced Query")
print("=" * 70)

print(enhanced_query)


# ---------------------------------------
# Convert Enhanced Query into Embedding
# ---------------------------------------

query_embedding = model.encode(
    [enhanced_query],
    convert_to_numpy=True
).astype("float32")


# ---------------------------------------
# Search FAISS
# ---------------------------------------

TOP_K = 5

distances, indices = index.search(
    query_embedding,
    TOP_K
)


# ---------------------------------------
# Collect Retrieved Chunks
# ---------------------------------------

retrieved_chunks = []

print("\n" + "=" * 70)
print("Top Results")
print("=" * 70)

for rank, idx in enumerate(indices[0], start=1):

    # Safety check
    if idx < 0 or idx >= len(metadata):
        continue

    chunk = metadata[idx]

    retrieved_chunks.append(chunk)

    print(f"\nResult {rank}")
    print("-" * 70)

    print("Distance :", distances[0][rank - 1])
    print("Document :", chunk.get("document"))
    print("Chapter  :", chunk.get("chapter"))
    print("Topic    :", chunk.get("topic"))
    print(
        "Pages    :",
        chunk.get("page_start"),
        "-",
        chunk.get("page_end")
    )

    print("\nText:\n")
    print(chunk["text"][:800])


# ---------------------------------------
# Generate Final Answer
# ---------------------------------------

print("\n" + "=" * 70)
print("Generating Final Answer...")
print("=" * 70)

answer = generate_answer(
    query,
    retrieved_chunks
)


# ---------------------------------------
# Display Final Answer
# ---------------------------------------

print("\n" + "=" * 70)
print("Final Answer")
print("=" * 70)

print(answer)