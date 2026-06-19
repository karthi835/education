// ============================================================
// pages/PlaceholderPage.jsx
// Generic placeholder for pages under development
// ============================================================

const PlaceholderPage = ({ title, icon: Icon }) => {
  return (
    <div className="animate-in h-100 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <div className="text-center p-5 data-card" style={{ maxWidth: '500px', width: '100%' }}>
        {Icon && <Icon size={48} className="mb-3" style={{ color: 'var(--primary)' }} />}
        <h2 className="fw-bold mb-3">{title}</h2>
        <p className="text-muted mb-4">
          This module is currently under development. Please check back later for updates.
        </p>
        <button className="btn btn-accent px-4" onClick={() => window.history.back()}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default PlaceholderPage;
