import os
import faiss
import numpy as np

# ---------------------------------------
# Load Embeddings
# ---------------------------------------

print("=" * 60)
print("Loading Embeddings...")
print("=" * 60)

embeddings = np.load("../vector_db/embeddings.npy")

print(f"Loaded {embeddings.shape[0]} embeddings")

# ---------------------------------------
# Create FAISS Index
# ---------------------------------------

dimension = embeddings.shape[1]

print(f"Embedding Dimension : {dimension}")

index = faiss.IndexFlatL2(dimension)

print("\nCreating Index...")

index.add(
    embeddings.astype("float32")
)

print("Vectors Added Successfully!")

# ---------------------------------------
# Save Index
# ---------------------------------------

faiss.write_index(
    index,
    "../vector_db/faiss.index"
)

print("\nFAISS Index Saved!")

print("\nTotal vectors in index :", index.ntotal)