
import './Login.css';
import { useState } from 'react';
import api from './api';

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      if (isRegister && password.length < 6) {
        setMessage('Password must be at least 6 characters long.');
        return;
      }

      const endpoint = isRegister
        ? '/api/auth/register'
        : '/api/auth/login';

      const data = isRegister
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };

      const response = await api.post(endpoint, data);

      if (isRegister) {
        setMessage('Registration successful! Please log in.');
        setIsRegister(false);
        setName('');
        setPassword('');
      } else {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        if (onLogin) {
          onLogin(response.data.user);
        } else {
          window.location.reload();
        }
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'Something went wrong. Check the backend server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>StaffSync</h1>
        <p>Modern HR Management System</p>

        <h2>{isRegister ? 'Create Employee Account' : 'Welcome Back'}</h2>

        {isRegister && (
          <>
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </>
        )}

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          minLength={6}
        />

        <button type="submit" disabled={loading}>
          {loading
            ? 'Please wait...'
            : isRegister
              ? 'Register'
              : 'Login'}
        </button>

        {message && <p className="auth-message">{message}</p>}

        <p>
          {isRegister
            ? 'Already have an account?'
            : "Don't have an account?"}{' '}
          <button
            type="button"
            className="auth-switch"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage('');
            }}
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;
