import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style.css";
import { jwtDecode } from "jwt-decode";
import Toastify from 'toastify-js';
import baseUrl from '../baseUrl';

const CourseDescription = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(`${baseUrl}/api/courses/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCourse(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching course:", err.response?.data || err.message);
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

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

  const handleEnroll = async () => {
    try {
      setIsEnrolling(true);
      const token = sessionStorage.getItem("token");

      // Check if user is a student
      const decoded = jwtDecode(token);
      if (decoded.role !== 'student') {
        showToast("Only students can enroll in courses", 'error');
        return;
      }
      
      // Call the correct enrollment endpoint with courseId in the body
      await axios.post(
        `${baseUrl}/api/courses/${id}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("Enrolled Successfully!");
      navigate("/user/courses"); // Redirect to enrolled courses page
    } catch (err) {
      console.error("Enrollment error:", err);
      showToast(err.response?.data?.message || "Enrollment failed");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (loading) {
    return (
      <div className="course-description-loading">
        <div className="pulse-loader">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-description-error">
        <h2>Course Not Found</h2>
        <p>Sorry, we couldn't find the course you're looking for.</p>
        <button className="glow-button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="course-description-container">
      {/* Animated Background Elements */}
      <div className="animated-bg">
        <div className="bg-circle-1"></div>
        <div className="bg-circle-2"></div>
        <div className="bg-circle-3"></div>
        <div className="bg-grid"></div>
      </div>

      <section className="course-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="slide-in-left">{course.title}</h1>
            <p className="fade-in">{course.description}</p>
            <div className="hero-badges">
              <span className="badge pulse">{course.level}</span>
              <span className="badge pulse">${course.price}</span>
            </div>
          </div>
          <div className="hero-image">
            <div className={`image-container ${imageLoaded ? 'loaded' : ''}`}>
              <img
                src={course.thumbnail || "/default-course.jpg"}
                alt={course.title}
                onLoad={handleImageLoad}
              />
              <div className="image-shine"></div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <span>Scroll</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      <section className="course-detail-section">
        <div className="course-detail-card">
          <h2 className="section-title">Course Overview</h2>
          <p className="course-long-desc">{course.longDescription || "No detailed description provided."}</p>

          <div className="course-metadata">
            <div className="metadata-item">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
              </div>
              <div className="metadata-text">
                <h3>Instructor</h3>
                <p>{course.instructor?.fullName || "Unknown Instructor"}</p>
              </div>
            </div>

            <div className="metadata-item">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M11,7H13V9H11V7M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,11H13V17H11V11Z" />
                </svg>
              </div>
              <div className="metadata-text">
                <h3>Duration</h3>
                <p>{course.duration || "Self-paced"}</p>
              </div>
            </div>

            <div className="metadata-item">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16" />
                </svg>
              </div>
              <div className="metadata-text">
                <h3>Level</h3>
                <p>{course.level}</p>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="hero-button primary mt-2"
              onClick={handleEnroll}
              disabled={isEnrolling}
            >
              {isEnrolling ? "Enrolling..." : "Enroll Now"}
            </button>
            
            <div className="metadata-item">
              <div className="metadata-text">
                <h3>Category</h3>
                <p>{course.category || "Uncategorized"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDescription;