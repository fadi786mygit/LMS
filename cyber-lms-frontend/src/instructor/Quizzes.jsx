import React, { useEffect, useState } from "react";
import InstructorSidebar from "../Components/InstructorSidebar";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Toastify from "toastify-js";
import baseUrl from '../baseUrl';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({ fullName: "", role: "" });
  const navigate = useNavigate();

  // Toggle sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Close sidebar on mobile if content clicked
  const handleContentClick = () => {
    if (window.innerWidth < 992 && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        showToast("Unauthorized. Please log in.");
        window.location.href = "/login";
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        const res = await fetch(`${baseUrl}/api/users/get-users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) {
          showToast("Unauthorized. Please log in.");
          window.location.href = "/login";
          return;
        }

        if (data.role !== "instructor") {
          showToast("Access denied. Instructors only.");
          window.location.href = "/unauthorized";
          return;
        }

        setUserData({ fullName: data.fullName, role: data.role });
      } catch (err) {
        console.error("Error fetching user data:", err);
        showToast("Session expired. Please log in again.");
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      }
    };

    fetchUser();
  }, []);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const cRes = await fetch(`${baseUrl}/api/courses/instructor`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!cRes.ok) throw new Error("Failed to fetch courses");

        const cData = await cRes.json();
        setCourses(cData || []);
        if ((cData || []).length > 0) setSelectedCourseId(cData[0]._id);
      } catch (err) {
        setError(err.message || "Error loading courses");
      }
    };

    fetchCourses();
  }, []);

  // Fetch quizzes on course change
  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchQuizzes = async () => {
      const token = sessionStorage.getItem("token");
      setLoading(true);
      try {
        const qRes = await fetch(
          `${baseUrl}/api/courses/${selectedCourseId}/quizzes`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!qRes.ok) throw new Error("Failed to fetch quizzes");

        const qData = await qRes.json();
        setQuizzes(qData || []);
      } catch (err) {
        setError(err.message || "Error loading quizzes");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [selectedCourseId]);

  // Delete quiz
  const handleDelete = async (quizId) => {
    const token = sessionStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;

    try {
      const res = await fetch(
        `${baseUrl}/api/courses/${selectedCourseId}/quizzes/${quizId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to delete quiz");

      setQuizzes((prev) => prev.filter((quiz) => quiz._id !== quizId));
    } catch (err) {
      setError(err.message || "Error deleting quiz");
    }
  };

  // Update quiz
  const handleUpdate = (quizId) => {
    if (!selectedCourseId) return;
    navigate(`/courses/${selectedCourseId}/quizzes/${quizId}/edit`);
  };

  // Add quiz
  const handleGlobalAdd = () => {
    if (!selectedCourseId) return;
    navigate(`/instructor/courses/${selectedCourseId}/quizzes/add`);
  };

  // Toast
  const showToast = (msg, type = "success") => {
    Toastify({
      text: msg,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: { background: type === "success" ? "green" : "red" },
    }).showToast();
  };

  return (
    <div className="dashboard-container d-flex bg-dark text-white">
      {/* Sidebar */}
      <InstructorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`main-content flex-grow-1 p-4 ${sidebarOpen ? "content-pushed" : ""}`}
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
          <h5 className="mb-0">Quiz Management</h5>
        </div>

        {/* Desktop Topbar */}
        <header className="bg-black d-flex justify-content-between align-items-center p-3 shadow-sm border-bottom mb-4 d-none d-lg-flex">
          <h4 className="text-white m-0">📘 Quiz Management</h4>
          <span id="userRole" className="badge bg-info fs-6">
            {userData.role || "Instructor"}
          </span>
        </header>

        {/* Page Title (Mobile only) */}
        <div className="d-lg-none d-block mb-4 mt-3">
          <h4 className="text-white">📘 My Quizzes</h4>
        </div>

        {/* Filters + Actions */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
          <h2 className="fw-bold text-white m-0">My Quizzes</h2>

          <div className="d-flex gap-2 align-items-center flex-wrap">
            <select
              className="form-select form-select-sm bg-dark text-white border-secondary"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              style={{ minWidth: 240 }}
            >
              {courses.length === 0 ? (
                <option value="">No courses found</option>
              ) : (
                courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))
              )}
            </select>

            <button
              className="btn btn-primary btn-sm"
              onClick={handleGlobalAdd}
              disabled={!selectedCourseId}
            >
              ➕ Add Quiz
            </button>
          </div>
        </div>

        {/* Content Card */}
        <div className="dashboard-card bg-dark border rounded p-4">
          {loading && (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2">Loading quizzes...</p>
            </div>
          )}

          {error && <div className="alert alert-danger text-center">{error}</div>}

          {!loading && quizzes.length === 0 && (
            <div className="text-center text-muted py-4">
              <h5>No quizzes available yet 📭</h5>
              <p>Use "Add Quiz" to create one for this course.</p>
            </div>
          )}

          {!loading && quizzes.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle table-dark">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Quiz Question</th>
                  
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz, index) => (
                    <tr key={quiz._id || index}>
                      <td>{index + 1}</td>
                      <td className="fw-semibold">{quiz.question || quiz.title}</td>
                      <td className="d-flex gap-2">
              
                        <td className="d-flex gap-2">
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleUpdate(quiz._id)}
                          >
                            ✏️ Update
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(quiz._id)}
                          >
                            🗑 Delete
                          </button>
                        </td>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
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
