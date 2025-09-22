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
  const [chatLoading, setChatLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const showError = (message) => {
    setError(message)
    setSuccess(null)
  }

  const showSuccess = (message) => {
    setSuccess(message)
    setError(null)
  }

  const handleFilesUploaded = async (files) => {
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 second timeout
      })

      setSessionId(response.data.session_id)
      setUploadedFiles(response.data.uploaded_files)
      setActiveTab('chat')
      showSuccess(`Successfully uploaded ${files.length} PDF(s) and processed ${response.data.message.split(' ').pop()} chunks!`)
    } catch (error) {
      console.error('Upload error:', error)
      if (error.code === 'ECONNREFUSED') {
        showError('Cannot connect to the server. Please make sure the backend is running on port 8000.')
      } else if (error.response?.status === 400) {
        showError(error.response.data.detail || 'Invalid file format. Please upload PDF files only.')
      } else if (error.response?.status >= 500) {
        showError('Server error occurred. Please try again later.')
      } else {
        showError('Error uploading files. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionSubmit = async (question) => {
    if (!sessionId) return

    setChatLoading(true)
    setError(null)
    try {
      const response = await axios.post(`${API_BASE_URL}/api/question`, {
        question,
        session_id: sessionId
      }, {
        timeout: 60000 // 60 second timeout for AI processing
      })

      setQaHistory(prev => [...prev, response.data])
    } catch (error) {
      console.error('Question error:', error)
      if (error.code === 'ECONNREFUSED') {
        showError('Cannot connect to the server. Please check if the backend is running.')
      } else if (error.response?.status === 404) {
        showError('Session not found. Please upload files again to create a new session.')
        setSessionId(null)
        setActiveTab('upload')
      } else if (error.response?.status >= 500) {
        showError('AI processing error. Please try asking your question again.')
      } else {
        showError('Error processing question. Please try again.')
      }
    } finally {
      setChatLoading(false)
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
      window.URL.revokeObjectURL(url)
      showSuccess('Session downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      showError('Error downloading session. Please try again.')
    }
  }

  const resetSession = () => {
    setSessionId(null)
    setQaHistory([])
    setUploadedFiles([])
    setActiveTab('upload')
    setError(null)
    setSuccess(null)
    showSuccess('New session started. You can upload new documents now.')
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
        >
          📚 History
        </button>
      </nav>

      <main className="app-main">
        {loading && <LoadingSpinner />}
        
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            ✅ {success}
          </div>
        )}
        
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
            loading={chatLoading}
          />
        )}
        
        {activeTab === 'history' && (
          <SessionHistory 
            qaHistory={qaHistory}
            uploadedFiles={uploadedFiles}
            onDownload={handleDownloadSession}
            onReset={resetSession}
            sessionId={sessionId}
            hasSession={!!sessionId}
          />
        )}
      </main>

      {sessionId && (
        <footer className="app-footer">
          <div className="session-info">
            <span>🆔 Session: {sessionId.slice(0, 8)}...</span>
            <span>📄 {uploadedFiles.length} file(s) uploaded</span>
            <span>❓ {qaHistory.length} questions asked</span>
          </div>
        </footer>
      )}
    </div>
  )
}

export default App
