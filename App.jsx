import { useEffect, useState, lazy, Suspense } from 'react';
import api from './api';
const Login = lazy(() => import('./Login.jsx'));
const Employees = lazy(() => import('./Employees.jsx'));
const Managers = lazy(() => import('./Managers.jsx'));
const Attendance = lazy(() => import('./Attendance.jsx'));
const Leaves = lazy(() => import('./Leaves.jsx'));
const Announcements = lazy(() => import('./Announcements.jsx'));
const Profile = lazy(() => import('./Profile.jsx'));
const Training = lazy(() => import('./Training.jsx'));
const Performance = lazy(() => import('./Performance.jsx'));
import './App.css';

function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState('Dashboard');
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const role = user?.role || 'Employee';
  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const menuByRole = {
    HR: [
  'Dashboard',
  'Employees',
  'Managers',
  'Attendance',
  'Leave Management',
  'Announcements',
  'Training',
  'Performance',
  'Profile',
],
  Manager: [
  'Dashboard',
  'Employees',
  'Attendance',
  'Leave Management',
  'Announcements',
  'Training',
  'Performance',
  'Profile',
],
    Employee: [
      'Dashboard',
      'Attendance',
      'Leave Management',
      'Announcements',
      'Training',
      'Profile',
    ],
  };

  const menuItems = menuByRole[role] || menuByRole.Employee;

  const fetchNotifications = async () => {
    if (!token) return;

    try {
      const response = await api.get('/api/notifications', { headers });

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error(
        'Failed to load notifications:',
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [token]);

  const markNotificationRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`, {}, { headers });
      await fetchNotifications();
    } catch (error) {
      setNotificationMessage(
        error.response?.data?.message || 'Failed to update notification'
      );
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all', {}, { headers });
      await fetchNotifications();
      setNotificationMessage('All notifications marked as read.');
    } catch (error) {
      setNotificationMessage(
        error.response?.data?.message || 'Failed to update notifications'
      );
    }
  };

  useEffect(() => {
    if (!token || !['HR', 'Manager'].includes(role)) return;

    if (role === 'HR') {
      api
        .get('/api/employees/count', { headers })
        .then((response) =>
          setTotalEmployees(response.data.totalEmployees)
        )
        .catch((error) =>
          console.error('Failed to load employee count:', error)
        );

      api
        .get('/api/employees/department-count', { headers })
        .then((response) =>
          setTotalDepartments(response.data.totalDepartments)
        )
        .catch((error) =>
          console.error('Failed to load department count:', error)
        );
    }

    api
      .get('/api/attendance/present-today', { headers })
      .then((response) =>
        setPresentToday(response.data.presentToday)
      )
      .catch((error) =>
        console.error('Failed to load attendance count:', error)
      );

    api
      .get('/api/leaves/pending-count', { headers })
      .then((response) =>
        setPendingLeaves(response.data.pendingLeaves)
      )
      .catch((error) =>
        console.error('Failed to load pending leaves:', error)
      );
  }, [token, role]);

  useEffect(() => {
    if (!menuItems.includes(activePage)) {
      setActivePage('Dashboard');
    }
  }, [activePage, menuItems]);

  const renderPage = () => {
    if (activePage === 'Managers' && role === 'HR') {
      return <Managers />;
    }
    if (activePage === 'Employees' && ['HR', 'Manager'].includes(role)) {
  return <Employees />;
}
    if (
      activePage === 'Attendance' &&
      ['HR', 'Manager'].includes(role)
    ) {
      return <Attendance />;
    }

    if (activePage === 'Attendance') {
      return <Attendance />;
    }

    if (activePage === 'Leave Management') {
      return <Leaves />;
    }

    if (activePage === 'Announcements') {
      return <Announcements />;
    }

    if (activePage === 'Training') {
      return <Training />;
    }
    if (
  activePage === 'Performance' &&
  ['HR', 'Manager'].includes(role)
) {
  return <Performance />;
}
    if (activePage === 'Profile') {
      return <Profile />;
    }

    if (activePage === 'Dashboard') {
      return (
        <>
          <section className="stats-grid">
            {role === 'HR' && (
              <>
                <article className="stat-card">
                  <h3>Total Employees</h3>
                  <p>{totalEmployees}</p>
                </article>

                <article className="stat-card">
                  <h3>Departments</h3>
                  <p>{totalDepartments}</p>
                </article>
              </>
            )}

            {['HR', 'Manager'].includes(role) && (
              <>
                <article className="stat-card">
                  <h3>Present Today</h3>
                  <p>{presentToday}</p>
                </article>

                <article className="stat-card">
                  <h3>Pending Leaves</h3>
                  <p>{pendingLeaves}</p>
                </article>
              </>
            )}
          </section>

          <section className="welcome-card">
            <h2>Welcome back, {user.name.split(' ')[0]}</h2>
            <p className="eyebrow">{role} workspace</p>

            <p>
              {role === 'HR'
                ? 'Manage employee records, attendance and leave requests.'
                : role === 'Manager'
                  ? 'Monitor team attendance and review leave requests.'
                  : 'Access your employee services and leave management.'}
            </p>
          </section>
        </>
      );
    }

    return (
      <section className="welcome-card">
        <h2>{activePage}</h2>
        <p>This module will be implemented next.</p>
      </section>
    );
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2>StaffSync</h2>
        <p>{role}</p>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item}
              className={activePage === item ? 'active' : ''}
              onClick={() => setActivePage(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <button onClick={onLogout}>Logout</button>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1>{activePage}</h1>
            <p>Welcome back, {user.name}!</p>
          </div>

          <div className="notification-wrapper">
            <button
              type="button"
              className="notification-bell"
              onClick={() => {
                setShowNotifications((previous) => !previous);
                setNotificationMessage('');
              }}
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-panel">
                <div className="notification-panel-header">
                  <h3>Notifications</h3>

                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    disabled={unreadCount === 0}
                  >
                    Mark all read
                  </button>
                </div>

                {notificationMessage && (
                  <p role="status">{notificationMessage}</p>
                )}

                {notifications.length === 0 ? (
                  <p className="empty-notifications">
                    No notifications yet.
                  </p>
                ) : (
                  <div className="notification-list">
                    {notifications.map((notification) => (
                      <article
                        key={notification._id}
                        className={`notification-item ${
                          notification.isRead ? 'read' : 'unread'
                        }`}
                      >
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>

                        <small>
                          {new Date(
                            notification.createdAt
                          ).toLocaleString()}
                        </small>

                        {!notification.isRead && (
                          <button
                            type="button"
                            onClick={() =>
                              markNotificationRead(notification._id)
                            }
                          >
                            Mark as read
                          </button>
                        )}
                      </article>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  className="refresh-notifications"
                  onClick={fetchNotifications}
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </header>

        <Suspense fallback={<section className="welcome-card">Loading workspace…</section>}>{renderPage()}</Suspense>
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token || !user) {
      setChecking(false);
      return;
    }

    api
      .get('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const verifiedUser = {
          ...user,
          ...response.data.user,
        };

        localStorage.setItem('user', JSON.stringify(verifiedUser));
        setUser(verifiedUser);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setChecking(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (checking) {
    return <p style={{ padding: 24 }}>Checking login...</p>;
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App; 