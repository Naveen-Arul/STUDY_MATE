# StudyMate - AI-Powered PDF Q&A System

A modern RAG (Retrieval-Augmented Generation) system that allows students to upload PDF documents and ask natural language questions to get contextual answers with source references.

## Features

- **PDF Upload & Processing**: Upload multiple PDF files with drag & drop support
- **AI-Powered Q&A**: Ask questions in natural language and get contextual answers
- **Source References**: View relevant chunks from documents that support each answer
- **Session Management**: Track conversation history and download Q&A logs
- **Modern UI**: Beautiful, responsive React interface with real-time feedback
- **Chat Interface**: Interactive chat-like interface for natural conversations
- **Session History**: Download complete Q&A sessions for study reference

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework for the REST API
- **Sentence Transformers**: For generating semantic embeddings (`all-MiniLM-L6-v2`)
- **FAISS**: Vector database for semantic search
- **Groq API**: LLaMA 3.1 8B for answer generation
- **PyMuPDF**: PDF text extraction
- **Python-multipart**: File upload handling

### Frontend
- **React 18**: Modern JavaScript framework
- **Vite**: Fast development build tool
- **Axios**: HTTP client for API calls
- **Modern CSS**: Custom styling with gradients and animations

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- Groq API key

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Naveen-Arul/STUDY_MATE.git
   cd STUDY_MATE
   ```

2. **Create virtual environment**
   ```bash
   python -m venv study
   # On Windows:
   study\\Scripts\\activate
   # On macOS/Linux:
   source study/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Create .env file in project root
   echo \"GROQ_API_KEY=your_groq_api_key_here\" > .env
   ```

5. **Start the backend server**
   ```bash
   python backend/main.py
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## Usage

1. **Upload PDFs**: 
   - Drag and drop PDF files or click to browse
   - Supports multiple file upload
   - Files are processed and indexed automatically

2. **Ask Questions**:
   - Switch to Chat tab after successful upload
   - Type natural language questions about your documents
   - Get AI-generated answers with source references

3. **View History**:
   - Check the History tab to see all Q&A pairs
   - Download complete session as a text file
   - Start new sessions as needed

## API Endpoints

- `POST /api/upload` - Upload PDF files and create session
- `POST /api/question` - Ask a question about uploaded documents
- `GET /api/session/{session_id}` - Get session details
- `GET /api/session/{session_id}/download` - Download Q&A history
- `DELETE /api/session/{session_id}` - Delete session

## Project Structure

```
STUDY_MATE/
├── backend/
│   └── main.py              # FastAPI server
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx         # Main application
│   │   └── main.jsx        # Entry point
│   └── package.json
├── src/
│   ├── embeddings.py       # FAISS indexing
│   ├── llm_client.py       # Groq API integration
│   ├── pdf_loader.py       # PDF processing
│   └── retriever.py        # RAG pipeline
├── requirements.txt        # Python dependencies
└── .env                   # Environment variables
```

## Use Cases

- **Academic Study**: Upload textbooks and research papers for concept clarification
- **Research**: Query multiple papers simultaneously for comprehensive insights
- **Exam Preparation**: Create Q&A sessions for viva and open-book examinations
- **Document Analysis**: Extract specific information from large document collections

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Sentence Transformers team for embedding models
- Groq for fast LLaMA inference
- FAISS team for vector search capabilities
- React and FastAPI communities

---

**Note**: Make sure to get your free Groq API key from [https://console.groq.com/](https://console.groq.com/) and add it to your `.env` file before running the application.