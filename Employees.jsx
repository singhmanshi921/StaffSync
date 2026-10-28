import { useEffect, useState } from 'react';
import api from './api';

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState({
    employeeId: '',
    email: '',
    department: '',
    designation: '',
    phone: '',
    joiningDate: '',
    managerId: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('token');

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/employees', config);
      setEmployees(response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Could not load employees'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await api.get('/api/managers', config);
      setManagers(response.data.managers || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Could not load managers'
      );
    }
  };

  useEffect(() => {
    fetchEmployees();

    if (localStorage.getItem('user')) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));

        if (user.role === 'HR') {
          fetchManagers();
        }
      } catch {
        // Ignore invalid local user data
      }
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        managerId: form.managerId || null,
      };

      const response = await api.post(
        '/api/employees',
        payload,
        config
      );

      setMessage(response.data.message);

      setForm({
        employeeId: '',
    email: '',
        department: '',
        designation: '',
        phone: '',
        joiningDate: '',
        managerId: '',
      });

      await fetchEmployees();
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Could not add employee'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const isHR = user.role === 'HR';

  return (
    <div className="employee-page">
      {isHR && (
        <section className="welcome-card">
          <h2>Add Employee</h2>
          <p>Employee must create an account first; connect the account using its work email.</p>

          <form className="employee-form" onSubmit={handleSubmit}>
            <label>Employee ID *</label>
            <input
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              placeholder="e.g. EMP001"
              required
            />

            <label>Employee account email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="staff@company.com" required />

            <label>Department *</label>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="e.g. IT"
              required
            />

            <label>Designation *</label>
            <input
              name="designation"
              value={form.designation}
              onChange={handleChange}
              placeholder="e.g. Software Developer"
              required
            />

            <label>Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
            />

            <label>Joining Date</label>
            <input
              type="date"
              name="joiningDate"
              value={form.joiningDate}
              onChange={handleChange}
            />

            <label>Assign Manager</label>
            <select
              name="managerId"
              value={form.managerId}
              onChange={handleChange}
            >
              <option value="">No manager assigned</option>

              {managers.map((manager) => (
                <option key={manager._id} value={manager._id}>
                  {manager.name} ({manager.email})
                </option>
              ))}
            </select>

            <button type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Employee'}
            </button>
          </form>

          {message && <p role="status">{message}</p>}
        </section>
      )}

      <section className="welcome-card employee-list">
        <h2>Employee Records</h2>

        {loading ? (
          <p>Loading employees...</p>
        ) : employees.length === 0 ? (
          <p>No employees added yet.</p>
        ) : (
          <div className="employee-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Phone</th>
                  <th>Manager</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr key={employee._id}>
                    <td>{employee.employeeId}</td>
                    <td>{employee.department}</td>
                    <td>{employee.designation}</td>
                    <td>{employee.phone || '-'}</td>
                    <td>{employee.manager?.name || 'Not assigned'}</td>
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

export default Employees;