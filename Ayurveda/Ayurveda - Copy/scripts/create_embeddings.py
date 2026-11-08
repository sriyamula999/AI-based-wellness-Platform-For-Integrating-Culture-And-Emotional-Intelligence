import os
import json
import numpy as np
from sentence_transformers import SentenceTransformer

print("=" * 60)
print("Loading Embedding Model...")
print("=" * 60)

model = SentenceTransformer("all-MiniLM-L6-v2")

print("Model Loaded Successfully!\n")

# -----------------------------------------------------
# Folder containing chunk json files
# -----------------------------------------------------

CHUNK_FOLDER = "../data/chunks"

all_chunks = []

# Read every json file
for file in os.listdir(CHUNK_FOLDER):

    if file.endswith(".json"):

        filepath = os.path.join(CHUNK_FOLDER, file)

        print(f"Reading {file}")

        with open(filepath, "r", encoding="utf-8") as f:

            data = json.load(f)

            all_chunks.extend(data)

print("\nTotal Chunks :", len(all_chunks))

# -----------------------------------------------------
# Extract only text
# -----------------------------------------------------

texts = [chunk["text"] for chunk in all_chunks]

print("\nGenerating Embeddings...\n")

embeddings = model.encode(
    texts,
    batch_size=32,
    convert_to_numpy=True,
    show_progress_bar=True
)

print("\nEmbeddings Generated Successfully!")

# -----------------------------------------------------
# Save
# -----------------------------------------------------

OUTPUT_FOLDER = "../vector_db"

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

np.save(
    os.path.join(OUTPUT_FOLDER, "embeddings.npy"),
    embeddings
)

with open(
    os.path.join(OUTPUT_FOLDER, "metadata.json"),
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        all_chunks,
        f,
        indent=4,
        ensure_ascii=False
    )

print("\nSaved Successfully!")

print("\nEmbedding Shape :", embeddings.shape)