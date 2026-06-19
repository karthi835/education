// ============================================================
// pages/Login.jsx
// Handles Administrator Registration and Login
// ============================================================

import { useState } from 'react';
import { Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { BsEnvelopeFill, BsLockFill, BsPersonFill } from 'react-icons/bs';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (isRegister) {
        response = await authAPI.register({ username, email, password });
      } else {
        response = await authAPI.login({ username, password });
      }

      // Store JWT token and user details
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-in">
        <div className="brand-logo">🎓</div>
        <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="subtitle">
          {isRegister
            ? 'Register as an administrator to manage the school directory'
            : 'Login to access the administrator dashboard'}
        </p>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <div className="position-relative">
              <span
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              >

              </span>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
                id="login-username"
              />
            </div>
          </Form.Group>

          {isRegister && (
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <div className="position-relative">
                <span
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                >

                </span>
                <Form.Control
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                  id="login-email"
                />
              </div>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <div className="position-relative">
              <span
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              >

              </span>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
                id="login-password"
              />
            </div>
          </Form.Group>

          {isRegister && (
            <Form.Group className="mb-4">
              <Form.Label>Confirm Password</Form.Label>
              <div className="position-relative">
                <span
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                >

                </span>
                <Form.Control
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                  id="login-confirm-password"
                />
              </div>
            </Form.Group>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
            id="login-submit"
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : isRegister ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </Form>

        <div className="text-center">
          <button
            className="btn btn-link btn-sm text-decoration-none"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            id="toggle-auth-mode"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
