// src/Components/InstructorSidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../Components/images/logo.png";
import "../style.css";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import baseUrl from '../baseUrl';

export default function InstructorSidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ✅ Detect screen resize (Bootstrap breakpoints)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true); // Desktop: sidebar always open
      } else {
        setIsOpen(false); // Mobile: sidebar hidden by default
      }
    };
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    showToast("Logged out");
    navigate("/login");
  };

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

  const handleLiClick = (path) => {
    navigate(path);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* ✅ Toggle Button (only on small screens) */}
      <div className="d-md-none">
        <button
          className="sidebar-toggle "
          onClick={() => setIsOpen(true)}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>

      {/* ✅ Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Close button (only for mobile) */}
        {isMobile && (
          <button
            className="sidebar-close  text-white"
            onClick={() => setIsOpen(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        )}

        <img src={logo} alt="Logo" className="logo" />

        <nav>
          <ul className="list-unstyled">
            <li onClick={() => handleLiClick("/instructor/dashboard")}>
              <div className="sidebar-link">
                <i className="fas fa-home"></i> Dashboard
              </div>
            </li>
            <li onClick={() => handleLiClick("/instructor/courses")}>
              <div className="sidebar-link">
                <i className="fas fa-book"></i> My Courses
              </div>
            </li>
            <li onClick={() => handleLiClick("/instructor/create-course")}>
              <div className="sidebar-link">
                <i className="fas fa-plus-circle"></i> Create Course
              </div>
            </li>
            <li onClick={() => handleLiClick("/instructor/assignments")}>
              <div className="sidebar-link">
                <i className="fas fa-tasks"></i> Assignments
              </div>
            </li>

              {/* <li onClick={() => handleLiClick("/instructor/upload-videos")}>
              <div className="sidebar-link">
                <i className="fas fa-video"></i> Upload Videos
              </div>
            </li> */}
            <li onClick={() => handleLiClick("/instructor/certificates")}>
              <div className="sidebar-link">
                <i className="fas fa-certificate"></i> Issue Certificates
              </div>
            </li>
            <li onClick={() => handleLiClick("/instructor/quizzes")}>
              <div className="sidebar-link">
                <i className="fas fa-question-circle"></i> Quizzes
              </div>
            </li>
            <li onClick={() => handleLiClick("/instructor/instructor-settings")}>
              <div className="sidebar-link">
                <i className="fas fa-user"></i> Profile
              </div>
            </li>
            <li onClick={handleLogout}>
              <div className="sidebar-link">
                <i className="fas fa-sign-out-alt"></i> Log Out
              </div>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
