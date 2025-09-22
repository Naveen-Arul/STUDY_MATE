import { useState, useRef, useEffect } from 'react'
import './ChatInterface.css'

// Function to format AI response with better organization
const formatAIResponse = (text) => {
  // Split by sentences and add bullet points for better readability
  const sentences = text.split(/\. (?=[A-Z])/).filter(s => s.trim().length > 0)
  
  if (sentences.length <= 2) {
    return text // For short responses, keep as is
  }
  
  // Format longer responses with bullet points
  return sentences.map((sentence, index) => {
    const cleanSentence = sentence.trim()
    if (cleanSentence.length === 0) return null
    
    // Add period if missing
    const formattedSentence = cleanSentence.endsWith('.') ? cleanSentence : cleanSentence + '.'
    
    return (
      <div key={index} className="ai-response-point">
        <span className="bullet-point">★</span>
        <span className="response-text">{formattedSentence}</span>
      </div>
    )
  }).filter(Boolean)
}

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
                    <div className='formatted-answer'>
                      {formatAIResponse(qa.answer)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className='chat-loading'>
              <div className='ai-typing'>
                <span className='ai-icon'>🤖</span>
                <div className='typing-indicator'>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className='typing-text'>AI is thinking...</span>
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