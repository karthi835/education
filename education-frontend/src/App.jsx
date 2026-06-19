// ============================================================
// App.jsx - Application Core Component
// Handles routes, layouts, user authentication checks,
// and state controls for sidebar layouts.
// ============================================================

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BsJournalBookmarkFill, BsBuilding, BsGraphUp, BsPersonBadgeFill, BsGearFill } from 'react-icons/bs';

import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Upload from './pages/Upload';
import Reports from './pages/Reports';
import Courses from './pages/Courses';
import Departments from './pages/Departments';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import Settings from './pages/Settings';
import PlaceholderPage from './pages/PlaceholderPage';

// Layout component wrapping all routes except Login
const Layout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <Sidebar show={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content container */}
      <div className="main-content">
        <Navbar title={title} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout title="Dashboard Analytics">
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <Layout title="Student Directory">
                <Students />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Layout title="Import Student Data">
                <Upload />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout title="Data Reports">
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Functional Routes */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Layout title="Courses">
                <Courses />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/departments"
          element={
            <ProtectedRoute>
              <Layout title="Departments">
                <Departments />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout title="Advanced Analytics">
                <Analytics />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Layout title="User Management">
                <Users />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout title="System Settings">
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Redirect logic */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
