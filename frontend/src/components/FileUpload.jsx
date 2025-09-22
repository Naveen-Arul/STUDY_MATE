import { useState, useRef } from 'react'
import './FileUpload.css'

const FileUpload = ({ onFilesUploaded, uploadedFiles, loading }) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const inputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'application/pdf'
    )
    
    if (files.length > 0) {
      setSelectedFiles(files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
  }

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      onFilesUploaded(selectedFiles)
      setSelectedFiles([])
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className='file-upload'>
      <h2>📁 Upload Your PDF Documents</h2>
      <p>Upload one or more PDF files to start asking questions about their content.</p>
      
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type='file'
          multiple
          accept='.pdf'
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        
        <div className='upload-content'>
          <div className='upload-icon'>📄</div>
          <h3>Drag & Drop PDF Files Here</h3>
          <p>or click to browse</p>
          <small>Supports multiple PDF files</small>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className='selected-files'>
          <h3>Selected Files:</h3>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index} className='file-item'>
                <span className='file-name'>📄 {file.name}</span>
                <span className='file-size'>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                <button 
                  className='remove-btn'
                  onClick={() => removeFile(index)}
                  type='button'
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
          
          <button 
            className='upload-btn'
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '⏳ Uploading...' : '🚀 Upload & Process Files'}
          </button>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className='uploaded-files'>
          <h3>✅ Successfully Uploaded:</h3>
          <ul>
            {uploadedFiles.map((filename, index) => (
              <li key={index} className='uploaded-file'>
                📄 {filename}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default FileUpload