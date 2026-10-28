import { useEffect, useState } from 'react';
import api from './api';

function Managers() {
  const [managers, setManagers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchManagers = async () => {
    try {
      const response = await api.get('/api/managers', { headers });
      setManagers(response.data.managers);
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Failed to load managers'
      );
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleAddManager = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await api.post(
        '/api/managers',
        { name, email, password },
        { headers }
      );

      setMessage('Manager added successfully!');
      setName('');
      setEmail('');
      setPassword('');

      await fetchManagers();
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Failed to add manager'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteManager = async (id) => {
    if (!window.confirm('Are you sure you want to delete this manager?')) {
      return;
    }

    setMessage('');

    try {
      await api.delete(`/api/managers/${id}`, { headers });
      setMessage('Manager deleted successfully!');
      await fetchManagers();
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Failed to delete manager'
      );
    }
  };

  return (
    <section className="managers-page">
      <div className="welcome-card">
        <h2>Manager Management</h2>
        <p>Add managers and manage existing manager accounts.</p>
      </div>

      {message && <p role="status">{message}</p>}

      <form className="welcome-card" onSubmit={handleAddManager}>
        <h3>Add New Manager</h3>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (minimum 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Manager'}
        </button>
      </form>

      <div className="welcome-card">
        <h3>Existing Managers ({managers.length})</h3>

        {managers.length === 0 ? (
          <p>No managers found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {managers.map((manager) => (
                  <tr key={manager._id}>
                    <td>{manager.name}</td>
                    <td>{manager.email}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteManager(manager._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Managers;