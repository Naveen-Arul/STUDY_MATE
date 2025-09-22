from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import uuid
import json
import os
from datetime import datetime
import tempfile

# Import your existing modules
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from src.pdf_loader import extract_text_from_pdf, chunk_text
from src.embeddings import EmbeddingIndex
from src.llm_client import generate_answer

app = FastAPI(title="StudyMate API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for sessions (in production, use a database)
sessions = {}

class QuestionRequest(BaseModel):
    question: str
    session_id: str

class SessionResponse(BaseModel):
    session_id: str
    created_at: str
    qa_history: List[dict]
    uploaded_files: List[str]

@app.get("/")
async def root():
    return {"message": "StudyMate API is running"}

@app.post("/api/upload")
async def upload_pdfs(files: List[UploadFile] = File(...)):
    """Upload one or more PDF files and create a new session"""
    try:
        session_id = str(uuid.uuid4())
        session_data = {
            "id": session_id,
            "created_at": datetime.now().isoformat(),
            "qa_history": [],
            "uploaded_files": [],
            "chunks": [],
            "embedding_index": None
        }
        
        all_chunks = []
        uploaded_filenames = []
        
        for file in files:
            if not file.filename.endswith('.pdf'):
                raise HTTPException(status_code=400, detail=f"File {file.filename} is not a PDF")
            
            # Read file content
            content = await file.read()
            
            # Extract text and chunk it
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_file:
                tmp_file.write(content)
                tmp_file_path = tmp_file.name
            
            try:
                text = extract_text_from_pdf(tmp_file_path)
                chunks = chunk_text(text)
                all_chunks.extend(chunks)
                uploaded_filenames.append(file.filename)
            finally:
                os.unlink(tmp_file_path)  # Clean up temp file
        
        # Build FAISS index
        if all_chunks:
            emb_index = EmbeddingIndex()
            emb_index.build_index(all_chunks)
            session_data["embedding_index"] = emb_index
            session_data["chunks"] = all_chunks
        
        session_data["uploaded_files"] = uploaded_filenames
        sessions[session_id] = session_data
        
        return {
            "session_id": session_id,
            "message": f"Successfully uploaded {len(files)} PDF(s) with {len(all_chunks)} chunks",
            "uploaded_files": uploaded_filenames
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDFs: {str(e)}")

@app.post("/api/question")
async def ask_question(request: QuestionRequest):
    """Ask a question about the uploaded PDFs"""
    try:
        session_id = request.session_id
        question = request.question.strip()
        
        if not question:
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        if session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session_data = sessions[session_id]
        embedding_index = session_data["embedding_index"]
        
        if not embedding_index:
            raise HTTPException(status_code=400, detail="No PDFs uploaded in this session")
        
        # Retrieve relevant chunks
        results = embedding_index.query(question, top_k=3)
        retrieved_chunks = [chunk for chunk, score in results]
        
        # Generate answer
        answer = generate_answer(question, retrieved_chunks)
        
        # Create Q&A entry
        qa_entry = {
            "id": str(uuid.uuid4()),
            "question": question,
            "answer": answer,
            "references": [{"chunk": chunk, "score": float(score)} for chunk, score in results],
            "timestamp": datetime.now().isoformat()
        }
        
        # Add to session history
        session_data["qa_history"].append(qa_entry)
        
        return qa_entry
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

@app.get("/api/session/{session_id}")
async def get_session(session_id: str):
    """Get session details and Q&A history"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = sessions[session_id]
    return {
        "session_id": session_data["id"],
        "created_at": session_data["created_at"],
        "uploaded_files": session_data["uploaded_files"],
        "qa_history": session_data["qa_history"]
    }

@app.get("/api/sessions")
async def list_sessions():
    """List all active sessions"""
    session_list = []
    for session_id, session_data in sessions.items():
        session_list.append({
            "session_id": session_data["id"],
            "created_at": session_data["created_at"],
            "uploaded_files": session_data["uploaded_files"],
            "qa_count": len(session_data["qa_history"])
        })
    return {"sessions": session_list}

@app.get("/api/session/{session_id}/download")
async def download_session(session_id: str):
    """Download Q&A history as a text file"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = sessions[session_id]
    
    # Create formatted text content
    content = f"StudyMate Q&A Session Report\n"
    content += f"=" * 50 + "\n\n"
    content += f"Session ID: {session_data['id']}\n"
    content += f"Created: {session_data['created_at']}\n"
    content += f"Uploaded Files: {', '.join(session_data['uploaded_files'])}\n"
    content += f"Total Questions: {len(session_data['qa_history'])}\n\n"
    
    for i, qa in enumerate(session_data['qa_history'], 1):
        content += f"Question {i}: {qa['question']}\n"
        content += f"Answer: {qa['answer']}\n"
        content += f"Timestamp: {qa['timestamp']}\n"
        content += f"References ({len(qa['references'])} chunks):\n"
        for j, ref in enumerate(qa['references'], 1):
            content += f"  {j}. Score: {ref['score']:.4f}\n"
            content += f"     {ref['chunk'][:200]}...\n"
        content += "\n" + "-" * 50 + "\n\n"
    
    # Save to temporary file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as tmp_file:
        tmp_file.write(content)
        tmp_file_path = tmp_file.name
    
    return FileResponse(
        tmp_file_path,
        media_type='text/plain',
        filename=f"studymate_session_{session_id[:8]}.txt",
        background=None
    )

@app.delete("/api/session/{session_id}")
async def delete_session(session_id: str):
    """Delete a session and its data"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    del sessions[session_id]
    return {"message": "Session deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)