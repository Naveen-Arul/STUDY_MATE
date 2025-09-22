import warnings
warnings.filterwarnings("ignore", message=".*torch.classes.*")
import streamlit as st
from src.pdf_loader import extract_text_from_pdf, chunk_text
from src.embeddings import EmbeddingIndex
from src.llm_client import generate_answer

st.set_page_config(page_title="StudyMate", layout="wide")

st.title("📘 StudyMate - AI-Powered PDF Q&A")

# Upload PDFs
uploaded_files = st.file_uploader("Upload one or more PDFs", type="pdf", accept_multiple_files=True)

if uploaded_files:
    all_chunks = []

    # Extract & chunk text from all uploaded PDFs
    for uploaded_file in uploaded_files:
        text = extract_text_from_pdf(uploaded_file)
        chunks = chunk_text(text)
        all_chunks.extend(chunks)

    # Build FAISS index
    emb_index = EmbeddingIndex()
    emb_index.build_index(all_chunks)

    # Ask a question
    st.subheader("Ask a Question")
    question = st.text_input("Enter your question here:")

    if st.button("Get Answer") and question.strip():
        results = emb_index.query(question, top_k=3)
        retrieved_chunks = [chunk for chunk, score in results]
        answer = generate_answer(question, retrieved_chunks)

        st.markdown("### 🤖 Answer")
        st.write(answer)

        st.markdown("### 📚 Referenced Chunks")
        for idx, (chunk, score) in enumerate(results):
            with st.expander(f"Chunk {idx+1} (score={score:.4f})"):
                st.write(chunk)
