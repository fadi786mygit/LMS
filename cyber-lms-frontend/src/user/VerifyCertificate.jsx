// src/pages/VerifyCertificate.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import UserSidebar from "../Components/UserSidebar";
import { jwtDecode } from "jwt-decode";
import Toastify from "toastify-js";
import baseUrl from '../baseUrl';

const VerifyCertificate = () => {
  const [certId, setCertId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [topbarProfile, setTopbarProfile] = useState("../images/default-image.png");
  const [userData, setUserData] = useState({ fullName: "", role: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = sessionStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : {};
  const userId = decoded.id;

  // Sidebar toggle
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleContentClick = () => {
    if (window.innerWidth < 992 && sidebarOpen) {
      setSidebarOpen(false);
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

  // Load user profile
  const loadUserData = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/users/get-users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load user profile");

      const data = await res.json();
      setUserData({ fullName: data.fullName, role: data.role });

      if (data.profileImage) {
        const imgFile = data.profileImage.split("/").pop();
        setTopbarProfile(`${baseUrl}/uploads/${imgFile}?t=${Date.now()}`);
      }
    } catch (err) {
      console.error("Load user error:", err);
    }
  };

  useEffect(() => {
    if (token) loadUserData();
  }, [token, userId]);

  // Handle verification
  const handleVerify = async () => {
    if (!certId) return showToast("Please enter certificate ID", "error");
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.get(
        `${baseUrl}/api/certificates/verify/${certId}`
      );
      setResult(res.data);
    } catch (err) {
      setResult({ verified: false, message: "Invalid certificate ID" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container d-flex bg-dark text-white">
      {/* Sidebar */}
      <UserSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`main-content flex-grow-1 ${sidebarOpen ? "content-pushed" : ""}`}
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
          <h5 className="mb-0">Verify Certificate</h5>
          <div className="ms-auto">
            <img
              src={topbarProfile}
              alt="Profile"
              className="profile-image"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "2px solid white",
                objectFit: "cover",
              }}
            />
          </div>
        </div>

        {/* Topbar */}
        <header className="bg-black d-flex justify-content-between align-items-center p-3 shadow-sm border-bottom mb-4 d-none d-lg-flex">
          <h4 className="text-white m-0">Verify Certificate</h4>
          <div className="d-flex align-items-center">
            <span className="me-3 fw-semibold">{userData.fullName}</span>
            <img
              src={topbarProfile}
              alt="Profile"
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                border: "2px solid white",
                objectFit: "cover",
              }}
            />
          </div>
        </header>

        {/* Page Title (mobile) */}
        <div className="d-lg-none d-block mb-4 mt-3">
          <h4 className="text-white">Verify Certificate</h4>
          <p className="text-white mt-2">Welcome back, {userData.fullName}</p>
        </div>

        {/* Page Content */}
        <div className="d-flex justify-content-center">
          <div
            className="card shadow-lg p-4 w-100 bg-dark text-white border-0"
            style={{ maxWidth: "700px" }}
          >
            <h3 className="text-center mb-3">🔍 Verify Certificate</h3>
            <p className="text-center text-muted mb-4">
              Enter a certificate ID to verify its authenticity
            </p>

            {/* Input */}
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control bg-secondary text-white border-secondary"
                placeholder="Enter Certificate ID"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              />
              <button
                className="btn btn-primary"
                onClick={handleVerify}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div
                className={`alert ${
                  result.verified ? "alert-success" : "alert-danger"
                }`}
              >
                {result.verified ? (
                  <>
                    <h5>✅ Certificate Verified</h5>
                    <hr />
                    <p><b>Name:</b> {result.user.fullName}</p>
                    <p><b>Email:</b> {result.user.email}</p>
                    <p><b>Course:</b> {result.course}</p>
                    <p><b>Status:</b> <span className="badge bg-success">Valid</span></p>
                  </>
                ) : (
                  <>
                    <h5>❌ Verification Failed</h5>
                    <p>{result.message}</p>
                  </>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="mt-4 p-3 bg-secondary rounded">
              <h6>How to find your Certificate ID:</h6>
              <ul className="small mb-0">
                <li>Check your downloaded certificate PDF</li>
                <li>Visit your Certificates page to copy the ID</li>
              </ul>
            </div>
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
};

export default VerifyCertificate;
