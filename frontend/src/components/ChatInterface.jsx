import { useState, useRef, useEffect } from 'react'
import './ChatInterface.css'

const ChatInterface = ({ onQuestionSubmit, qaHistory, loading }) => {
  const [question, setQuestion] = useState('')
  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [qaHistory])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (question.trim() && !loading) {
      onQuestionSubmit(question)
      setQuestion('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className='chat-interface'>
      <h2>💬 Ask Questions About Your Documents</h2>
      
      <div className='chat-container'>
        <div className='chat-messages'>
          {qaHistory.length === 0 ? (
            <div className='empty-state'>
              <p>🤖 Hello! I'm ready to answer questions about your uploaded PDFs.</p>
              <p>Ask me anything about the content, concepts, or specific details!</p>
            </div>
          ) : (
            qaHistory.map((qa, index) => (
              <div key={qa.id || index} className='qa-pair'>
                <div className='question-bubble'>
                  <div className='bubble-header'>
                    <span className='user-icon'>👤</span>
                    <span className='timestamp'>{new Date(qa.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p>{qa.question}</p>
                </div>
                
                <div className='answer-bubble'>
                  <div className='bubble-header'>
                    <span className='ai-icon'>🤖</span>
                    <span className='timestamp'>{new Date(qa.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className='answer-content'>
                    <p>{qa.answer}</p>
                    
                    {qa.references && qa.references.length > 0 && (
                      <div className='references'>
                        <h4>📚 Sources ({qa.references.length} chunks):</h4>
                        {qa.references.map((ref, refIndex) => (
                          <details key={refIndex} className='reference-item'>
                            <summary>
                              Chunk {refIndex + 1} (relevance: {(ref.score * 100).toFixed(1)}%)
                            </summary>
                            <div className='reference-content'>
                              {ref.chunk}
                            </div>
                          </details>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className='loading-message'>
              <div className='ai-typing'>
                <span className='ai-icon'>🤖</span>
                <div className='typing-indicator'>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
        
        <form className='question-form' onSubmit={handleSubmit}>
          <div className='input-container'>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Ask a question about your PDFs...'
              disabled={loading}
              rows={1}
              style={{ resize: 'none' }}
            />
            <button 
              type='submit' 
              disabled={!question.trim() || loading}
              className='send-button'
            >
              {loading ? '⏳' : '🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatInterface