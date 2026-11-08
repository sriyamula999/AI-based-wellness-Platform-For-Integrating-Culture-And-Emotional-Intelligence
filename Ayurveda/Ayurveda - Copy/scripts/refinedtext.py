import json
import re
from pathlib import Path

# -------------------------------------------------
# Paths
# -------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FOLDER = BASE_DIR / "data" / "cleaned_text"
OUTPUT_FOLDER = BASE_DIR / "data" / "refined_text"

OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)


# -------------------------------------------------
# Remove Noise
# -------------------------------------------------

def refine_text(text):

    # ----------------------------------------
    # Remove URLs
    # ----------------------------------------
    text = re.sub(r'https?://\S+|www\.\S+', '', text)

    # ----------------------------------------
    # Remove Email IDs
    # ----------------------------------------
    text = re.sub(r'\S+@\S+', '', text)

    # ----------------------------------------
    # Remove ISBN
    # ----------------------------------------
    text = re.sub(r'ISBN[:\s0-9\-]+', '', text, flags=re.IGNORECASE)

    # ----------------------------------------
    # Remove Copyright symbol lines
    # ----------------------------------------
    text = re.sub(r'©.*', '', text)

    # ----------------------------------------
    # Remove Figure captions
    # ----------------------------------------
    text = re.sub(r'Fig\.\s*\d+.*', '', text, flags=re.IGNORECASE)

    # ----------------------------------------
    # Remove page numbers only
    # Example:
    # 1
    # XV
    # XVI
    # ----------------------------------------
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)

    text = re.sub(
        r'^\s*[IVXLCDM]+\s*$',
        '',
        text,
        flags=re.MULTILINE
    )

    # ----------------------------------------
    # Remove strange OCR symbols
    # Keep English letters, digits,
    # punctuation and Sanskrit apostrophes
    # ----------------------------------------
    text = re.sub(
        r'[^A-Za-z0-9\s.,;:!?()\-\'"/%&\n]',
        ' ',
        text
    )

    # ----------------------------------------
    # Remove multiple spaces
    # ----------------------------------------
    text = re.sub(r'[ \t]+', ' ', text)

    # ----------------------------------------
    # Remove extra blank lines
    # ----------------------------------------
    text = re.sub(r'\n\s*\n+', '\n\n', text)

    return text.strip()


# -------------------------------------------------
# Skip useless pages
# -------------------------------------------------

USELESS_WORDS = [

    "FOREWORD",
    "PREFACE",
    "ACKNOWLEDGEMENT",
    "CONTENTS",
    "LIST OF FIGURES",
    "ABBREVIATIONS",
    "GLOSSARY",
    "SUGGESTIVE READING",
]


def is_useful(text):

    upper = text.upper()

    for word in USELESS_WORDS:

        if upper.startswith(word):

            return False

    return True


# -------------------------------------------------
# Process JSON
# -------------------------------------------------

def process_json(path):

    with open(path, encoding="utf-8") as f:
        pages = json.load(f)

    refined = []

    for page in pages:

        cleaned = refine_text(page["text"])

        if not cleaned:
            continue

        if not is_useful(cleaned):
            continue

        page["text"] = cleaned
        refined.append(page)

    return refined


# -------------------------------------------------
# Main
# -------------------------------------------------

if __name__ == "__main__":

    files = sorted(INPUT_FOLDER.glob("*.json"))

    print(f"Found {len(files)} cleaned JSON files.\n")

    total_pages = 0

    for file in files:

        refined = process_json(file)

        output_file = OUTPUT_FOLDER / file.name

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(refined, f, indent=2, ensure_ascii=False)

        total_pages += len(refined)

        print(f"✓ {file.name}")

    print("\nDone.")
    print(f"Total pages kept : {total_pages}")