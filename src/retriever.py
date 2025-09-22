from pdf_loader import extract_text_from_pdf, chunk_text
from embeddings import EmbeddingIndex
from llm_client import generate_answer

def answer_question_from_pdf(pdf_path, question, top_k=3):
    # Step 1: Extract + chunk text
    text = extract_text_from_pdf(pdf_path)
    chunks = chunk_text(text)

    # Step 2: Build FAISS index
    emb_index = EmbeddingIndex()
    emb_index.build_index(chunks)

    # Step 3: Retrieve top-k relevant chunks
    results = emb_index.query(question, top_k=top_k)
    retrieved_chunks = [chunk for chunk, score in results]

    # Step 4: Generate LLM answer using Groq
    final_answer = generate_answer(question, retrieved_chunks)

    return final_answer, results


if __name__ == "__main__":
    pdf_path = r"C:\Users\navee\Downloads\Resume (2).pdf"
    question = "What are the skills of this person?"

    answer, refs = answer_question_from_pdf(pdf_path, question, top_k=2)

    print("\n🔍 Question:", question)
    print("🤖 Answer:", answer)

    print("\n📚 Referenced Chunks:")
    for idx, (chunk, score) in enumerate(refs):
        print(f"\n--- Chunk {idx+1} (score={score:.4f}) ---\n{chunk[:400]}...")
