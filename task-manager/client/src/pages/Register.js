import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../index.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', { email, password });
      setEmail('');
      setPassword('');
      navigate('/login'); // Redirect to login instead of tasks
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="auth-input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="auth-input"
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" className="auth-button">Register</button>
      </form>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default Register;