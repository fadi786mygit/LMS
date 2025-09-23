// src/pages/Certificates.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import UserSidebar from "../Components/UserSidebar";
import { jwtDecode } from "jwt-decode";
import Toastify from "toastify-js";
import baseUrl from '../baseUrl';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topbarProfile, setTopbarProfile] = useState("../images/default-image.png");
  const [userFullName, setUserFullName] = useState("Loading...");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({ fullName: "", role: "" });

  const token = sessionStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : {};
  const userId = decoded.id;

  // Sidebar toggle
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleContentClick = () => {
    if (window.innerWidth < 992 && sidebarOpen) setSidebarOpen(false);
  };

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

  // Load user profile
  const loadUserData = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/users/get-users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load user profile");

      const data = await res.json();
      setUserFullName(data.fullName || "Student");
      setUserData({ fullName: data.fullName, role: data.role });

      if (data.profileImage) {
        const imgFile = data.profileImage.split("/").pop();
        setTopbarProfile(`${baseUrl}/uploads/${imgFile}?t=${Date.now()}`);
      }
    } catch (err) {
      console.error("Load user error:", err);
    }
  };

  // Load enrollments + certificates
  const fetchCertificates = async () => {
    try {
      // Issued certs
      const certRes = await axios.get(`${baseUrl}/api/certificates/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const certs = certRes.data;

      // Enrollments
      const enrollRes = await axios.get(
        `${baseUrl}/api/enrollments/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const enrollments = enrollRes.data;

      // Merge enrollments with certs
      const merged = enrollments.map((en) => {
        const existingCert = certs.find((c) => c.course?._id === en.course?._id);
        return existingCert || { course: en.course, progress: en.progress };
      });

      setCertificates(merged);
      setError(null);
    } catch (err) {
      console.error("Error fetching certificates", err);
      setError("Failed to load certificates. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCertificates();
      loadUserData();
    }
  }, [token, userId]);

  // Download certificate
  const handleDownloadCertificate = async (certificateId, courseTitle) => {
    try {
      const fileRes = await axios.get(
        `${baseUrl}/api/certificates/download/${certificateId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([fileRes.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${courseTitle.replace(/\s+/g, "_")}_certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading certificate:", err);
      showToast("Could not download certificate", "error");
    }
  };

  // Generate certificate
  const handleGenerateCertificate = async (courseId) => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/certificates/issue/${courseId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.certificate) {
        showToast("Certificate issued successfully!");
        fetchCertificates(); // Refresh
      } else {
        showToast(response.data.message || "Certificate generation failed", "error");
      }
    } catch (err) {
      console.error("Error issuing certificate:", err);
      const errorMsg = err.response?.data?.message || "Could not issue certificate";
      showToast(errorMsg, "error");
    }
  };

  // 🔹 Loading spinner
  if (loading) {
    return (
      <div className="dashboard-container bg-dark text-white">
        <UserSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="main-content p-4">
          <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Page UI
  return (
    <div className="dashboard-container bg-dark text-white">
      {/* Mobile Header */}
      <div className="mobile-header d-lg-none d-flex align-items-center p-3 bg-dark border-bottom">
        <button className="btn btn-outline-primary me-3" onClick={toggleSidebar} aria-label="Toggle navigation">
          <i className={`fas ${sidebarOpen ? "fa-times" : "fa-bars"}`}></i>
        </button>
        <h5 className="mb-0">Certificates</h5>
        <div className="ms-auto">
          <img
            src={topbarProfile}
            alt="Profile"
            className="profile-image"
            style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "50%", border: "2px solid white" }}
          />
        </div>
      </div>

      {/* Sidebar */}
      <UserSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      {sidebarOpen && <div className="sidebar-overlay d-lg-none" onClick={toggleSidebar}></div>}

      {/* Main Content */}
      <div className={`main-content p-4 ${sidebarOpen ? "content-pushed" : ""}`} onClick={handleContentClick} style={{ paddingTop: "80px" }}>
        {/* Desktop Header */}
        <header className="bg-black d-flex justify-content-between align-items-center p-3 shadow-sm border-bottom mb-4 d-none d-lg-flex">
          <h4 className="text-white m-0">My Certificates</h4>
          <div className="d-flex align-items-center">
            <span className="me-3 text-white fw-semibold">{userFullName}</span>
            <img
              src={topbarProfile}
              alt="Profile"
              className="profile-image"
              style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "50%", border: "2px solid white" }}
            />
          </div>
        </header>

        {/* Certificates Section */}
        <div className="d-flex justify-content-center align-items-start">
          <div className="card shadow-lg border-0 w-100 bg-dark text-white" style={{ maxWidth: "1000px" }}>
            <div className="card-header bg-primary text-white py-3 text-center">
              <h4 className="mb-0">🎓 My Certificates</h4>
            </div>

            {error ? (
              <div className="alert alert-danger m-3 text-center">{error}</div>
            ) : certificates.length === 0 ? (
              <div className="text-center py-5 text-white">
                <i className="fas fa-trophy fa-3x text-secondary mb-3"></i>
                <h5 className="mt-3">No courses enrolled</h5>
              </div>
            ) : (
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle text-center table-dark">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Course</th>
                        <th className="d-none d-md-table-cell">Description</th>
                        <th className="d-none d-lg-table-cell">Certificate ID</th>
                        <th>Issued On</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificates.map((cert, index) => (
                        <tr key={cert._id || index}>
                          <td>{index + 1}</td>
                          <td className="fw-bold">{cert.course?.title}</td>
                          <td className="text-truncate d-none d-md-table-cell" style={{ maxWidth: "250px" }}>
                            {cert.course?.description}
                          </td>
                          <td className="d-none d-lg-table-cell">
                            {cert.certificateId ? (
                              <span className="badge bg-secondary">{cert.certificateId}</span>
                            ) : (
                              <span className="text-warning">Not Issued</span>
                            )}
                          </td>
                        
                          <td>
                            {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : "—"}
                          </td>
                          <td>
                            {cert.certificateId ? (
                              <button
                                className="btn btn-sm btn-success rounded-pill"
                                onClick={() => handleDownloadCertificate(cert.certificateId, cert.course?.title)}
                              >
                                <i className="fas fa-download me-1"></i> Download
                              </button>
                            ) : cert.progress === 100 ? (
                              <button
                                className="btn btn-sm btn-primary rounded-pill"
                                onClick={() => handleGenerateCertificate(cert.course?._id)}
                              >
                                <i className="fas fa-award me-1"></i> Generate
                              </button>
                            ) : (
                              <span className="badge bg-secondary">Incomplete</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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

export default Certificates;
