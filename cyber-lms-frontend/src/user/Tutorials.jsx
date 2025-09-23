import React, { useState } from "react";
import UserSidebar from "../Components/UserSidebar";
import "../style.css";
import baseUrl from '../baseUrl';

export default function Tutorial() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sample tutorials
  const tutorials = [
    {
      id: 1,
      title: "Create a Virtual USB in Kali Linux",
      videoId: "vRqow9HqsgY",
      link: "https://www.youtube.com/watch?v=vRqow9HqsgY&list=PLPIgTNaJAh1EUqv6lvx0HRfMfoEqmALKZ&index=2",
    },
    {
      id: 2,
      title: "USB Forensics with Kali Linux",
      videoId: "hWu-nF6u-qc",
      link: "https://www.youtube.com/watch?v=hWu-nF6u-qc&list=PLPIgTNaJAh1EUqv6lvx0HRfMfoEqmALKZ&index=1",
    },
    {
      id: 3,
      title: "Why Ethical Hacking Matters",
      videoId: "_nV8p6c3W_E",
      link: "https://www.youtube.com/watch?v=_nV8p6c3W_E",
    },
    {
      id: 4,
      title: "Maltego vs theHarvester",
      videoId: "j6nr3wwhX-8",
      link: "https://www.youtube.com/watch?v=j6nr3wwhX-8",
    },
  ];

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
          <h5 className="mb-0">Tutorials</h5>
        </div>

        {/* Topbar (Desktop only) */}
        <header className="bg-black d-flex justify-content-between align-items-center p-3 shadow-sm border-bottom mb-4 d-none d-lg-flex">
          <h4 className="text-white m-0">Tutorial Videos 🎥</h4>
        </header>

        {/* Page Title (Mobile only) */}
        <div className="d-lg-none d-block mb-4 mt-3">
          <h4 className="text-white">Tutorial Videos</h4>
        </div>

        {/* Page Content */}
        <div className="dashboard-card bg-dark border rounded p-4">
          <div className="row">
            {tutorials.map((tutorial) => (
              <div key={tutorial.id} className="col-lg-3 col-md-6 mb-4">
                <a
                  href={tutorial.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-decoration-none"
                >
                  <div className="video-thumbnail position-relative">
                    <img
                      src={`https://img.youtube.com/vi/${tutorial.videoId}/sddefault.jpg`}
                      alt={tutorial.title}
                      className="img-fluid rounded shadow-sm"
                    />
                    <div className="play-button position-absolute top-50 start-50 translate-middle">
                      <i className="fas fa-play-circle fa-3x text-white opacity-75"></i>
                    </div>
                  </div>
                  <p className="mt-2 mb-0 text-white fw-bold">{tutorial.title}</p>
                </a>
              </div>
            ))}
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
