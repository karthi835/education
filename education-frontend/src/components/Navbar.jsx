// ============================================================
// components/Navbar.jsx
// Top navigation bar with page title, user info, and mobile toggle
// ============================================================

import { BsList, BsBellFill, BsPersonCircle } from 'react-icons/bs';

const Navbar = ({ title, onToggleSidebar }) => {
  // Get the current user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = user.username
    ? user.username.substring(0, 2).toUpperCase()
    : 'AD';

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        {/* Mobile sidebar toggle button */}
        <button
          className="btn btn-link d-lg-none p-0 text-light"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          id="sidebar-toggle"
        >
          <BsList size={24} />
        </button>
        <h1 className="page-title mb-0">{title}</h1>
      </div>

      <div className="user-section">
        {/* Notification bell */}
        <button
          className="btn btn-link p-0 position-relative"
          style={{ color: 'var(--text-muted)' }}
          id="notifications-btn"
        >
          <BsBellFill size={18} />
        </button>

        {/* User avatar and name */}
        <div className="d-flex align-items-center gap-2">
          <div className="user-avatar">{initials}</div>
          <div className="d-none d-md-block">
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {user.username || 'Admin'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Administrator
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
