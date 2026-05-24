/**
 * LoadingSpinner — shown while data is loading.
 */
function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export default LoadingSpinner;