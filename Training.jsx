import { useEffect, useState } from 'react';
import api from './api';

function Training() {
  const [trainings, setTrainings] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const isHR = user.role === 'HR';

  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };

  const loadTrainings = async () => {
    try {
      const response = await api.get('/api/trainings', config);
      setTrainings(response.data);
    } catch (error) {
      setNotice(
        error.response?.data?.message ||
          'Failed to load training programs.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainings();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice('');
    setSubmitting(true);

    try {
      const payload = {
        title,
        description,
        date,
      };

      if (editingId) {
        await api.put(
          `/api/trainings/${editingId}`,
          payload,
          config
        );

        setNotice('Training program updated successfully!');
      } else {
        await api.post(
          '/api/trainings',
          payload,
          config
        );

        setNotice('Training program added successfully!');
      }

      resetForm();
      setLoading(true);
      await loadTrainings();
    } catch (error) {
      setNotice(
        error.response?.data?.message ||
          'Failed to save training program.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (training) => {
    setEditingId(training._id);
    setTitle(training.title);
    setDescription(training.description);
    setDate(
      training.date
        ? new Date(training.date).toISOString().split('T')[0]
        : ''
    );
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (trainingId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this training program?'
    );

    if (!confirmed) return;

    setNotice('');

    try {
      const response = await api.delete(
        `/api/trainings/${trainingId}`,
        config
      );

      if (editingId === trainingId) {
        resetForm();
      }

      setNotice(
        response.data.message ||
          'Training program deleted successfully.'
      );

      setLoading(true);
      await loadTrainings();
    } catch (error) {
      setNotice(
        error.response?.data?.message ||
          'Failed to delete training program.'
      );
    }
  };

  return (
    <div className="training-page">
      {isHR && (
        <section className="welcome-card training-form">
          <h2>
            {editingId ? 'Edit Training Program' : 'Add Training Program'}
          </h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="training-title">
              Training Title
            </label>

            <input
              id="training-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter training title"
              maxLength={150}
              required
            />

            <label htmlFor="training-description">
              Description
            </label>

            <textarea
              id="training-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the training program"
              rows={4}
              maxLength={5000}
              required
            />

            <label htmlFor="training-date">
              Training Date
            </label>

            <input
              id="training-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <button type="submit" disabled={submitting}>
              {submitting
                ? 'Saving...'
                : editingId
                  ? 'Update Training'
                  : 'Add Training'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </section>
      )}

      {notice && (
        <p role="status">
          {notice}
        </p>
      )}

      <section className="training-list">
        <h2>Available Training Programs</h2>

        {loading ? (
          <p>Loading training programs...</p>
        ) : trainings.length === 0 ? (
          <div className="welcome-card">
            <p>No training programs available yet.</p>
          </div>
        ) : (
          trainings.map((training) => (
            <article
              className="welcome-card training-card"
              key={training._id}
            >
              <h3>{training.title}</h3>

              <p>{training.description}</p>

              <p>
                <strong>Date:</strong>{' '}
                {new Date(training.date).toLocaleDateString('en-IN')}
              </p>

              <small>
                Added by: {training.createdBy?.name || 'StaffSync HR'}
              </small>

              {isHR && (
                <div className="training-actions">
                  <button
                    type="button"
                    onClick={() => handleEdit(training)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(training._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  );
}

export default Training;