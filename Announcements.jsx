import { useEffect, useState } from 'react';
import api from './api';

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isHR = user.role === 'HR';

  const loadAnnouncements = async () => {
    try {
      const response = await api.get('/api/announcements', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setAnnouncements(response.data);
    } catch (error) {
      setNotice(
        error.response?.data?.message || 'Failed to load announcements.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice('');
    setSubmitting(true);

    try {
      await api.post(
        '/api/announcements',
        { title, message },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setTitle('');
      setMessage('');
      setNotice('Announcement published successfully!');
      await loadAnnouncements();
    } catch (error) {
      setNotice(
        error.response?.data?.message || 'Failed to publish announcement.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="announcements-page">
      {isHR && (
        <section className="welcome-card announcement-form">
          <h2>Publish Announcement</h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="announcement-title">Announcement Title</label>
            <input
              id="announcement-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title"
              maxLength={150}
              required
            />

            <label htmlFor="announcement-message">Announcement Message</label>
            <textarea
              id="announcement-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your announcement"
              rows={5}
              maxLength={5000}
              required
            />

            <button type="submit" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </form>
        </section>
      )}

      {notice && <p className="announcement-notice">{notice}</p>}

      <section className="announcement-list">
        <h2>Latest Announcements</h2>

        {loading ? (
          <p>Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <div className="welcome-card">
            <p>No announcements published yet.</p>
          </div>
        ) : (
          announcements.map((item) => (
            <article className="welcome-card announcement-card" key={item._id}>
              <h3>{item.title}</h3>
              <p className="announcement-message">{item.message}</p>
              <small>
                Published by: {item.createdBy?.name || 'StaffSync HR'}
                {' • '}
                {new Date(item.createdAt).toLocaleDateString()}
              </small>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

export default Announcements;