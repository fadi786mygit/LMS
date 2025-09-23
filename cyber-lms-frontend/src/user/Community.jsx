import React, { useState } from "react";
import UserSidebar from "../Components/UserSidebar";
import "../style.css";
import baseUrl from '../baseUrl';

export default function Community() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toggle sidebar visibility
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Close sidebar when clicking outside on mobile
  const handleContentClick = () => {
    if (window.innerWidth < 992 && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="dashboard-container d-flex bg-dark text-white">
      {/* Sidebar */}
      <UserSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

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
          <h5 className="mb-0">Community</h5>
        </div>

        {/* Topbar (Desktop only) */}
        <header className="bg-black d-flex justify-content-between align-items-center p-3 shadow-sm border-bottom mb-4 d-none d-lg-flex">
          <h4 className="text-white m-0">Community 👥</h4>
        </header>

        {/* Page Title (Mobile only) */}
        <div className="d-lg-none d-block mb-4 mt-3">
          <h4 className="text-white">Community</h4>
        </div>

        {/* Page Content */}
        <div className="dashboard-card bg-dark border rounded p-5 text-center">
          <h2 className="fw-bold text-white">🚧 Coming Soon...</h2>
          <p className="text-white mt-3">
            Our community forum and discussions will be available here soon. Stay tuned! 🚀
          </p>
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
