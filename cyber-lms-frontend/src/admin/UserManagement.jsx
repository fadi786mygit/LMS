import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import Sidebar from '../Components/Sidebar';
import Topbar from '../Components/Topbar';
import baseUrl from '../baseUrl';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      showToast('Not authorized. Please login.');
      navigate('/login');
    } else {
      loadUsers();
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

  const loadUsers = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/users/get-users`);
      const data = await res.json();
      const filtered = data.filter(
        (user) => user.role === 'admin' || user.role === 'student'
      );
      setUsers(filtered);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${baseUrl}/api/users/delete-user/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (res.ok) {
        showToast('User deleted successfully');
        loadUsers();
      } else {
        showToast(result.message || 'Failed to delete user', 'error');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      showToast('Error deleting user', 'error');
    }
  };

  return (
    <div className="admin-container d-flex">
      <Sidebar />
      <main className="main flex-grow-1 bg-dark text-light" style={{ minHeight: "100vh" }}>
        <Topbar />

        {/* Add User Button */}
        <div className="d-flex justify-content-end p-3">
          <button
            className="btn btn-primary add-user-button"
            onClick={() => navigate('/admin/add-user')}
          >
            Add User
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
                {users.map((user, index) => (
                  <tr key={user._id}>
                    <td>{String(index + 1).padStart(5, '0')}</td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span
                        className={`badge ${user.status?.toLowerCase() === 'active'
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
                        onClick={() => navigate(`/admin/update-user/${user._id}`)}
                        style={{ cursor: 'pointer' }}
                      ></i>
                      <i
                        className="fas fa-trash delete me-2 text-danger"
                        onClick={() => deleteUser(user._id)}
                        style={{ cursor: 'pointer' }}
                      ></i>
                      <i
                        className="fas fa-eye view text-success"
                        onClick={() => navigate(`/admin/view-user/${user._id}`)}
                        style={{ cursor: 'pointer' }}
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table Footer (Pagination-like buttons) */}
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

export default UserManagement;
