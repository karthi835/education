// ============================================================
// pages/Users.jsx
// Admin User Management — manage system administrators and registrars
// ============================================================

import { useState, useEffect } from 'react';
import { usersAPI, authAPI } from '../services/api';
import { Table, Spinner, Button, Modal, Form, Alert, Toast, ToastContainer } from 'react-bootstrap';
import { BsPersonPlusFill, BsTrashFill, BsPersonBadgeFill, BsEnvelopeFill, BsCalendarDateFill } from 'react-icons/bs';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '' });
  const [addError, setAddError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (err) {
      setError('Failed to retrieve system administrators.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) {
      setAddError('Please fill out all fields.');
      return;
    }

    try {
      setAddError('');
      setActionLoading(true);
      // Calls registration endpoint
      await authAPI.register(newUser);
      
      setToastMsg(`User "${newUser.username}" created successfully.`);
      setToastType('success');
      setShowToast(true);
      
      setShowAddModal(false);
      setNewUser({ username: '', email: '', password: '' });
      fetchUsers(); // Refresh list
    } catch (err) {
      setAddError(err.response?.data?.detail || 'Failed to create new user account.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id, username) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete administrator "${username}"?`);
    if (!confirmDelete) return;

    try {
      setActionLoading(true);
      await usersAPI.delete(id);
      setToastMsg(`User "${username}" deleted successfully.`);
      setToastType('success');
      setShowToast(true);
      fetchUsers();
    } catch (err) {
      setToastMsg(err.response?.data?.detail || 'Failed to delete user.');
      setToastType('danger');
      setShowToast(true);
    } finally {
      setActionLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="animate-in">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fs-4 fw-bold mb-1">User Management</h2>
          <p className="text-muted mb-0">List and manage registered administrator accounts.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowAddModal(true)} id="add-user-btn">
          <BsPersonPlusFill /> Add Administrator
        </button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="data-card">
        <div className="data-card-body p-0">
          {loading ? (
            <div className="loading-spinner">
              <Spinner animation="border" style={{ color: 'var(--primary)' }} />
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="table-dark-custom mb-0">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email Address</th>
                    <th>Registration Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        No registered administrator accounts found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="user-avatar" style={{ width: 38, height: 38, fontSize: '0.85rem' }}>
                              {getInitials(user.username)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{user.username}</div>
                              <small className="text-muted">ID: #{user.id}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                            <BsEnvelopeFill className="text-muted" />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                            <BsCalendarDateFill className="text-muted" />
                            <span>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </td>
                        <td className="text-end">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="btn-sm"
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            disabled={actionLoading}
                            style={{ padding: '0.35rem 0.6rem' }}
                          >
                            <BsTrashFill />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Add Administrator Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <BsPersonBadgeFill style={{ color: 'var(--primary)' }} />
            <span>Create Admin Credentials</span>
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddUser}>
          <Modal.Body>
            {addError && <Alert variant="danger">{addError}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter admin email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Access Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-light" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={actionLoading}>
              {actionLoading ? 'Creating...' : 'Register Account'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Toast Notification Container */}
      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg={toastType === 'danger' ? 'danger' : 'success'}>
          <Toast.Body className="text-white fw-bold">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Users;
