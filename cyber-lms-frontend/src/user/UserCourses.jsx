import React, { useEffect, useState } from "react";
import Sidebar from "../Components/UserSidebar";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "../style.css";
import Toastify from "toastify-js";
import baseUrl from '../baseUrl';

export default function UserCourses() {
  const [userData, setUserData] = useState({ fullName: "", role: "" });
  const [myCourses, setMyCourses] = useState([]);
  const [topbarProfile, setTopbarProfile] = useState("../images/default-image.png");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // Toastify Helper
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

  useEffect(() => {
    const fetchUserAndCourses = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        showToast("Unauthorized. Please log in.", "error");
        window.location.href = "/login";
        return;
      }

      try {
        // Decode JWT
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        // Fetch user info
        const userRes = await axios.get(
          `${baseUrl}/api/users/get-users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const user = userRes.data;

        if (user.role !== "student") {
          showToast("Access denied. Only students can access My Courses.");
          window.location.href = "/unauthorized";
          return;
        }

        setUserData({ fullName: user.fullName, role: user.role });

        // ✅ FIX: Use Cloudinary URL directly
        if (user.profileImage) {
          setTopbarProfile(user.profileImage);
        } else {
          setTopbarProfile("../images/default-image.png");
        }

        // Fetch enrolled courses
        const courseRes = await axios.get(
          `${baseUrl}/api/courses/my-courses`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // ✅ FIX: Filter out null courses before setting state
        const validCourses = courseRes.data.filter(course => course !== null);
        setMyCourses(validCourses);

        // ✅ Optional: Log any invalid courses for debugging
        const invalidCourses = courseRes.data.filter(course => course === null);
        if (invalidCourses.length > 0) {
          console.warn(`Found ${invalidCourses.length} invalid course records`);
        }

      } catch (err) {
        console.error("Error fetching courses:", err);
        showToast("Session expired. Please log in again.", "error");
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndCourses();
  }, []);

  // ✅ FIX: Add safe rendering for courses
  const renderCourseCard = (course) => {
    if (!course) {
      return (
        <div className="col-xl-4 col-md-6 col-sm-12 mb-4">
          <div className="card bg-dark border text-white h-100">
            <div className="card-body text-center">
              <i className="fas fa-exclamation-triangle fa-2x text-warning mb-3"></i>
              <h6>Course Not Available</h6>
              <p className="small text-muted">This course may have been removed.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="col-xl-4 col-md-6 col-sm-12 mb-4" key={course._id}>
        <div className="card bg-dark border text-white h-100">
          <img
            src={course.thumbnail || "/default-course.jpg"}
            className="card-img-top"
            alt={course.title}
            style={{ height: "180px", objectFit: "cover" }}
            onError={(e) => {
              e.target.src = "/default-course.jpg";
            }}
          />
          <div className="card-body d-flex flex-column">
            <h5 className="card-title">{course.title || "Untitled Course"}</h5>
            <p className="card-text small flex-grow-1">
              {course.description ? `${course.description.substring(0, 100)}...` : "No description available."}
            </p>
            <div className="mt-auto">
              <p className="mb-1">
                <span className="badge bg-info">
                  Level: {course.level || "Not specified"}
                </span>
              </p>
              <p>
                <span className="badge bg-success">
                  Price: ${course.price || "0"}
                </span>
              </p>
            </div>
          </div>
          <div className="card-footer text-center">
            <div className="d-grid gap-2">
              <button
                className="btn btn-primary"
                onClick={() =>
                  window.location.href = `/user/courseVideo/${course._id}`
                }
              >
                Go to Course
              </button>
              <button
                className="btn btn-warning"
                onClick={() =>
                  window.location.href = `/user/courses/${course._id}/quizzes`
                }
              >
                Take Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-container bg-dark text-white">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="main-content p-4">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "50vh" }}
          >
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
      {/* Mobile Header */}
      <div className="mobile-header d-lg-none d-flex align-items-center p-3 bg-dark border-bottom">
        <button
          className="btn btn-outline-primary me-3"
          onClick={toggleSidebar}
          aria-label="Toggle navigation"
        >
          <i className={`fas ${sidebarOpen ? "fa-times" : "fa-bars"}`}></i>
        </button>
        <h5 className="mb-0">My Courses</h5>

        {/* Mobile profile image */}
        <div className="ms-auto">
          <img
            src={topbarProfile}
            alt="Profile"
            className="profile-image"
            style={{
              width: "40px",
              height: "40px",
              objectFit: "cover",
              borderRadius: "50%",
              border: "2px solid white",
            }}
            onError={(e) => {
              e.target.src = "../images/default-image.png";
            }}
          />
        </div>
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
        style={{ paddingTop: "80px" }}
      >
        {/* Topbar (desktop only) */}
        <header className="bg-black d-flex justify-content-between align-items-center p-3 shadow-sm border-bottom mb-4 d-none d-lg-flex">
          <h4 className="text-white m-0">My Courses 🎓</h4>
          <div className="d-flex align-items-center">
            <span className="me-3 text-white fw-semibold">
              {userData.fullName}
            </span>
            <img
              src={topbarProfile}
              alt="Profile"
              className="profile-image"
              style={{
                width: "45px",
                height: "45px",
                objectFit: "cover",
                borderRadius: "50%",
                border: "2px solid white",
              }}
              onError={(e) => {
                e.target.src = "../images/default-image.png";
              }}
            />
          </div>
        </header>

        {/* Mobile title */}
        <div className="d-lg-none d-block mb-4 mt-3">
          <h4 className="text-white">My Courses 🎓</h4>
          <p className="text-white mt-2">Welcome back, {userData.fullName}</p>
        </div>

        {/* Courses Section */}
        <div className="row g-4">
          <div className="col-12">
            <div className="bg-dark border rounded p-3">
              {myCourses.length > 0 ? (
                <div className="row">
                  {myCourses.map(renderCourseCard)}
                </div>
              ) : (
                <div className="text-center text-white py-5">
                  <i className="fas fa-book-open fa-3x mb-3 text-white"></i>
                  <h4>No Courses Enrolled Yet</h4>
                  <p className="text-muted">
                    You haven't enrolled in any courses yet.
                  </p>
                  <button
                    className="btn btn-primary mt-2"
                    onClick={() => (window.location.href = "/")}
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}