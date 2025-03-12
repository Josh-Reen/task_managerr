import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaEnvelope, FaKey } from 'react-icons/fa';
import '../index.css';

/**
 * ForgotPassword component to request a password reset link
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  /**
   * Handles form submission to send reset link
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post(`${apiUrl}/api/auth/forgot-password`, { email });
      setMessage(res.data.message);
      setEmail('');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('This Email isn’t available:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1><FaKey /> Forgot Password</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your registered email"
            required
            className="auth-input"
          />
        </div>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? 'Sending...' : <><FaKey /> Send Reset Link</>}
        </button>
      </form>
      <p>Back to <Link to="/login">Login</Link></p>
    </div>
  );
};

export default ForgotPassword;