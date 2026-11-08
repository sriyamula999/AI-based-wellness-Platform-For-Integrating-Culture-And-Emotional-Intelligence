import json
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter

# -------------------------------------------------
# Paths
# -------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FOLDER = BASE_DIR / "data" / "structured_sections"
OUTPUT_FOLDER = BASE_DIR / "data" / "chunks"

OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)

# -------------------------------------------------
# Recursive Splitter
# -------------------------------------------------

splitter = RecursiveCharacterTextSplitter(

    chunk_size=800,
    chunk_overlap=150,

    separators=[
        "\n\n",
        "\n",
        ". ",
        " ",
        ""
    ]

)

# -------------------------------------------------
# Chunk one document
# -------------------------------------------------

def chunk_document(sections):

    chunks = []

    chunk_id = 1

    for section in sections:

        split_chunks = splitter.split_text(section["text"])

        for idx, chunk in enumerate(split_chunks):

            chunks.append({

                "chunk_id": chunk_id,

                "chunk_index": idx,

                "document": section["document"],

                "chapter": section["chapter"],

                "topic": section["topic"],

                "subtopic": section["subtopic"],

                "page_start": section["page_start"],

                "page_end": section["page_end"],

                "path": [

                    section["chapter"],

                    section["topic"],

                    section["subtopic"]

                ],

                "character_count": len(chunk),

                "word_count": len(chunk.split()),

                "text": chunk

            })

            chunk_id += 1

    return chunks


# -------------------------------------------------
# Main
# -------------------------------------------------

if __name__ == "__main__":

    files = sorted(INPUT_FOLDER.glob("*.json"))

    print(f"Found {len(files)} structured document(s).\n")

    total_chunks = 0

    for file in files:

        with open(file, encoding="utf-8") as f:

            sections = json.load(f)

        chunks = chunk_document(sections)

        total_chunks += len(chunks)

        output_path = OUTPUT_FOLDER / file.name

        with open(output_path, "w", encoding="utf-8") as f:

            json.dump(
                chunks,
                f,
                indent=2,
                ensure_ascii=False
            )

        print(f"✓ {file.name} → {len(chunks)} chunks")

    print("\nDone.")
    print(f"Total chunks created : {total_chunks}")