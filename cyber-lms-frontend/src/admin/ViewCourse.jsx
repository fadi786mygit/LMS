import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import Topbar from '../Components/Topbar';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import '../style.css';
import baseUrl from '../baseUrl';

const ViewCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      showToast("Unauthorized. Please login.");
      navigate("/login");
    } else {
      fetchCourseDetails();
    }
  }, []);

  const fetchCourseDetails = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/courses/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setCourse(data);
    } catch (err) {
      console.error("Error fetching course data", err);
      showToast("Failed to load course details", "error");  
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

  const logout = () => {
    localStorage.removeItem("token");
    Toastify({
      text: "Logged out successfully",
      className: "toast-info",
      duration: 1500
    }).showToast();

    setTimeout(() => navigate("/login"), 1500);
  };

  return (
    <div className="admin-container">
      <Sidebar logout={logout} />
      <main className="main">
        <Topbar />

        <section className="main-content">
          <h2>Course Details</h2>
          <div className="table-container">
            <table>
              <tbody>
                {course ? (
                  <>
                    <tr><td><strong>Title:</strong></td><td>{course.title}</td></tr>
                    <tr><td><strong>Description:</strong></td><td>{course.description}</td></tr>
                    <tr><td><strong>Instructor:</strong></td><td>{course.instructor?.fullName || "N/A"}</td></tr>
                    <tr><td><strong>Category:</strong></td><td>{course.category}</td></tr>
                    <tr><td><strong>Level:</strong></td><td>{course.level}</td></tr>
                    <tr><td><strong>Price:</strong></td><td>${course.price}</td></tr>
                    <tr>
                      <td><strong>Thumbnail:</strong></td>
                      <td>
                        <img src={course.thumbnail} width="120" alt="Thumbnail" />
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Content:</strong></td>
                      <td>
                        <ul>
                          {course.content?.map((item, idx) => (
                            <li key={idx}>
                              {item.title} ({item.type}) -{" "}
                              <a href={item.url} target="_blank" rel="noreferrer">View</a>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                    <tr><td><strong>Created At:</strong></td><td>{new Date(course.createdAt).toLocaleString()}</td></tr>
                    <tr><td><strong>Updated At:</strong></td><td>{new Date(course.updatedAt).toLocaleString()}</td></tr>
                  </>
                ) : (
                  <tr><td colSpan="2">Loading course data...</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <button className="btn" onClick={() => navigate(-1)}>← Back</button>
        </section>
      </main>
    </div>
  );
};

export default ViewCourse;
