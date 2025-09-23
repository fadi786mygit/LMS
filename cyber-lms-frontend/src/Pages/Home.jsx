import React, { useState, useEffect } from "react";
import "../style.css";
import axios from "axios";
import cybersecurity from '../Components/images/cyber-security.jpg';
import datascience from '../Components/images/datascience2.jpg';
import cloudcomputing from '../Components/images/cloud-computing2.jpg';
import { useNavigate } from "react-router-dom";
import Navbar from '../Components/Navbar';
import baseUrl from '../baseUrl';

const Home = () => {
  const [user, setUser] = useState(null);
  const [coursesData, setCoursesData] = useState([]); // ✅ state for courses
  const navigate = useNavigate();

  useEffect(() => {
    // Check token in sessionStorage
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (token) {
      // Get user data from sessionStorage or API
      const userName = sessionStorage.getItem("userName") || "User";
      const userEmail = sessionStorage.getItem("userEmail") || "user@example.com";
      
      setUser({ 
        name: userName, 
        email: userEmail,
        role: role 
      });
    }
  }, []);

  useEffect(() => {
    // ✅ fetch courses from backend
    axios
      .get(`${baseUrl}/api/courses/getallcourses`)
      .then((res) => {
        setCoursesData(res.data); // assuming backend sends an array of courses
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
      });
  }, []);


   // ✅ group courses by category
  const groupedCourses = coursesData.reduce((acc, course) => {
    const { category, hours } = course;
    if (!acc[category]) {
      acc[category] = { courses: [], totalHours: 0 };
    }
    acc[category].courses.push(course);
    acc[category].totalHours += hours || 0;
    return acc;
  }, {});

  return (
    <div className="ine-container">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Advance Your IT Career</h1>
          <p>
            Master in-demand technology skills with the industry's most
            advanced training platform
          </p>
          <div className="hero-buttons">
            <button
              className="hero-button primary"
              onClick={() => {
                const token = sessionStorage.getItem("token");
                if (token) {
                  navigate("/user/courses");
                } else {
                  navigate("/register");
                }
              }}
            >
              Start Learning
            </button>

            <button
              className="hero-button secondary"
              onClick={() => {
                const token = sessionStorage.getItem("token");
                if (token) {
                  navigate("/user/plans");
                } else {
                  navigate("/register");
                }
              }}
            >
              Explore Plans
            </button>
          </div>
        </div>
      </section>

   {/* Courses Section */}
<div className="courses-grid mt-4 mb-5">
  {Object.entries(groupedCourses).map(([category, data], index) => {
    let image =
      category.toLowerCase() === "cybersecurity"
        ? cybersecurity
        : category.toLowerCase() === "cloud computing"
        ? cloudcomputing
        : datascience;

    return (
      <div
        key={index}
        className="course-card"
        onClick={() => navigate(`/${category.toLowerCase()}-courses`)}
      >
        <div className="course-image">
          <div className={`image-placeholder ${category.toLowerCase()}`}>
            <img src={image} alt={category} />
          </div>
        </div>
        <div className="course-content">
          <h3>{category}</h3>
          <p>{data.courses[0]?.description?.slice(0, 60)}...</p>
          <div className="course-stats">
            <span>{data.courses.length} Courses</span>
    
            
          </div>
        </div>
      </div>
    );
  })}
</div>



      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose Cyber Secret Society?</h2>
          <p>Discover what makes our training platform unique</p>
        </div>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">
              <i className="fas fa-laptop-code"></i>
            </div>
            <h3>Hands-on Labs</h3>
            <p>Practice in real environments with our integrated lab platform</p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <h3>Expert Instructors</h3>
            <p>Learn from industry professionals with years of experience</p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <i className="fas fa-road"></i>
            </div>
            <h3>Learning Paths</h3>
            <p>
              Structured curriculum designed to take you from beginner to
              expert
            </p>
          </div>
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

export default Home;