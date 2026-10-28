import { useEffect, useState } from 'react';
import api from './api';

function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [status, setStatus] = useState('Present');
  const [date, setDate] = useState(
    new Date().toLocaleDateString('en-CA')
  );
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };

  const loadData = async () => {
    try {
      const [employeeResponse, attendanceResponse] = await Promise.all([
        api.get('/api/employees', config),
        api.get('/api/attendance', config),
      ]);

      setEmployees(employeeResponse.data);
      if (!employeeId && employeeResponse.data.length === 1) setEmployeeId(employeeResponse.data[0].employeeId);
      setRecords(attendanceResponse.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Could not load attendance data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSubmitting(true);

    try {
      const response = await api.post(
        '/api/attendance',
        { employeeId, status, date },
        config
      );

      setMessage(response.data.message);
      setEmployeeId('');
      setStatus('Present');
      await loadData();
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Could not mark attendance'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="employee-page">
      <section className="welcome-card">
        <h2>Mark Attendance</h2>

        {loading ? (
          <p>Loading employees...</p>
        ) : employees.length === 0 ? (
          <p>No employees found in your team. HR must add employees and assign them to a manager first.</p>
        ) : (
          <form className="employee-form" onSubmit={handleSubmit}>
            <label>Employee *</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee.employeeId}>
                  {employee.employeeId} — {employee.department}
                </option>
              ))}
            </select>

            <label>Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <label>Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>

            <button
              type="submit"
              disabled={!employeeId || submitting}
            >
              {submitting ? 'Saving...' : 'Save Attendance'}
            </button>
          </form>
        )}

        {message && <p role="status">{message}</p>}
      </section>

      <section className="welcome-card employee-list">
        <h2>Attendance Records</h2>

        {loading ? (
          <p>Loading records...</p>
        ) : records.length === 0 ? (
          <p>No attendance records yet.</p>
        ) : (
          <div className="employee-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td>{record.employee?.employeeId || '-'}</td>
                    <td>{record.employee?.department || '-'}</td>
                    <td>
                      {new Date(record.date).toLocaleDateString('en-IN')}
                    </td>
                    <td>{record.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Attendance;