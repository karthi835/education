// ============================================================
// pages/Settings.jsx
// Profile configuration and System metadata settings panel
// ============================================================

import { useState, useEffect } from 'react';
import { usersAPI, authAPI, dashboardAPI } from '../services/api';
import { Row, Col, Form, Button, Alert, Toast, ToastContainer } from 'react-bootstrap';
import { BsGearFill, BsPersonFill, BsDatabaseFill, BsInfoCircleFill, BsShieldLockFill } from 'react-icons/bs';

const Settings = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || { id: 0, username: 'Admin', email: '' };
    } catch {
      return { id: 0, username: 'Admin', email: '' };
    }
  });

  const [profileData, setProfileData] = useState({
    username: currentUser.username,
    email: currentUser.email,
    password: ''
  });

  const [sysStats, setSysStats] = useState({
    totalStudents: 0,
    totalFiles: 0,
    dbConnection: 'Active',
    apiVersion: '1.0.0',
    mode: 'Production'
  });

  // Action / status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchSystemData = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setSysStats(prev => ({
        ...prev,
        totalStudents: response.data.total_students,
        totalFiles: response.data.total_files
      }));
    } catch (err) {
      console.error('Failed to retrieve system status', err);
    }
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileData.username || !profileData.email) {
      setError('Username and email fields cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const payload = {
        username: profileData.username,
        email: profileData.email
      };
      if (profileData.password) {
        payload.password = profileData.password;
      }

      const response = await usersAPI.update(currentUser.id, payload);
      
      // Update local storage values to reflect changes dynamically
      const updatedUser = {
        ...currentUser,
        username: response.data.username,
        email: response.data.email
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      setToastMsg('Administrator profile updated successfully.');
      setToastType('success');
      setShowToast(true);
      setProfileData(prev => ({ ...prev, password: '' }));
      
      // Trigger a window event to update navbar/sidebar if needed
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update administrator profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fs-4 fw-bold mb-1">System Settings</h2>
          <p className="text-muted mb-0">Configure your profile details and monitor system parameters.</p>
        </div>
      </div>

      <Row className="g-4">
        {/* Profile Card */}
        <Col xs={12} lg={7}>
          <div className="data-card">
            <div className="data-card-header">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: 'var(--primary)' }}><BsPersonFill size={18} /></span>
                <h5>Administrator Profile</h5>
              </div>
            </div>
            <div className="data-card-body">
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleUpdateProfile}>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>
                        <span className="d-flex align-items-center gap-1">
                          <BsShieldLockFill /> Change Password (Leave blank to keep current)
                        </span>
                      </Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter new password"
                        value={profileData.password}
                        onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} className="mt-4">
                    <Button type="submit" variant="primary" disabled={loading} id="save-settings-btn">
                      {loading ? 'Saving...' : 'Save Profile Changes'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        </Col>

        {/* System Meta Status */}
        <Col xs={12} lg={5}>
          <div className="data-card h-100">
            <div className="data-card-header">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: 'var(--accent)' }}><BsDatabaseFill size={18} /></span>
                <h5>System Status & Metadata</h5>
              </div>
            </div>
            <div className="data-card-body">
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span className="fw-medium text-secondary">Database Status</span>
                  <span className="badge bg-success px-2.5 py-1.5 rounded-pill">
                    {sysStats.dbConnection}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span className="fw-medium text-secondary">Total Managed Students</span>
                  <strong>{sysStats.totalStudents.toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span className="fw-medium text-secondary">Uploaded Excel Datasets</span>
                  <strong>{sysStats.totalFiles.toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span className="fw-medium text-secondary">FastAPI Release version</span>
                  <span>{sysStats.apiVersion}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-medium text-secondary">Environment Profile</span>
                  <span className="badge bg-primary">{sysStats.mode}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-light rounded d-flex gap-2.5" style={{ background: '#f8fafc', border: '1px solid var(--border-color)' }}>
                <BsInfoCircleFill size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                <p className="small text-muted mb-0">
                  Authentication relies on JSON Web Tokens (JWT) stored in local secure memory. Password modifications are hashed with bcrypt.
                </p>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg={toastType === 'danger' ? 'danger' : 'success'}>
          <Toast.Body className="text-white fw-bold">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Settings;
