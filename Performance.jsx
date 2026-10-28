import { useEffect, useState } from 'react';
import api from './api';

function Performance() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setMessage('');

      const response = await api.get(
        '/api/employees/performance',
        config
      );

      setReport(response.data.report || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'Could not load employee performance report.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalPresent = report.reduce(
    (sum, employee) => sum + employee.presentDays,
    0
  );

  const totalAbsent = report.reduce(
    (sum, employee) => sum + employee.absentDays,
    0
  );

  const totalPendingLeaves = report.reduce(
    (sum, employee) => sum + employee.pendingLeaves,
    0
  );

  const employeesWithAttendance = report.filter(
    (employee) => employee.attendancePercentage !== null
  );

  const averageAttendance = employeesWithAttendance.length
    ? (
        employeesWithAttendance.reduce(
          (sum, employee) => sum + employee.attendancePercentage,
          0
        ) / employeesWithAttendance.length
      ).toFixed(1)
    : null;

  return (
    <div className="employee-page">
      <section className="welcome-card">
        <h2>Employee Performance Report</h2>

        <p>
          Review employee attendance, leave records, and
          attendance percentages.
        </p>

        <button onClick={fetchPerformance} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Report'}
        </button>
      </section>

      {message && (
        <section className="welcome-card">
          <p role="alert">{message}</p>
        </section>
      )}

      {!loading && !message && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Employees</h3>
              <p>{report.length}</p>
            </div>

            <div className="stat-card">
              <h3>Present Days</h3>
              <p>{totalPresent}</p>
            </div>

            <div className="stat-card">
              <h3>Absent Days</h3>
              <p>{totalAbsent}</p>
            </div>

            <div className="stat-card">
              <h3>Average Attendance</h3>
              <p>
                {averageAttendance === null
                  ? 'N/A'
                  : `${averageAttendance}%`}
              </p>
            </div>

            <div className="stat-card">
              <h3>Pending Leaves</h3>
              <p>{totalPendingLeaves}</p>
            </div>
          </div>

          <section className="welcome-card employee-list">
            <h2>Performance Details</h2>

            {report.length === 0 ? (
              <p>No employee records available.</p>
            ) : (
              <div className="employee-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Manager</th>
                      <th>Joining Date</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Late</th>
                      <th>Attendance %</th>
                      <th>Approved Leaves</th>
                      <th>Pending Leaves</th>
                      <th>Rejected Leaves</th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.map((employee) => (
                      <tr key={employee._id}>
                        <td>{employee.employeeId}</td>
                        <td>{employee.department}</td>
                        <td>{employee.designation}</td>
                        <td>{employee.manager}</td>
                        <td>{formatDate(employee.joiningDate)}</td>
                        <td>{employee.presentDays}</td>
                        <td>{employee.absentDays}</td>
                        <td>{employee.lateDays}</td>
                        <td>
                          {employee.attendancePercentage === null
                            ? 'N/A'
                            : `${employee.attendancePercentage}%`}
                        </td>
                        <td>{employee.approvedLeaves}</td>
                        <td>{employee.pendingLeaves}</td>
                        <td>{employee.rejectedLeaves}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {loading && <p>Loading performance report...</p>}
    </div>
  );
}

export default Performance;