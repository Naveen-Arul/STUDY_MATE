import './LoadingSpinner.css'

const LoadingSpinner = () => {
  return (
    <div className='loading-overlay'>
      <div className='loading-content'>
        <div className='spinner'></div>
        <p>Processing your request...</p>
        <small>This may take a few moments</small>
      </div>
    </div>
  )
}

export default LoadingSpinner