
import { useEffect, useState } from 'react';
import api from './api';

function Leaves() {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({
    employeeId: '',
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const canApprove = ['HR', 'Manager'].includes(user?.role);

  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };

  const loadData = async () => {
    try {
      const [employeeResponse, leaveResponse] = await Promise.all([
        api.get('/api/employees', config),
        api.get('/api/leaves', config),
      ]);

      setEmployees(employeeResponse.data);
      if (!form.employeeId && employeeResponse.data.length === 1) setForm((current) => ({ ...current, employeeId: employeeResponse.data[0].employeeId }));
      setLeaves(leaveResponse.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Could not load leave data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const payload = user?.role === 'Employee' ? (({ employeeId, ...selfRequest }) => selfRequest)(form) : form;
      const response = await api.post('/api/leaves', payload, config);
      setMessage(response.data.message);
      setForm({
        employeeId: '',
        leaveType: 'Casual',
        startDate: '',
        endDate: '',
        reason: '',
      });
      await loadData();
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Could not submit leave'
      );
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await api.patch(
        `/api/leaves/${id}/status`,
        { status },
        config
      );
      setMessage(response.data.message);
      await loadData();
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Could not update leave status'
      );
    }
  };

  return (
    <div className="employee-page">
      <section className="welcome-card">
        <h2>Apply for Leave</h2>

        {employees.length === 0 && !loading && !canApprove && (
          <p role="status">Your employee profile is not linked yet. Please ask HR to add your registered account to the employee records.</p>
        )}

        {(canApprove || employees.length > 0) && (
          <form className="employee-form" onSubmit={handleSubmit}>
            {canApprove && (
              <>
                <label>Employee *</label>
                <select name="employeeId" value={form.employeeId} onChange={handleChange} required>
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee.employeeId}>
                      {employee.employeeId} — {employee.department}
                    </option>
                  ))}
                </select>
              </>
            )}

            <label>Leave Type *</label>
            <select name="leaveType" value={form.leaveType} onChange={handleChange}>
              <option value="Casual">Casual</option>
              <option value="Sick">Sick</option>
              <option value="Earned">Earned</option>
              <option value="Other">Other</option>
            </select>

            <label>Start Date *</label>
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />

            <label>End Date *</label>
            <input type="date" name="endDate" value={form.endDate} onChange={handleChange} min={form.startDate || undefined} required />

            <label>Reason *</label>
            <input name="reason" value={form.reason} onChange={handleChange} placeholder="Enter reason for leave" required />

            <button type="submit" disabled={canApprove && employees.length === 0}>Submit Leave</button>
          </form>
        )}

      </section>

      <section className="welcome-card employee-list">
        <h2>Leave Applications</h2>

        {loading ? (
          <p>Loading applications...</p>
        ) : leaves.length === 0 ? (
          <p>No leave applications yet.</p>
        ) : (
          <div className="employee-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  {canApprove && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>{leave.employee?.employeeId || '-'}</td>
                    <td>{leave.leaveType}</td>
                    <td>
                      {new Date(leave.startDate).toLocaleDateString()} –{' '}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td>{leave.reason}</td>
                    <td>{leave.status}</td>
                    {canApprove && (
                      <td>
                        {leave.status === 'Pending' ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                updateStatus(leave._id, 'Approved')
                              }
                            >
                              Approve
                            </button>{' '}
                            <button
                              type="button"
                              onClick={() =>
                                updateStatus(leave._id, 'Rejected')
                              }
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                    )}
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

export default Leaves;
