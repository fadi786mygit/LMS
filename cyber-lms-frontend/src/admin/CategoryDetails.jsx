// src/pages/CategoryDetails.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import Topbar from '../Components/Topbar';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import baseUrl from '../baseUrl';

const CategoryDetails = () => {
  const [category, setCategory] = useState(null);
  const { id } = useParams(); // URL param
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      showToast('Unauthorized. Please login.');
      navigate('/login');
    } else {
      fetchCategory(token);
    }
  }, [id, navigate]);

  const fetchCategory = async (token) => {
    try {
      const res = await fetch(`${baseUrl}/api/categories/getCategory/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setCategory(data);
    } catch (error) {
      console.error('Error fetching category:', error);
      Toastify({ text: 'Failed to load category details', backgroundColor: 'red' }).showToast();
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back
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

  return (
    <div className="admin-container">
      <Sidebar />
      <main className="main">
        <Topbar />
        <section className="main-content">
          <h2>Tools Detail</h2>
          {category ? (
            <div className="table-container">
              <table>
                <tbody>
                  <tr><td><strong>Category Name:</strong></td><td>{category.name}</td></tr>
                  <tr>
                    <td><strong>Tools:</strong></td>
                    <td>
                      <ol>
                        {category.tools.map((tool, i) => (
                          <li key={i}>
                            <a href={tool.link} target="_blank" rel="noopener noreferrer">{tool.name}</a>
                          </li>
                        ))}
                      </ol>
                    </td>
                  </tr>
                  <tr><td><strong>Created At:</strong></td><td>{new Date(category.createdAt).toLocaleString()}</td></tr>
                  <tr><td><strong>Updated At:</strong></td><td>{new Date(category.updatedAt).toLocaleString()}</td></tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p>Loading...</p>
          )}
          <button className="btn" onClick={handleBack}>← Back</button>
        </section>
      </main>
    </div>
  );
};

export default CategoryDetails;
