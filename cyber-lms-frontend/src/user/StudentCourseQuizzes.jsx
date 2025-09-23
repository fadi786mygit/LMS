// StudentCourseQuizzes.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import UserSidebar from "../Components/UserSidebar";
import "../style.css";
import Toastify from "toastify-js";
import baseUrl from '../baseUrl';

export default function StudentCourseQuizzes() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toggle sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Toast helper
  const showToast = (msg, type = "success") => {
    Toastify({
      text: msg,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: { background: type === "success" ? "green" : "red" },
    }).showToast();
  };

  // Fetch course + quizzes + attempts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        // Fetch quizzes
        const quizRes = await axios.get(
          `${baseUrl}/api/student/courses/${courseId}/quizzes`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCourseData(quizRes.data.course || null);
        setQuizzes(quizRes.data.quizzes || []);

        // Fetch attempts
        const attemptsRes = await axios.get(
          `${baseUrl}/api/attempts/my?courseId=${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const list = Array.isArray(attemptsRes.data) ? attemptsRes.data : [];
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const attemptsMap = {};
        for (const attempt of list) {
          if (!attemptsMap[attempt.quiz]) {
            attemptsMap[attempt.quiz] = {
              status: attempt.status,
              score: attempt.score,
              attemptNumber: attempt.attemptNumber,
              createdAt: attempt.createdAt,
            };
          }
        }
        setAttempts(attemptsMap);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchData();
  }, [courseId]);

  // Start/Retake quiz
  const handleStartQuiz = async (quizId) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        showToast("No authentication token found");
        return;
      }
      await axios.post(
        `${baseUrl}/api/attempts/start`,
        { courseId, quizId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = `/user/courses/${courseId}/quizzes/${quizId}/attempt`;
    } catch (err) {
      console.error("Error starting quiz:", err);
      showToast("Failed to start quiz. Please try again.", "error");
    }
  };

  // Helpers
  const getQuizResult = (quizId) => {
    const attempt = attempts[quizId];
    if (attempt && ["submitted", "expired"].includes(attempt.status)) {
      return (
        <span
          className={`badge ${Number(attempt.score) > 0 ? "bg-success" : "bg-danger"} ms-2`}
        >
          Score: {attempt.score}/1
        </span>
      );
    }
    return null;
  };

  const shouldShowQuestion = (quizId) => {
    const attempt = attempts[quizId];
    return attempt && ["submitted", "expired"].includes(attempt.status);
  };

  // Loading
  if (loading) {
    return (
      <div className="dashboard-container bg-dark text-white d-flex">
        <UserSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="main-content flex-grow-1 p-4 d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status" />
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="dashboard-container bg-dark text-white d-flex">
        <UserSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="main-content flex-grow-1 p-4">
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container bg-dark text-white d-flex">
      {/* Sidebar */}
      <UserSidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        courseId={courseId}
        courseData={courseData}
        quizzes={quizzes}
      />

      {/* Main Content */}
      <div className="main-content flex-grow-1 p-4">
        {/* Mobile header */}
        <div className="mobile-header d-lg-none d-flex align-items-center mb-3">
          <button className="btn btn-outline-primary me-3" onClick={toggleSidebar}>
            <i className={`fas ${sidebarOpen ? "fa-times" : "fa-bars"}`} />
          </button>
          <h5 className="mb-0">Quizzes</h5>
        </div>

        {/* Desktop topbar */}
        <div className="d-none d-lg-flex justify-content-between align-items-center mb-4">
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-2"></i> Back
          </button>
          <h2 className="text-white mb-0">
            {courseData?.title ? `Quizzes - ${courseData.title}` : "Course Quizzes"}
          </h2>
          <span className="badge bg-primary">
            {quizzes.length} Quiz{quizzes.length !== 1 ? "zes" : ""}
          </span>
        </div>

        {/* Quizzes */}
        {quizzes.length > 0 ? (
          <div className="row">
            {quizzes.map((quiz) => {
              const attemptStatus = attempts[quiz._id];
              const showQuestion = shouldShowQuestion(quiz._id);

              return (
                <div key={quiz._id} className="col-xl-4 col-md-6 col-sm-12 mb-4">
                  <div className="card bg-secondary text-white h-100 quiz-card">
                    <div className="card-header">
                      <h6 className="mb-0">Quiz</h6>
                    </div>
                    <div className="card-body d-flex flex-column">
                      {showQuestion ? (
                        <>
                          <h6 className="card-title">{quiz.question}</h6>
                          <p className="card-text small flex-grow-1">
                            <strong>Options:</strong> {quiz.options.join(", ")}
                          </p>
                        </>
                      ) : (
                        <>
                          <h6 className="card-title text-warning">Question Hidden</h6>
                          <p className="card-text small flex-grow-1">
                            <em>Complete the quiz to see the question and options</em>
                          </p>
                        </>
                      )}

                      <div className="mt-auto">
                        {getQuizResult(quiz._id)}
                        {attemptStatus?.attemptNumber && (
                          <div className="mt-2">
                            <small className="text-light">
                              Attempt #{attemptStatus.attemptNumber}
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="card-footer">
                      <button
                        className="btn btn-primary btn-sm w-100"
                        onClick={() => handleStartQuiz(quiz._id)}
                      >
                        {attemptStatus?.status === "in_progress"
                          ? "Continue Quiz"
                          : attemptStatus
                          ? "Retake Quiz"
                          : "Start Quiz"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="alert alert-info">No Quizzes Available</div>
        )}
      </div>

      {/* Font Awesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </div>
  );
}
