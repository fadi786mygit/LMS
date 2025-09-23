// src/pages/InstructorCourseCertificates.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import InstructorSidebar from "../Components/InstructorSidebar";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import baseUrl from '../baseUrl';

export default function InstructorCourseCertificates() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  // ✅ Fetch course & students
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsRes = await axios.get(
          `${baseUrl}/api/courses/${courseId}/students`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStudents(studentsRes.data);

        const courseRes = await axios.get(
          `${baseUrl}/api/courses/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourse(courseRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, token]);

  // ✅ Toast utility
  const showToast = (msg, type = "success") => {
    Toastify({
      text: msg,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: { background: type === "success" ? "green" : "red" },
    }).showToast();
  };

  // ✅ Issue certificate
  const handleIssueCertificate = async (studentId) => {
    try {
      await axios.post(
        `${baseUrl}/api/certificates/${courseId}/issue/${studentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("✅ Certificate issued successfully!");
    } catch (err) {
      console.error("Error issuing certificate", err);
      showToast("❌ Could not issue certificate.", "error");
    }
  };

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
          <button className="btn me-3" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <h6 className="mb-0">Certificates</h6>
        </div>

        {/* Desktop Topbar */}
        <div className="topbar d-none d-lg-flex justify-content-between align-items-center mb-4">
          <div>
            <button
              className="btn btn-outline-light me-3"
              onClick={() => navigate(-1)}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Courses
            </button>
            <h2 className="mb-0 text-primary fw-bold">
              <i className="fas fa-certificate me-2"></i>
              Issue Certificates
            </h2>
            {course && (
              <p className="text-white mb-0">
                For course: <span className="text-warning">{course.title}</span>
              </p>
            )}
          </div>
          <span className="badge bg-info fs-6">
            {students.length} Student{students.length !== 1 ? "s" : ""}
          </span>
        </div>

        <hr className="border-secondary d-none d-lg-block" />

        {/* Main Content */}
        <div className="container-fluid">
          <div className="card shadow-lg border-secondary bg-dark">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status"></div>
                  <p className="mt-3 mb-0 text-muted">Loading students...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-users fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No students enrolled</h5>
                  <p className="text-muted">
                    Students will appear once they enroll in your course
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle text-center table-dark mb-0">
                    <thead className="table-success">
                      <tr>
                        <th style={{ width: "50px" }}>#</th>
                        <th className="text-start">Student Name</th>
                        <th className="text-start d-none d-md-table-cell">Email</th>
                        <th style={{ width: "100px" }}>Progress</th>
                        <th style={{ width: "180px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, index) => (
                        <tr key={student._id} className="border-secondary">
                          <td className="fw-bold text-primary">{index + 1}</td>
                          <td className="text-start fw-bold">{student.user.fullName}</td>
                          <td className="text-start d-none d-md-table-cell">
                            <a
                              href={`mailto:${student.user.email}`}
                              className="text-decoration-none text-white"
                            >
                              {student.user.email}
                            </a>
                          </td>
                          <td>
                            <div className="d-flex flex-column align-items-center">
                              <span
                                className={`badge ${
                                  student.progress >= 100
                                    ? "bg-success"
                                    : "bg-warning text-dark"
                                } mb-1`}
                              >
                                {student.progress}%
                              </span>
                              <div className="progress w-100" style={{ height: "4px" }}>
                                <div
                                  className={`progress-bar ${
                                    student.progress >= 100 ? "bg-success" : "bg-warning"
                                  }`}
                                  style={{ width: `${student.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {student.progress >= 100 ? (
                              <button
                                className="btn btn-success btn-sm px-3"
                                onClick={() => handleIssueCertificate(student.user._id)}
                              >
                                <i className="fas fa-award me-1"></i>
                                Issue
                              </button>
                            ) : (
                              <span className="text-white small">
                                <i className="fas fa-clock me-1"></i>
                                Incomplete
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {students.length > 0 && (
            <div className="row mt-4">
              <div className="col-md-4">
                <div className="card bg-secondary text-white text-center">
                  <div className="card-body py-3">
                    <h5 className="mb-1">
                      {students.filter((s) => s.progress >= 100).length}
                    </h5>
                    <p className="small mb-0">Completed</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-warning text-dark text-center">
                  <div className="card-body py-3">
                    <h5 className="mb-1">
                      {students.filter((s) => s.progress < 100 && s.progress > 0).length}
                    </h5>
                    <p className="small mb-0">In Progress</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-danger text-white text-center">
                  <div className="card-body py-3">
                    <h5 className="mb-1">
                      {students.filter((s) => s.progress === 0).length}
                    </h5>
                    <p className="small mb-0">Not Started</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
