from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

class EmbeddingIndex:
    def __init__(self, model_name="all-MiniLM-L6-v2"):
        # Load embedding model
        self.model = SentenceTransformer(model_name)
        self.index = None
        self.chunks = []  # store original chunks

    def build_index(self, chunks):
        """
        Build FAISS index from text chunks
        """
        self.chunks = chunks
        embeddings = self.model.encode(chunks, convert_to_numpy=True)

        # Normalize for cosine similarity
        embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)

        # Create FAISS index
        dim = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dim)  # inner product (cosine similarity)
        self.index.add(embeddings)

        print(f"✅ FAISS index built with {len(chunks)} chunks, dim={dim}")

    def query(self, question, top_k=3):
        """
        Search most relevant chunks for a question
        """
        q_emb = self.model.encode([question], convert_to_numpy=True)
        q_emb = q_emb / np.linalg.norm(q_emb, axis=1, keepdims=True)

        scores, indices = self.index.search(q_emb, top_k)
        results = [(self.chunks[i], float(scores[0][j])) for j, i in enumerate(indices[0])]
        return results

if __name__ == "__main__":
    # Sample test
    from pdf_loader import extract_text_from_pdf, chunk_text

    pdf_path = r"C:\Users\navee\Downloads\Resume (2).pdf"
    text = extract_text_from_pdf(pdf_path)
    chunks = chunk_text(text)

    emb_index = EmbeddingIndex()
    emb_index.build_index(chunks)

    query = "What are the skills of this person?"
    results = emb_index.query(query, top_k=2)

    print("\n🔍 Query:", query)
    for idx, (chunk, score) in enumerate(results):
        print(f"\nResult {idx+1} (score={score:.4f}):\n{chunk[:400]}...")
