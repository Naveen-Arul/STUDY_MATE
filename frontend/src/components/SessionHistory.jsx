import './SessionHistory.css'

const SessionHistory = ({ qaHistory, uploadedFiles, onDownload, onReset, sessionId }) => {
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
                  
                  {qa.references && qa.references.length > 0 && (
                    <div className='references-section'>
                      <h4>📚 Sources ({qa.references.length} chunks):</h4>
                      <div className='reference-previews'>
                        {qa.references.map((ref, refIndex) => (
                          <div key={refIndex} className='reference-preview'>
                            <div className='reference-score'>
                              Score: {(ref.score * 100).toFixed(1)}%
                            </div>
                            <div className='reference-text'>
                              {ref.chunk.substring(0, 150)}...
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SessionHistory