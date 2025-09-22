import fitz  # PyMuPDF
from typing import Union

def extract_text_from_pdf(pdf_input: Union[str, bytes]) -> str:
    """
    Extract text from a PDF file.
    Accepts either a file path (str) or a file-like object (e.g., Streamlit UploadedFile).
    """
    text = ""
    if hasattr(pdf_input, "read"):
        with fitz.open(stream=pdf_input.read(), filetype="pdf") as doc:
            for page in doc:
                text += page.get_text("text") + "\n"
    else:
        with fitz.open(pdf_input) as doc:
            for page in doc:
                text += page.get_text("text") + "\n"
    return text

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100):
    """
    Splits text into overlapping chunks for semantic search.
    Example: 500 words per chunk with 100-word overlap.
    """
    words = text.split()
    chunks = []
    start = 0

    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap  # shift with overlap

    return chunks

if __name__ == "__main__":
    pdf_path = r"C:\Users\navee\Downloads\Resume (2).pdf"  # replace with your PDF
    content = extract_text_from_pdf(pdf_path)

    # Show raw extraction
    print("\n--- RAW TEXT PREVIEW ---\n")
    print(content[:500])

    # Chunking
    chunks = chunk_text(content, chunk_size=500, overlap=100)

    print(f"\n✅ Total Chunks Created: {len(chunks)}")
    print("\n--- FIRST CHUNK PREVIEW ---\n")
    print(chunks[0])
