import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../Components/images/logo.png";
import "../style.css";
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize to detect mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // On desktop, always keep sidebar open
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    showToast("Logged out");
    navigate("/login");
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

  // Function to handle li click and navigate
  const handleLiClick = (path) => {
    navigate(path);
    // Only close sidebar on mobile after clicking
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Toggle Button (visible only on small screens) */}
      {isMobile && (
        <button
          className="sidebar-toggle d-md-none"
          onClick={() => setIsOpen(true)}
        >
          <i className="fas fa-bars"></i>
        </button>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Close button (only on small screens) */}
        {isMobile && (
          <button
            className="sidebar-close d-md-none"
            onClick={() => setIsOpen(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        )}

        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => handleLiClick("/admin/dashboard")}>
              <div className="sidebar-link">
                <i className="fas fa-home"></i> Home
              </div>
            </li>
            <li onClick={() => handleLiClick("/admin/user-management")}>
              <div className="sidebar-link">
                <i className="fas fa-users"></i> User Management
              </div>
            </li>
            <li onClick={() => handleLiClick("/admin/instructors-management")}>
              <div className="sidebar-link">
                <i className="fas fa-chalkboard-teacher"></i> Instructor Management
              </div>
            </li>
            <li onClick={() => handleLiClick("/admin/courses")}>
              <div className="sidebar-link">
                <i className="fas fa-book"></i> Courses
              </div>
            </li>
            <li onClick={() => handleLiClick("/admin/instructor-requests")}>
              <div className="sidebar-link">
                <i className="fas fa-user-plus"></i> Instructor Requests
              </div>
            </li>
            <li onClick={() => handleLiClick("/admin/payment")}>
              <div className="sidebar-link">
                <i className="fas fa-credit-card"></i> Payments
              </div>
            </li>
            <li onClick={() => handleLiClick("/admin/reports")}>
              <div className="sidebar-link">
                <i className="fas fa-chart-line"></i> Reports & Analytics
              </div>
            </li>
            <li onClick={() => handleLiClick("/admin/tools")}>
              <div className="sidebar-link">
                <i className="fas fa-tools"></i> Tool Management
              </div>
            </li>
            <li onClick={() => handleLiClick("/admin/admin-settings")}>
              <div className="sidebar-link">
                <i className="fas fa-cog"></i> Settings
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