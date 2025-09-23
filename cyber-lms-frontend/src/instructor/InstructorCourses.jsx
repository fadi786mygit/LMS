// src/Pages/InstructorDashboard.jsx
import React, { useEffect, useState } from "react";
import InstructorSidebar from "../Components/InstructorSidebar";
import { jwtDecode } from "jwt-decode";
import Toastify from "toastify-js";
import "../style.css";
import baseUrl from '../baseUrl';

export default function InstructorDashboard() {
  const [userData, setUserData] = useState({ fullName: "", role: "" });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sidebar toggle
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleContentClick = () => {
    if (window.innerWidth < 992 && sidebarOpen) setSidebarOpen(false);
  };

  // Toast helper
  const showToast = (msg, type = "success") => {
    Toastify({
      text: msg,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: type === "success" ? "green" : "red",
      },
    }).showToast();
  };

  // Fetch user + courses
  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        showToast("Unauthorized. Please log in.", "error");
        window.location.href = "/login";
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        const res = await fetch(
          `${baseUrl}/api/users/get-users/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        if (!res.ok) {
          showToast("Unauthorized. Please log in.", "error");
          window.location.href = "/login";
          return;
        }

        if (data.role !== "instructor") {
          showToast("Access denied. Instructors only.", "error");
          window.location.href = "/unauthorized";
          return;
        }

        setUserData({ fullName: data.fullName, role: data.role });
      } catch (err) {
        console.error("Error fetching user data:", err);
        showToast("Session expired. Please log in again.", "error");
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      }
    };

    const fetchCourses = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const res = await fetch(
          `${baseUrl}/api/courses/instructor`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("Error loading courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchCourses();
  }, []);


  const handleAddContent = (courseId) => {
    window.location.href = `/courses/${courseId}/add-content`;
  }

  // Delete Course
  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(
        `${baseUrl}/api/courses/${courseId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setCourses(courses.filter((c) => c._id !== courseId));
        showToast("Course deleted successfully");
      } else {
        showToast("Failed to delete course", "error");
      }
    } catch (err) {
      console.error("Error deleting course:", err);
    }
  };

  // Edit & Upload
  const handleEdit = (courseId) =>
    (window.location.href = `/instructor/edit-course/${courseId}`);



  // Loading screen
  if (loading) {
    return (
      <div className="dashboard-container d-flex bg-dark text-white">
        <InstructorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="main-content flex-grow-1 p-4 d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container d-flex bg-dark text-white">
      {/* Sidebar */}
      <InstructorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`main-content flex-grow-1 p-4 ${
          sidebarOpen ? "content-pushed" : ""
        }`}
        onClick={handleContentClick}
      >
        {/* Mobile Header */}
        <div className="mobile-header d-lg-none d-flex align-items-center p-3 bg-dark border-bottom">
          <button
            className="btn btn-outline-primary me-3"
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
          >
            <i className={`fas ${sidebarOpen ? "fa-times" : "fa-bars"}`}></i>
          </button>
          <h5 className="mb-0">Instructor Dashboard</h5>
        </div>

        {/* Desktop Topbar */}
        <header className="bg-black d-none d-lg-flex justify-content-between align-items-center p-3 shadow-sm border-bottom mb-4">
          <h4 className="text-white m-0">
            Welcome back, {userData.fullName} 👋
          </h4>
          <span className="badge bg-info fs-6">{userData.role}</span>
        </header>

        {/* Mobile Title */}
        <div className="d-lg-none d-block mb-4 mt-3">
          <h4 className="text-white">Welcome back, {userData.fullName} 👋</h4>
        </div>

        <div className="row g-4">
          {/* My Courses */}
          <div className="col-12 col-lg-8">
            <div className="dashboard-card bg-dark border rounded p-3 h-100">
              <h5 className="mb-3">My Courses</h5>
              {courses.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {courses.map((course) => (
                    <li
                      key={course._id}
                      className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{course.title}</strong> <br />
                        <small className="text-muted">{course.category}</small>{" "}
                        <br />
                        <span className="badge bg-secondary">
                          {course.level}
                        </span>
                      </div>
                      <div>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(course._id)}
                        >
                          Edit
                        </button>
                       
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(course._id)}
                        >
                          Delete
                        </button>

                        <button
                          className="btn btn-sm btn-info ms-2"
                          onClick={() => handleAddContent(course._id)}
                        >
                          Add Content
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No courses created yet.</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-12 col-lg-4">
            <div className="dashboard-card bg-dark border rounded p-3">
              <h6 className="mb-3">Quick Actions</h6>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    (window.location.href = "/instructor/create-course")
                  }
                >
                  + Create New Course
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => (window.location.href = "/instructor/assignments")}
                >
                  Manage Assignments
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => (window.location.href = "/instructor/quizzes")}
                >
                  Manage Quizzes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Font Awesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </div>
  );
}
