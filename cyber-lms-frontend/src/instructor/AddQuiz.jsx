// src/pages/AddQuiz.jsx
import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import InstructorSidebar from "../Components/InstructorSidebar";
import Toastify from "toastify-js";
import baseUrl from '../baseUrl';

export default function AddQuiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleContentClick = () => {
    if (window.innerWidth < 992 && sidebarOpen) setSidebarOpen(false);
  };

  const showToast = (msg, type = "success") => {
    Toastify({
      text: msg,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: type === "success" ? "#28a745" : "#dc3545",
        borderRadius: "8px",
      },
    }).showToast();
  };

  const addNewQuiz = () => {
    setQuizzes([
      ...quizzes,
      { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    ]);
  };

  const handleQuestionChange = (qIndex, value) => {
    const updated = [...quizzes];
    updated[qIndex].question = value;
    setQuizzes(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...quizzes];
    updated[qIndex].options[optIndex] = value;
    setQuizzes(updated);
  };

  const handleCorrectAnswerChange = (qIndex, value) => {
    const updated = [...quizzes];
    updated[qIndex].correctAnswer = Number(value);
    setQuizzes(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");

      await axios.post(
        `${baseUrl}/api/courses/${courseId}/quiz`,
        { quizzes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("✅ Quizzes added successfully!");
      navigate("/instructor/quizzes");
      setQuizzes([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
    } catch (err) {
      console.error("Error adding quizzes:", err.response?.data || err.message);
      showToast(
        "❌ Error adding quizzes: " + (err.response?.data?.message || err.message),
        "error"
      );
    }
  };

  return (
    <div className="dashboard-container bg-dark text-white d-flex">
      {/* Sidebar */}
      <InstructorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`main-content flex-grow-1 p-4 ${sidebarOpen ? "content-pushed" : ""}`}
        onClick={handleContentClick}
        style={{ paddingTop: "80px" }}
      >
        {/* Mobile Header */}
        <div className="mobile-header d-lg-none d-flex align-items-center p-3 bg-dark border-bottom">
          <button className="btn me-3 text-white" onClick={toggleSidebar}>
            <i className={`fas ${sidebarOpen ? "fa-times" : "fa-bars"}`}></i>
          </button>
          <h5 className="mb-0">Add Quiz</h5>
        </div>

        {/* Desktop Topbar */}
        <div className="topbar d-none d-lg-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 text-warning fw-bold">
            <i className="fas fa-question-circle me-2"></i>
            Add Multiple Quizzes
          </h2>
        </div>

        <div className="container mt-3 d-flex justify-content-center">
          <div className="card shadow-lg p-4 w-100 bg-dark text-white border border-secondary rounded-3">
            <form onSubmit={handleSubmit}>
              {quizzes.map((quiz, qIndex) => (
                <div
                  key={qIndex}
                  className="mb-4 p-4 rounded-3 shadow-sm bg-secondary"
                >
                  <h5 className="text-light mb-3">
                    <i className="fas fa-edit me-2 text-warning"></i>
                    Question {qIndex + 1}
                  </h5>

                  {/* Question */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Question</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-light rounded-2"
                      placeholder="Enter quiz question"
                      value={quiz.question}
                      onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                      required
                    />
                  </div>

                  {/* Options with correct answer selection */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Options</label>
                    {quiz.options.map((opt, optIndex) => (
                      <div
                        key={optIndex}
                        className="input-group mb-2 align-items-center"
                      >
                        <div className="input-group-text bg-dark border-light">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={quiz.correctAnswer === optIndex}
                            onChange={() =>
                              handleCorrectAnswerChange(qIndex, optIndex)
                            }
                          />
                        </div>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-light rounded-end"
                          placeholder={`Option ${optIndex + 1}`}
                          value={opt}
                          onChange={(e) =>
                            handleOptionChange(qIndex, optIndex, e.target.value)
                          }
                          required
                        />
                      </div>
                    ))}
                    <small className="text-light">
                      Select the correct option by clicking the circle.
                    </small>
                  </div>
                </div>
              ))}

              {/* Add Another Question */}
              <div className="text-center mb-4">
                <button
                  type="button"
                  className="btn btn-outline-warning px-4 py-2 rounded-pill fw-bold"
                  onClick={addNewQuiz}
                >
                  ➕ Add Another Question
                </button>
              </div>

              {/* Submit */}
              <div className="text-center">
                <button
                  type="submit"
                  className="btn btn-success px-5 py-2 rounded-pill fw-bold"
                >
                   Save All Quizzes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </div>
  );
}
