import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import Topbar from '../Components/Topbar';
import Toastify from 'toastify-js';
import baseUrl from '../baseUrl';

export default function ToolManagement() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      showToast('Unauthorized. Please login.');
      navigate('/login');
      return;
    }
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/categories/getCategories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      showToast('Failed to fetch categories');
    }
  };

   const showToast = (msg, type = 'success') => {
    Toastify({
      text: msg,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: type === 'success' ? "green" : "red",
      }
    }).showToast();
  };

  const deleteTool = async (categoryId, toolName) => {
    if (!window.confirm(`Delete tool "${toolName}"?`)) return;

    try {
      const res = await fetch(`${baseUrl}/api/categories/${categoryId}/tool/${toolName}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) return showToast(`Error: ${data.message}`);
      showToast('Tool deleted');
      fetchCategories();
    } catch (err) {
      showToast('Failed to delete tool');
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;

    try {
      const res = await fetch(`${baseUrl}/api/categories/deleteCategory/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) return showToast(`Error: ${data.message}`);
      showToast('Category deleted');
      fetchCategories();
    } catch (err) {
      showToast('Failed to delete category');
    }
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <main className="main">
        <Topbar />

        <div className="add-user-button-container">
          <button className="add-user-button" onClick={() => navigate('/admin/add-tools')}>
            Create Categories (Tools)
          </button>
        </div>

        <section className="main-content">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Tools</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td>
                      {category.tools.length > 0 ? (
                        category.tools.map((tool) => (
                          <div key={tool.name} className="tool-item">
                            <a
                              href={tool.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="tool-link"
                            >
                              {tool.name}
                            </a>
                            <i
                              className="fas fa-trash delete"
                              title="Delete Tool"
                              onClick={() => deleteTool(category._id, tool.name)}
                            ></i>
                          </div>
                        ))
                      ) : (
                        <em>No tools</em>
                      )}
                    </td>
                    <td className="actions">
                      <i
                        className="fas fa-pen edit"
                        title="Edit Category"
                        onClick={() => navigate(`/admin/edit-tools/${category._id}`)}
                      ></i>
                      <i
                        className="fas fa-trash delete"
                        title="Delete Category"
                        onClick={() => deleteCategory(category._id)}
                      ></i>
                      <i
                        className="fas fa-eye view"
                        title="View Category"
                        onClick={() => navigate(`/admin/view-tools/${category._id}`)}
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
