/**
 * ErrorMessage — shown when something goes wrong.
 * Optionally shows a "Try Again" button if given an onRetry function.
 */
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-box">
      <p>⚠️ {message || 'Something went wrong. Please try again.'}</p>
      {onRetry && (
        <button className="btn-primary" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;