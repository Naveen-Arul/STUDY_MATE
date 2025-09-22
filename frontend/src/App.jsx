import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import FileUpload from './components/FileUpload'
import ChatInterface from './components/ChatInterface'
import SessionHistory from './components/SessionHistory'
import LoadingSpinner from './components/LoadingSpinner'

const API_BASE_URL = 'http://localhost:8000'

function App() {
  const [sessionId, setSessionId] = useState(null)
  const [qaHistory, setQaHistory] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')

  const handleFilesUploaded = async (files) => {
    setLoading(true)
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setSessionId(response.data.session_id)
      setUploadedFiles(response.data.uploaded_files)
      setActiveTab('chat')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading files. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionSubmit = async (question) => {
    if (!sessionId) return

    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/api/question`, {
        question,
        session_id: sessionId
      })

      setQaHistory(prev => [...prev, response.data])
    } catch (error) {
      console.error('Question error:', error)
      alert('Error processing question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadSession = async () => {
    if (!sessionId) return

    try {
      const response = await axios.get(`${API_BASE_URL}/api/session/${sessionId}/download`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `studymate_session_${sessionId.slice(0, 8)}.txt`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Download error:', error)
      alert('Error downloading session. Please try again.')
    }
  }

  const resetSession = () => {
    setSessionId(null)
    setQaHistory([])
    setUploadedFiles([])
    setActiveTab('upload')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📘 StudyMate</h1>
        <p>AI-Powered PDF Q&A System</p>
      </header>

      <nav className="tab-nav">
        <button 
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📤 Upload PDFs
        </button>
        <button 
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
          disabled={!sessionId}
        >
          💬 Chat
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
          disabled={!sessionId}
        >
          📚 History
        </button>
      </nav>

      <main className="app-main">
        {loading && <LoadingSpinner />}
        
        {activeTab === 'upload' && (
          <FileUpload 
            onFilesUploaded={handleFilesUploaded}
            uploadedFiles={uploadedFiles}
            loading={loading}
          />
        )}
        
        {activeTab === 'chat' && sessionId && (
          <ChatInterface 
            onQuestionSubmit={handleQuestionSubmit}
            qaHistory={qaHistory}
            loading={loading}
          />
        )}
        
        {activeTab === 'history' && sessionId && (
          <SessionHistory 
            qaHistory={qaHistory}
            uploadedFiles={uploadedFiles}
            onDownload={handleDownloadSession}
            onReset={resetSession}
            sessionId={sessionId}
          />
        )}
      </main>

      {sessionId && (
        <footer className="app-footer">
          <div className="session-info">
            <span>Session: {sessionId.slice(0, 8)}...</span>
            <span>{uploadedFiles.length} file(s) uploaded</span>
            <span>{qaHistory.length} questions asked</span>
          </div>
        </footer>
      )}
    </div>
  )
}

export default App
