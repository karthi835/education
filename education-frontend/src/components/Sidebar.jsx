// ============================================================
// components/Sidebar.jsx
// Collapsible sidebar with navigation links and branding
// ============================================================

import { NavLink } from 'react-router-dom';
import {
  BsGrid1X2Fill,
  BsPeopleFill,
  BsCloudUploadFill,
  BsFileEarmarkSpreadsheetFill,
  BsBoxArrowRight,
  BsBookFill,
  BsBuilding,
  BsGraphUp,
  BsPersonBadgeFill,
  BsGearFill
} from 'react-icons/bs';

const Sidebar = ({ show, onClose }) => {
  // Handle logout: clear storage and redirect
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        className={`sidebar-overlay ${show ? 'show' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <aside className={`sidebar ${show ? 'show' : ''}`}>
        {/* Brand header */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🎓</div>
          <div>
            <h5>EduManage</h5>
            <small>Management System</small>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Main Menu</div>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="nav-icon"><BsGrid1X2Fill /></span>
            Dashboard
          </NavLink>

          <NavLink
            to="/students"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="nav-icon"><BsPeopleFill /></span>
            Students
          </NavLink>

          <NavLink
            to="/courses"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="nav-icon"><BsBookFill /></span>
            Courses
          </NavLink>

          <NavLink
            to="/departments"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="nav-icon"><BsBuilding /></span>
            Departments
          </NavLink>

          <NavLink
            to="/upload"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="nav-icon"><BsCloudUploadFill /></span>
            Excel Upload
          </NavLink>
          
          <div className="nav-section-title mt-3">Insights</div>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="nav-icon"><BsGraphUp /></span>
            Analytics
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="nav-icon"><BsFileEarmarkSpreadsheetFill /></span>
            Reports
          </NavLink>
          
          <div className="nav-section-title mt-3">Administration</div>

          <NavLink
            to="/users"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="nav-icon"><BsPersonBadgeFill /></span>
            Users
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="nav-icon"><BsGearFill /></span>
            Settings
          </NavLink>

        </nav>

        {/* Logout button at the bottom */}
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            className="nav-link w-100 text-start border-0 bg-transparent"
            onClick={handleLogout}
            style={{ color: '#f43f5e', cursor: 'pointer' }}
          >
            <span className="nav-icon"><BsBoxArrowRight /></span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
