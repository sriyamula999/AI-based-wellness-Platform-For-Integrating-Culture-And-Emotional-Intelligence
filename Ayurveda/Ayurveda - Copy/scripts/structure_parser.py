import json
import re
from pathlib import Path

# -------------------------------------------------
# Paths
# -------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FOLDER = BASE_DIR / "data" / "refined_text"
OUTPUT_FOLDER = BASE_DIR / "data" / "structured_sections"

OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)


# -------------------------------------------------
# Regex Patterns
# -------------------------------------------------

CHAPTER_PATTERN = re.compile(
    r"^Chapter\s+\d+.*",
    re.IGNORECASE
)

TOPIC_PATTERN = re.compile(
    r"^\d+\.\d+\s+.+"
)

SUBTOPIC_PATTERN = re.compile(
    r"^\d+\.\d+\.\d+\s+.+"
)


# -------------------------------------------------
# Parse one document
# -------------------------------------------------

def parse_document(pages):

    sections = []

    current_chapter = None
    current_topic = None
    current_subtopic = None

    current_text = []

    page_start = None

    for page in pages:

        lines = page["text"].split("\n")

        for line in lines:

            line = line.strip()

            if not line:
                continue

            # -------------------------
            # Chapter
            # -------------------------

            if CHAPTER_PATTERN.match(line):

                if current_text:

                    sections.append({

                        "document": page["document"],
                        "chapter": current_chapter,
                        "topic": current_topic,
                        "subtopic": current_subtopic,
                        "page_start": page_start,
                        "page_end": page["page"],
                        "text": " ".join(current_text)

                    })

                    current_text = []

                current_chapter = line
                current_topic = None
                current_subtopic = None
                page_start = page["page"]

                continue

            # -------------------------
            # Subtopic
            # -------------------------

            if SUBTOPIC_PATTERN.match(line):

                if current_text:

                    sections.append({

                        "document": page["document"],
                        "chapter": current_chapter,
                        "topic": current_topic,
                        "subtopic": current_subtopic,
                        "page_start": page_start,
                        "page_end": page["page"],
                        "text": " ".join(current_text)

                    })

                    current_text = []

                current_subtopic = line
                page_start = page["page"]

                continue

            # -------------------------
            # Topic
            # -------------------------

            if TOPIC_PATTERN.match(line):

                if current_text:

                    sections.append({

                        "document": page["document"],
                        "chapter": current_chapter,
                        "topic": current_topic,
                        "subtopic": current_subtopic,
                        "page_start": page_start,
                        "page_end": page["page"],
                        "text": " ".join(current_text)

                    })

                    current_text = []

                current_topic = line
                current_subtopic = None
                page_start = page["page"]

                continue

            current_text.append(line)

    # Save final section

    if current_text:

        sections.append({

            "document": page["document"],
            "chapter": current_chapter,
            "topic": current_topic,
            "subtopic": current_subtopic,
            "page_start": page_start,
            "page_end": pages[-1]["page"],
            "text": " ".join(current_text)

        })

    return sections


# -------------------------------------------------
# Main
# -------------------------------------------------

if __name__ == "__main__":

    files = sorted(INPUT_FOLDER.glob("*.json"))

    print(f"Found {len(files)} refined documents.\n")

    for file in files:

        with open(file, encoding="utf-8") as f:
            pages = json.load(f)

        sections = parse_document(pages)

        output = OUTPUT_FOLDER / file.name

        with open(output, "w", encoding="utf-8") as f:
            json.dump(
                sections,
                f,
                indent=2,
                ensure_ascii=False
            )

        print(f"✓ {file.name} -> {len(sections)} sections")

    print("\nFinished.")
