// src/pages/Admin/Payment.js
import React from "react";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";

const ReportsAnalytics = () => {
  return (
    <div className="admin-container d-flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className="main flex-grow-1"
        style={{
          marginLeft: "250px",
          transition: "margin-left 0.3s ease",
          backgroundColor: "#000", // black background
          minHeight: "100vh",
          color: "#fff",
        }}
      >
        <Topbar />

        <div className="container-fluid mt-4">
          <div className="card shadow-lg border-0 bg-dark text-white">
            <div className="card-header bg-dark text-white py-3">
              <h4 className="mb-0 text-center">📊 Reports & Analytics</h4>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
              <h2 className="text-white text-center">🚧 Coming Soon 🚧</h2>
            </div>
          </div>
        </div>
      </main>

      {/* Responsive CSS */}
      <style jsx>{`
        @media (max-width: 991.98px) {
          .main {
            margin-left: 0 !important;
          }
        }

        .sidebar {
          width: 250px;
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          z-index: 100;
        }
      `}</style>
    </div>
  );
};

export default ReportsAnalytics;
