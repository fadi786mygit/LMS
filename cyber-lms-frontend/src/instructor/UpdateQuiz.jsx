import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import InstructorSidebar from "../Components/InstructorSidebar";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import baseUrl from '../baseUrl';

export default function UpdateQuiz() {
  const { courseId, quizId } = useParams();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const res = await axios.get(
          `${baseUrl}/api/courses/${courseId}/quizzes/${quizId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const quizData = res.data.quiz || res.data;

        setQuestion(quizData.question);
        setOptions(quizData.options);
        setCorrectAnswer(
          quizData.options.indexOf(quizData.answer) !== -1
            ? quizData.options.indexOf(quizData.answer)
            : 0
        );
      } catch (err) {
        showToast("Error loading quiz", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [courseId, quizId]);

  // ✅ Sidebar toggle
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleContentClick = () => {
    if (window.innerWidth < 992 && sidebarOpen) setSidebarOpen(false);
  };

  // ✅ Update option text
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // ✅ Submit updated quiz
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");

      const correctAnswerIndex = Number(correctAnswer);

      await axios.put(
        `${baseUrl}/api/courses/${courseId}/quizzes/${quizId}`,
        {
          question,
          options,
          correctAnswer: correctAnswerIndex,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("Quiz Updated Successfully!");
      navigate("/instructor/quizzes");
    } catch (err) {
      console.error("Error updating quiz:", err.response?.data || err.message);
      showToast(
        "Error updating quiz: " + (err.response?.data?.message || err.message),
        "error"
      );
    }
  };

  const showToast = (msg, type = "success") => {
    Toastify({
      text: msg,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: { background: type === "success" ? "green" : "red" },
    }).showToast();
  };

  if (loading) return <p className="text-center mt-5">Loading quiz...</p>;

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
          >
            <i className={`fas ${sidebarOpen ? "fa-times" : "fa-bars"}`}></i>
          </button>
          <h5 className="mb-0">Update Quiz</h5>
        </div>

        {/* Desktop Topbar */}
        <header className="bg-black d-flex justify-content-between align-items-center p-3 shadow-sm border-bottom mb-4 d-none d-lg-flex">
          <h4 className="text-white m-0">✏️ Edit Quiz</h4>
        </header>

        {/* Form Card */}
        <div className="container d-flex justify-content-center">
          <div className="card shadow-lg p-4 w-75 bg-dark text-white border-secondary">
            <h3 className="text-center text-warning mb-4">Edit Quiz</h3>
            <form onSubmit={handleSubmit}>
              {/* Question */}
              <div className="mb-3">
                <label className="form-label fw-bold">Quiz Question</label>
                <input
                  type="text"
                  className="form-control bg-secondary text-white border-dark"
                  placeholder="Enter your quiz question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>

              {/* Options */}
              <div className="mb-3">
                <label className="form-label fw-bold">Options</label>
                {options.map((opt, index) => (
                  <input
                    key={index}
                    type="text"
                    className="form-control mb-2 bg-secondary text-white border-dark"
                    placeholder={`Option ${index + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                  />
                ))}
              </div>

              {/* Correct Answer */}
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Correct Answer (Index 0–{options.length - 1})
                </label>
                <input
                  type="number"
                  className="form-control bg-secondary text-white border-dark"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(Number(e.target.value))}
                  min="0"
                  max={options.length - 1}
                  required
                />
                <div className="form-text text-light">
                  Example: Enter <b>0</b> for Option 1, <b>1</b> for Option 2,
                  etc.
                </div>
              </div>

              {/* Submit */}
              <div className="text-center">
                <button type="submit" className="btn btn-primary px-4">
                  ✅ Update Quiz
                </button>
              </div>
            </form>
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
