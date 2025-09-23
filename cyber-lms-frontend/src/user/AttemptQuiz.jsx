import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import baseUrl from '../baseUrl';

export default function AttemptQuiz() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [quiz, setQuiz] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [quizTimer, setQuizTimer] = useState(50); // 50 seconds
  const [timerActive, setTimerActive] = useState(true);

  // ✅ Toast helper
  const showToast = (msg, type = "success") => {
    Toastify({
      text: msg,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: { background: type === "success" ? "green" : "red" },
    }).showToast();
  };

  // ✅ Load quiz + start attempt
  useEffect(() => {
    const load = async () => {
      try {
        const qRes = await fetch(
          `${baseUrl}/api/student/courses/${courseId}/quizzes/${quizId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const qData = await qRes.json();
        setQuiz(qData.quiz);
        setCourseTitle(qData.course?.title || "");

        const aRes = await fetch(`${baseUrl}/api/attempts/start`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseId, quizId }),
        });
        const aData = await aRes.json();
        setAttempt(aData);

        if (aData?.selectedIndex !== undefined) {
          setSelectedIndex(Number(aData.selectedIndex));
        }
      } catch (e) {
        console.error(e);
        showToast("Failed to load quiz/attempt", "error");
        navigate(-1);
      }
    };
    load();
  }, [courseId, quizId, token, navigate]);

  // ✅ Timer countdown
  useEffect(() => {
    if (!timerActive || !quiz) return;

    const timer = setInterval(() => {
      setQuizTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, quiz]);

  const formatQuizTimer = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // ✅ Auto submit
  const handleAutoSubmit = async () => {
    setTimerActive(false);
    setSubmitting(true);
    try {
      const res = await fetch(`${baseUrl}/api/attempts/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId, quizId, selectedIndex }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data?.message || "Auto-submit failed", "error");
      } else {
        showToast(`Time's up! Auto-submitted. Score: ${data.attempt?.score ?? 0}/1`);
        navigate(`/user/courses/${courseId}/quizzes`);
      }
    } catch (e) {
      console.error(e);
      showToast("Auto-submit failed", "error");
      navigate(`/user/courses/${courseId}/quizzes`);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Manual submit
  const handleSubmit = async () => {
    if (selectedIndex === null) {
      showToast("Please select an option.", "error");
      return;
    }
    setTimerActive(false);
    setSubmitting(true);

    try {
      const res = await fetch(`${baseUrl}/api/attempts/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId, quizId, selectedIndex }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data?.message || "Failed to submit", "error");
      } else {
        showToast(`Submitted! Score: ${data.attempt?.score ?? 0}/1`);
        navigate(`/user/courses/${courseId}/quizzes`);
      }
    } catch (e) {
      console.error(e);
      showToast("Submit failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const ended = quizTimer === 0;

  return (
    <div className="container mt-3">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          {/* Header */}
          <div className="mb-3 p-2 bg-light rounded d-flex justify-content-between align-items-center">
            <h5 className="m-0 text-primary">
              Quiz Attempt {courseTitle && `- ${courseTitle}`}
            </h5>
            <span
              className={`badge ${quizTimer <= 10 ? "bg-danger" : "bg-warning"} p-2 fs-6`}
            >
              ⏰ {formatQuizTimer(quizTimer)}
            </span>
          </div>

          {/* Quiz Card */}
          <div className="card shadow-sm">
            <div className="card-body p-3">
              <h6 className="mb-3">{quiz?.question}</h6>

              <div className="options-container">
                {quiz?.options?.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`option-item p-2 mb-2 rounded ${
                      selectedIndex === idx ? "bg-selected" : "bg-light"
                    }`}
                    onClick={() => !ended && setSelectedIndex(idx)}
                    style={{
                      cursor: ended ? "not-allowed" : "pointer",
                      transition: "all 0.2s ease",
                      borderLeft:
                        selectedIndex === idx
                          ? "4px solid #0d6efd"
                          : "4px solid transparent",
                    }}
                  >
                    <div className="form-check mb-0 d-flex align-items-center">
                      <input
                        className="form-check-input me-2"
                        type="radio"
                        name="opt"
                        id={`opt-${idx}`}
                        checked={selectedIndex === idx}
                        onChange={() => !ended && setSelectedIndex(idx)}
                        disabled={ended}
                      />
                      <label
                        htmlFor={`opt-${idx}`}
                        className="form-check-label"
                        style={{ cursor: ended ? "not-allowed" : "pointer" }}
                      >
                        {opt}
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => navigate(-1)}
                >
                  ⬅ Back
                </button>
                <button
                  className="btn btn-success btn-sm px-3"
                  onClick={handleSubmit}
                  disabled={ended || submitting}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Styling */}
      <style>{`
        .option-item:hover {
          background-color: #e9f0ff !important;
        }
        .bg-selected {
          background-color: #e9f0ff !important;
          border-color: #0d6efd !important;
        }
        .card {
          border-radius: 8px;
        }
        .options-container {
          max-width: 100%;
        }
      `}</style>
    </div>
  );
}
