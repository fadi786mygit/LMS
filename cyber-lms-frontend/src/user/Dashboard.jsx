import React, { useEffect, useState } from "react";
import Sidebar from "../Components/UserSidebar";
import { jwtDecode } from "jwt-decode";
import "../style.css";
import Toastify from 'toastify-js';
import baseUrl from '../baseUrl';

export default function Dashboard() {
  const [userData, setUserData] = useState({ fullName: "", role: "" });
  const [tools, setTools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Function to check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
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

  // Function to handle unauthorized access
  const handleUnauthorized = () => {
    showToast("Session expired. Please log in again.", 'error');
    sessionStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Enhanced fetch with token validation
  const fetchWithAuth = async (url, options = {}) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      handleUnauthorized();
      throw new Error("No token found");
    }

    if (isTokenExpired(token)) {
      handleUnauthorized();
      throw new Error("Token expired");
    }

    const defaultOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (response.status === 401 || response.status === 403) {
      handleUnauthorized();
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");

        if (!token) {
          handleUnauthorized();
          return;
        }

        if (isTokenExpired(token)) {
          handleUnauthorized();
          return;
        }

        const decoded = jwtDecode(token);
        const userId = decoded.id;

        // Fetch user data
        const userRes = await fetchWithAuth(
          `${baseUrl}/api/users/get-users/${userId}`
        );
        const userData = await userRes.json();

        if (userData.role !== "student") {
          showToast("Access denied. This dashboard is only for students.", 'error');
          window.location.href = "/unauthorized";
          return;
        }

        setUserData({ fullName: userData.fullName, role: userData.role });

        // Fetch enrollments
        try {
          const coursesRes = await fetchWithAuth(
            `${baseUrl}/api/enrollments/user/${userId}`
          );
          const enrolledCourses = await coursesRes.json();
          console.log("Enrolled courses:", enrolledCourses);
          setCourses(enrolledCourses);
        } catch (error) {
          console.error("Error fetching enrollments:", error);
          setCourses([]);
        }

        // Fetch tools
        try {
          const toolsRes = await fetchWithAuth(
            `${baseUrl}/api/categories/getCategories`
          );
          const categories = await toolsRes.json();
          let allTools = [];
          categories.forEach((cat) => {
            cat.tools.forEach((tool) => {
              allTools.push(tool);
            });
          });
          setTools(allTools);
        } catch (error) {
          console.error("Error loading tools:", error);
          setTools([]);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.message !== "Unauthorized" && err.message !== "Token expired") {
          showToast("Error loading dashboard data", 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside on mobile
  const handleContentClick = () => {
    if (window.innerWidth < 992 && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container bg-dark text-white">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
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

  return (
    <div className="dashboard-container bg-dark text-white">
      {/* Mobile Header with Toggle Button */}
      <div className="mobile-header d-lg-none d-flex align-items-center p-3 bg-dark border-bottom">
        <button
          className="btn btn-outline-primary me-3"
          onClick={toggleSidebar}
          aria-label="Toggle navigation"
        >
          <i className={`fas ${sidebarOpen ? "fa-times" : "fa-bars"}`}></i>
        </button>
        <h5 className="mb-0">Dashboard</h5>
      </div>

      {/* Fixed Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay d-lg-none"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div
        className={`main-content p-4 ${sidebarOpen ? "content-pushed" : ""}`}
        onClick={handleContentClick}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Welcome back, {userData.fullName} 👋</h3>
          <span id="userRole" className="badge bg-success">
            {userData.role || "Loading..."}
          </span>
        </div>

        <div className="row g-4">
          {/* Course Progress */}
          <div className="col-xl-6 col-lg-12">
            <div className="dashboard-card bg-dark border rounded p-3 h-100">
              <h5>Course Progress</h5>
              {courses.length === 0 ? (
                <p className="mb-0">No enrolled courses yet.</p>
              ) : (
                courses.map((enrollment, index) => (
                  <div key={index} className="mb-3">
                    <p className="mb-1 fw-bold">{enrollment.course.title}</p>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small>{enrollment.progress}% completed</small>
                      <a
                        href={`/user/courseVideo/${enrollment.course._id}`}
                        className="btn btn-sm btn-primary"
                      >
                        Continue
                      </a>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Goals */}
          <div className="col-xl-3 col-md-6 col-sm-12">
            <div className="dashboard-card bg-dark border rounded p-3 h-100">
              <h6>Today's Goals</h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <input type="checkbox" className="form-check-input me-2" />
                  Watch 1 video
                </li>
                <li className="mb-2">
                  <input type="checkbox" className="form-check-input me-2" />
                  Complete 1 Quiz
                </li>
                <li className="mb-2">
                  <input type="checkbox" className="form-check-input me-2" />
                  20 min reading
                </li>
              </ul>
              <div className="mt-3">
                <h6>KALI LINUX PRACTICE</h6>
                <p className="small mb-0">April 24, 2024</p>
              </div>
            </div>
          </div>

          {/* Labs */}
          <div className="col-xl-3 col-md-6 col-sm-12">
            <div className="dashboard-card bg-dark border rounded p-3 h-100">
              <h6>Labs</h6>
              <button className="btn btn-success w-100 mb-2">TryHackMe</button>
              <button className="btn btn-success w-100">Hack The Box</button>
            </div>
          </div>

          {/* Tools */}
          <div className="col-xl-3 col-md-6 col-sm-12">
            <div className="dashboard-card bg-dark border rounded p-3 h-100">
              <h6>Download Tools</h6>
              <div className="tools-container" style={{ maxHeight: "300px", overflowY: "auto" }}>
                <ul className="list-unstyled">
                  {tools.map((tool, index) => (
                    <li key={index} className="mb-2">
                      <a
                        href={tool.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white text-decoration-none d-flex align-items-center"
                      >
                        <i className="fa fa-download me-2"></i>
                        <span className="tool-name">{tool.name}</span>
                      </a>
                    </li>
                  ))}
                  {tools.length === 0 && (
                    <li className="text-muted">No tools available</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Tutorials */}
          <div className="col-xl-6 col-md-6 col-sm-12">
            <div className="dashboard-card bg-dark border rounded p-3 h-100">
              <h6>Tutorial Videos</h6>
              <div className="row">
                {/* Cybersecurity Intro */}
                <div className="col-md-6 mb-3">
                  <a
                    href="https://www.youtube.com/watch?v=vRqow9HqsgY&list=PLPIgTNaJAh1EUqv6lvx0HRfMfoEqmALKZ&index=2"  // 👉 put your real YouTube link
                    target="_blank"
                    rel="noreferrer"
                    className="text-decoration-none"
                  >
                    <div className="video-thumbnail position-relative">
                      <img
                        src="https://img.youtube.com/vi/vRqow9HqsgY/sddefault.jpg" // 👉 thumbnail from YouTube
                        alt="Tutorial 1"
                        className="img-fluid rounded"
                      />
                      <div className="play-button position-absolute top-50 start-50 translate-middle">
                        <i className="fas fa-play-circle fa-3x text-white opacity-75"></i>
                      </div>
                    </div>
                    <p className="mt-2 mb-0 text-white">Create a Virtual USB in Kali Linux</p>
                  </a>
                </div>

                {/* Network Security */}
                <div className="col-md-6 mb-3">
                  <a
                    href="https://www.youtube.com/watch?v=hWu-nF6u-qc&list=PLPIgTNaJAh1EUqv6lvx0HRfMfoEqmALKZ&index=1" // 👉 put your real YouTube link
                    target="_blank"
                    rel="noreferrer"
                    className="text-decoration-none"
                  >
                    <div className="video-thumbnail position-relative">
                      <img
                        src="https://img.youtube.com/vi/hWu-nF6u-qc/sddefault.jpg" // 👉 thumbnail from YouTube
                        alt="Tutorial 2"
                        className="img-fluid rounded"
                      />
                      <div className="play-button position-absolute top-50 start-50 translate-middle">
                        <i className="fas fa-play-circle fa-3x text-white opacity-75"></i>
                      </div>
                    </div>
                    <p className="mt-2 mb-0 text-white">USB Forensics with Kali Linux</p>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}