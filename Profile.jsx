import { useEffect, useState } from 'react';
import api from './api';

function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: ''
  });

  const [role, setRole] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const headers = {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get('/api/profile', { headers });

        const { user, employee } = response.data;

        setRole(user.role);

        setProfile({
          name: user.name || '',
          email: user.email || '',
          phone: employee?.phone || '',
          department: employee?.department || '',
          designation: employee?.designation || ''
        });
      } catch (error) {
        setNotice(
          error.response?.data?.message || 'Failed to load profile.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice('');
    setSaving(true);

    try {
      const response = await api.patch(
        '/api/profile',
        profile,
        { headers }
      );

      const { user } = response.data;

      const savedUser = {
        ...JSON.parse(localStorage.getItem('user') || '{}'),
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      localStorage.setItem('user', JSON.stringify(savedUser));

      setNotice('Profile updated successfully!');
    } catch (error) {
      setNotice(
        error.response?.data?.message || 'Failed to update profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <section className="welcome-card profile-card">
      <h2>My Profile</h2>
      <p>View and update your personal information.</p>

      <form onSubmit={handleSubmit} className="profile-form">
        <label htmlFor="profile-name">Full Name</label>
        <input
          id="profile-name"
          name="name"
          value={profile.name}
          onChange={handleChange}
          required
          maxLength={100}
        />

        <label htmlFor="profile-email">Email Address</label>
        <input
          id="profile-email"
          name="email"
          type="email"
          value={profile.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="profile-phone">Phone Number</label>
        <input
          id="profile-phone"
          name="phone"
          type="tel"
          value={profile.phone}
          onChange={handleChange}
          maxLength={20}
        />

        <label htmlFor="profile-department">Department</label>
        <input
          id="profile-department"
          name="department"
          value={profile.department}
          onChange={handleChange}
          maxLength={100}
        />

        <label htmlFor="profile-designation">Designation</label>
        <input
          id="profile-designation"
          name="designation"
          value={profile.designation}
          onChange={handleChange}
          maxLength={100}
        />

        <label>User Role</label>
        <input value={role} readOnly />

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {notice && <p role="status">{notice}</p>}
    </section>
  );
}

export default Profile;