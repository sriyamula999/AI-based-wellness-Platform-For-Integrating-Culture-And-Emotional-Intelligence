import fitz
import json
from pathlib import Path

# -------------------------------------------------
# Project Paths
# -------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_PDF_FOLDER = BASE_DIR / "data" / "raw_pdfs/references"
OUTPUT_FOLDER = BASE_DIR / "data" / "extracted_text"

OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)


# -------------------------------------------------
# Extract text from ONE PDF
# -------------------------------------------------

def extract_pdf(pdf_path: Path):
    document = fitz.open(pdf_path)

    pages = []
    for page_number, page in enumerate(document, start=1):
        text = page.get_text()

        # Skip blank pages
        if not text.strip():
            continue

        pages.append(
            {
                "document": pdf_path.stem,
                "page": page_number,
                "text": text,
            }
        )

    document.close()
    return pages


def save_pages_json(pages, output_path: Path):
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(pages, f, ensure_ascii=False, indent=2)


# -------------------------------------------------
# Extract ALL PDFs and save as JSON
# -------------------------------------------------

if __name__ == "__main__":
    pdf_files = sorted(RAW_PDF_FOLDER.rglob("*.pdf"))

    if not pdf_files:
        print("❌ No PDF files found!")
    else:
        print(f"Found {len(pdf_files)} PDF(s) in {RAW_PDF_FOLDER}")
        total_pages = 0

        for pdf_path in pdf_files:
            print(f"\nExtracting: {pdf_path.name}")
            pages = extract_pdf(pdf_path)
            total_pages += len(pages)

            output_path = OUTPUT_FOLDER / f"{pdf_path.stem}.json"
            save_pages_json(pages, output_path)

            print(f"  Saved {len(pages)} pages to {output_path}")

        print(f"\nDone. JSON files written to: {OUTPUT_FOLDER}")
        print(f"Total extracted pages: {total_pages}")