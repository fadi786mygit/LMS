// src/pages/InstructorCertificates.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import InstructorSidebar from "../Components/InstructorSidebar";
import baseUrl from '../baseUrl';

export default function InstructorCertificates() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  // ✅ Fetch instructor courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(
          `${baseUrl}/api/courses/instructor`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourses(res.data);
      } catch (err) {
        console.error("Error fetching courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [token]);

  // ✅ Sidebar toggle
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleContentClick = () => {
    if (window.innerWidth < 992 && sidebarOpen) setSidebarOpen(false);
  };

  return (
    <div className="dashboard-container bg-dark text-white d-flex">
      {/* Sidebar */}
      <InstructorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Content Area */}
      <div
        className={`main-content flex-grow-1 p-4 ${sidebarOpen ? "content-pushed" : ""}`}
        onClick={handleContentClick}
        style={{ paddingTop: "80px" }}
      >
        {/* Mobile Header */}
        <div className="mobile-header d-lg-none d-flex align-items-center p-3 bg-dark border-bottom">
          <button className="btn me-3" onClick={toggleSidebar}>
            <i className={`fas ${sidebarOpen ? "fa-times" : "fa-bars"}`}></i>
          </button>
          <h5 className="mb-0">Issue Certificates</h5>
        </div>

        {/* Desktop Topbar */}
        <div className="topbar d-none d-lg-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 text-primary fw-bold">
            <i className="fas fa-certificate me-2"></i>
            Issue Certificates
          </h2>
          <span className="badge bg-primary fs-6">
            {courses.length} Course{courses.length !== 1 ? "s" : ""}
          </span>
        </div>

        <hr className="border-secondary d-none d-lg-block" />

        {/* Content */}
        <div className="container-fluid">
          <div className="card shadow-lg border-secondary bg-dark text-white">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-3 text-muted">Loading courses...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-book fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No courses found</h5>
                  <p className="text-muted">
                    Create a course to start issuing certificates
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle text-center table-dark mb-0">
                    <thead className="table-primary text-dark">
                      <tr>
                        <th style={{ width: "60px" }}>#</th>
                        <th className="text-start">Course Title</th>
                        <th className="d-none d-md-table-cell text-start">
                          Description
                        </th>
                        <th style={{ width: "180px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course, index) => (
                        <tr key={course._id} className="border-secondary">
                          <td className="fw-bold text-primary">{index + 1}</td>
                          <td className="fw-semibold text-start">{course.title}</td>
                          <td className="text-white text-start d-none d-md-table-cell">
                            {course.description?.substring(0, 80) ||
                              "No description available"}
                            ...
                          </td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm px-3"
                              onClick={() =>
                                navigate(`/instructor/certificates/${course._id}`)
                              }
                            >
                              <i className="fas fa-users me-2"></i>
                              View Students
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Font Awesome (load globally in index.html ideally) */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </div>
  );
}
