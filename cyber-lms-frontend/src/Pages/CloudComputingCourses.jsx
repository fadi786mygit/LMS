import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";
import axios from "axios";
import Navbar from "../Components/Navbar";
import baseUrl from '../baseUrl';

const CloudComputingCourses = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = sessionStorage.getItem("token"); // if you store JWT
        const res = await axios.get(
          `${baseUrl}/api/courses/getallcourses?category=cloud-computing`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCourses(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Error fetching cloud courses:", err.response?.data || err.message);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="ine-container">
      <Navbar />
      {/* Page Header */}
      <section className="hero-section small-hero">
        <div className="hero-content">
          <h1>Cloud Computing Courses</h1>
          <p>Master AWS, Azure, and Google Cloud to level up your career</p>
        </div>
      </section>

      {/* Courses List */}
      <section className="courses-section">
        <div className="section-header">
          <h2>All Cloud Computing Courses</h2>
          <p>Explore our complete collection of cloud training programs</p>
        </div>

        <div className="courses-grid">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div className="course-card" key={course._id}>
                {/* Image */}
                <div className="course-image">
                  <div className="image-placeholder">
                    <img
                      src={course.thumbnail || "/default-course.jpg"}
                      alt={course.title}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p className="course-description">
                    {course.description.slice(0, 35)}...
                  </p>

                  {/* Stats */}
                  <div className="course-stats">
                    <span className="badge">Level: {course.level}</span>
                    <span className="badge">Price: ${course.price}</span>
                  </div>

                  {/* Instructor */}
                  <p className="instructor">
                    Instructor: <strong>{course.instructor?.fullName}</strong>
                  </p>

                  {/* Button */}
                  <button
                    className="hero-button primary mt-2"
                    onClick={() => navigate(`/course/${course._id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "white", textAlign: "center" }}>
              No cloud courses available.
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="ine-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Products</h4>
            <a href="#">Cybersecurity Training</a>
            <a href="#">Cloud Training</a>
            <a href="#">Networking Training</a>
            <a href="#">Data Science Training</a>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Contact Us</a>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <a href="#">Learning Paths</a>
            <a href="#">Webinars</a>
            <a href="#">Practice Exams</a>
            <a href="#">Documentation</a>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-icons">
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-linkedin"></i></a>
              <a href="#"><i className="fab fa-facebook"></i></a>
              <a href="#"><i className="fab fa-youtube"></i></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Cyber Secret Society. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CloudComputingCourses;
