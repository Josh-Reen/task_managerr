import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaLock, FaKey } from 'react-icons/fa';
import '../index.css';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!email || !token) {
      setError('Invalid reset link. Please request a new one.');
    }
  }, [email, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post(`${apiUrl}/api/auth/reset-password`, { email, token, newPassword });
      setMessage(res.data.message);
      setNewPassword('');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Reset password error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1><FaKey /> Reset Password</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
            className="auth-input"
          />
        </div>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        <button type="submit" className="auth-button" disabled={isLoading || !email || !token}>
          {isLoading ? 'Resetting...' : <><FaKey /> Reset Password</>}
        </button>
      </form>
      <p>Back to <Link to="/login">Login</Link></p>
    </div>
  );
};

export default ResetPassword;