import './SessionHistory.css'

const SessionHistory = ({ qaHistory, uploadedFiles, onDownload, onReset, sessionId, hasSession }) => {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const getTotalWords = () => {
    return qaHistory.reduce((total, qa) => {
      return total + qa.question.split(' ').length + qa.answer.split(' ').length
    }, 0)
  }

  return (
    <div className='session-history'>
      <h2>📊 Session Summary & History</h2>
      
      {!hasSession ? (
        <div className='no-session-state'>
          <div className='no-session-icon'>📚</div>
          <h3>No Active Session</h3>
          <p>Upload PDF files to start a new session and begin asking questions about your documents.</p>
          <div className='feature-preview'>
            <h4>🌟 What you can do here:</h4>
            <ul>
              <li>✨ View your question and answer history</li>
              <li>📊 See session statistics and analytics</li>
              <li>📎 Download complete Q&A logs for study reference</li>
              <li>🔄 Manage multiple study sessions</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          <div className='session-stats'>
        <div className='stat-card'>
          <h3>📄 Documents</h3>
          <p className='stat-number'>{uploadedFiles.length}</p>
          <div className='file-list'>
            {uploadedFiles.map((filename, index) => (
              <div key={index} className='file-item'>
                📄 {filename}
              </div>
            ))}
          </div>
        </div>
        
        <div className='stat-card'>
          <h3>❓ Questions</h3>
          <p className='stat-number'>{qaHistory.length}</p>
          <small>Total interactions</small>
        </div>
        
        <div className='stat-card'>
          <h3>📝 Words</h3>
          <p className='stat-number'>{getTotalWords()}</p>
          <small>Questions + Answers</small>
        </div>
        
        <div className='stat-card'>
          <h3>🕐 Session</h3>
          <p className='session-id'>...{sessionId.slice(-8)}</p>
          <small>Session ID</small>
        </div>
      </div>

      <div className='action-buttons'>
        <button className='download-btn' onClick={onDownload}>
          📥 Download Q&A Log
        </button>
        <button className='reset-btn' onClick={onReset}>
          🔄 New Session
        </button>
      </div>

      <div className='history-list'>
        <h3>📝 Question & Answer History</h3>
        {qaHistory.length === 0 ? (
          <div className='empty-history'>
            <p>No questions asked yet. Start a conversation in the Chat tab!</p>
          </div>
        ) : (
          <div className='history-items'>
            {qaHistory.map((qa, index) => (
              <div key={qa.id || index} className='history-item'>
                <div className='history-header'>
                  <span className='question-number'>Q{index + 1}</span>
                  <span className='timestamp'>{formatTimestamp(qa.timestamp)}</span>
                </div>
                
                <div className='history-content'>
                  <div className='question-section'>
                    <h4>❓ Question:</h4>
                    <p>{qa.question}</p>
                  </div>
                  
                  <div className='answer-section'>
                    <h4>🤖 Answer:</h4>
                    <p>{qa.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  )
}

export default SessionHistory