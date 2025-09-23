import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import Sidebar from '../Components/Sidebar';
import Topbar from '../Components/Topbar';
import baseUrl from '../baseUrl';

const InstructorManagement = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      showToast('Not authorized. Please login.');
      navigate('/login');
    } else {
      fetchInstructors();
    }
  }, []);

  const showToast = (message, type = 'success') => {
    Toastify({
      text: message,
      duration: 3000,
      gravity: 'top',
      position: 'right',
      style: {
        background: type === 'success' ? '#198754' : '#dc3545',
      },
    }).showToast();
  };

  const fetchInstructors = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/users/get-users`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to fetch instructors');

      const data = await res.json();

      const instructorsOnly = Array.isArray(data)
        ? data.filter((user) => user.role === 'instructor')
        : [];

      setInstructors(instructorsOnly);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteInstructor = async (id) => {
    if (!window.confirm('Are you sure to delete this instructor?')) return;

    try {
      const res = await fetch(`${baseUrl}/api/users/delete-user/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (res.ok) {
        showToast('Instructor deleted successfully');
        fetchInstructors();
      } else {
        showToast(result.message || 'Failed to delete instructor', 'error');
      }
    } catch (err) {
      showToast('Error deleting instructor', 'error');
    }
  };

  if (loading) return <div className="container mt-5 text-light bg-dark">Loading...</div>;
  if (error) return <div className="container mt-5 text-danger bg-dark">Error: {error}</div>;

  return (
    <div className="admin-container d-flex">
      <Sidebar />
      <main className="main flex-grow-1 bg-dark text-light" style={{ minHeight: '100vh' }}>
        <Topbar />

        {/* Add Instructor Button */}
        <div className="d-flex justify-content-end p-3">
          <button
            className="btn btn-primary add-user-button"
            onClick={() => navigate('/admin/add-instructor')}
          >
            Add Instructor
          </button>
        </div>

        {/* Responsive Table Section */}
        <section className="main-content p-3">
          <div className="table-container table-responsive bg-dark p-3 rounded">
            <table className="table table-bordered table-hover align-middle table-dark">
              <thead className="table-dark">
                <tr>
                  <th scope="col">SR.</th>
                  <th scope="col">NAME</th>
                  <th scope="col">EMAIL</th>
                  <th scope="col">ROLE</th>
                  <th scope="col">STATUS</th>
                  <th scope="col">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {instructors.map((user, index) => (
                  <tr key={user._id}>
                    <td>{String(index + 1).padStart(5, '0')}</td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.status?.toLowerCase() === 'active'
                            ? 'bg-success'
                            : user.status?.toLowerCase() === 'inactive'
                            ? 'bg-danger'
                            : 'bg-secondary'
                        }`}
                      >
                        ● {user.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="actions text-center">
                      <i
                        className="fas fa-pen edit me-2 text-primary"
                        onClick={() => navigate(`/admin/update-instructor/${user._id}`)}
                        style={{ cursor: 'pointer' }}
                      ></i>
                      <i
                        className="fas fa-trash delete me-2 text-danger"
                        onClick={() => deleteInstructor(user._id)}
                        style={{ cursor: 'pointer' }}
                      ></i>
                      <i
                        className="fas fa-eye view text-success"
                        onClick={() => navigate(`/admin/view-instructor/${user._id}`)}
                        style={{ cursor: 'pointer' }}
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table Footer (Pagination) */}
            <div className="d-flex justify-content-between mt-3">
              <button className="btn btn-outline-light">◀ Prev. Date</button>
              <button className="btn btn-outline-light">Next Date ▶</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default InstructorManagement;
