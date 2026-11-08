import json
import re
from pathlib import Path

# -----------------------------------
# Paths
# -----------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FOLDER = BASE_DIR / "data" / "extracted_text"
OUTPUT_FOLDER = BASE_DIR / "data" / "cleaned_text"

OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)


# -----------------------------------
# Cleaning Function
# -----------------------------------

def clean_text(text):

    # Remove leading/trailing spaces
    text = text.strip()

    # Replace multiple spaces with one space
    text = re.sub(r"[ \t]+", " ", text)

    # Replace multiple blank lines with one blank line
    text = re.sub(r"\n\s*\n+", "\n\n", text)

    # Join broken lines inside paragraphs
    text = re.sub(r"(?<!\n)\n(?!\n)", " ", text)

    # Remove non-breaking spaces
    text = text.replace("\xa0", " ")

    # Remove repeated spaces again
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# -----------------------------------
# Process One JSON
# -----------------------------------

def process_json(json_path):

    with open(json_path, "r", encoding="utf-8") as f:
        pages = json.load(f)

    cleaned_pages = []

    for page in pages:

        cleaned_pages.append({
            "document": page["document"],
            "page": page["page"],
            "text": clean_text(page["text"])
        })

    return cleaned_pages


# -----------------------------------
# Main
# -----------------------------------

if __name__ == "__main__":

    json_files = sorted(INPUT_FOLDER.glob("*.json"))

    print(f"Found {len(json_files)} JSON file(s)\n")

    for file in json_files:

        cleaned = process_json(file)

        output_path = OUTPUT_FOLDER / file.name

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(cleaned, f, ensure_ascii=False, indent=2)

        print(f"Cleaned: {file.name}")

    print("\nDone!")