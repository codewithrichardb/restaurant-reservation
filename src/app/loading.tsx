export default function Loading() {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-50 py-5">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h2 className="h4 mt-3">Loading...</h2>
        <p className="text-muted">Please wait while we prepare your content.</p>
      </div>
    </div>
  );
}
