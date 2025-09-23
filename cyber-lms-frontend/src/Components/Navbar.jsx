// src/Components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../style.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLearningDropdownOpen, setIsLearningDropdownOpen] = useState(false);
  const [isMobileLearningDropdownOpen, setIsMobileLearningDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuBtnRef = useRef(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    
    if (token) {
      setUser({ name: "Fahad Sohail", email: "fahad@example.com" });
      setUserRole(role);
    }
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      // Close desktop dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLearningDropdownOpen(false);
      }

      // Close mobile menu when clicking outside
      if (isMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        // Check if the click is not on the mobile menu button
        const mobileMenuButton = document.querySelector('.mobile-menu-btn');
        if (!event.target.closest('.mobile-menu-btn') && !mobileMenuButton.contains(event.target)) {
          setIsMenuOpen(false);
          setIsLearningDropdownOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    setUser(null);
    setUserRole(null);
    navigate("/");
  };

  const navigateToDashboard = () => {
    const role = sessionStorage.getItem("role");
    if (role === "instructor") {
      navigate("/instructor/dashboard");
    } else if (role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/user/dashboard");
    }
  };

  return (
    <>
      <nav className="ine-nav">
        <div className="nav-container">
          {/* LEFT SIDE */}
          <div className="nav-left">
            <Link to="/" className="logo" style={{ textDecoration: "none", display: "block", cursor: "pointer" }}>
              <span className="ine-logo text-white">
                Cyber Secret Society
              </span>
            </Link>

            <div className="nav-links">
              {/* Learning Areas Dropdown */}
              <div
                className="dropdown-trigger nav-link"
                ref={dropdownRef}
                onClick={() => setIsLearningDropdownOpen(!isLearningDropdownOpen)}
              >
                Learning Areas
                <i className={`fas ${isLearningDropdownOpen ? "fa-chevron-up" : "fa-chevron-down"} ml-1`}></i>
                {isLearningDropdownOpen && (
                  <div className="dropdown-menu">
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/cybersecurity-courses");
                        setIsLearningDropdownOpen(false);
                      }}
                    >
                      <i className="fas fa-shield-alt"></i> Cybersecurity
                    </div>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/cloud-computing-courses");
                        setIsLearningDropdownOpen(false);
                      }}
                    >
                      <i className="fas fa-cloud"></i> Cloud
                    </div>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/data-science-courses");
                        setIsLearningDropdownOpen(false);
                      }}
                    >
                      <i className="fas fa-chart-bar"></i> Data Science
                    </div>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/networking-courses");
                        setIsLearningDropdownOpen(false);
                      }}
                    >
                      <i className="fas fa-network-wired"></i> Networking
                    </div>
                  </div>
                )}
              </div>

              <span
                className="nav-link"
                onClick={() => {
                  // Check if user is logged in
                  const token = sessionStorage.getItem("token");
                  if (!token) {
                    navigate("/login");
                    return;
                  }
                  navigate("/user/certificates");
                }}
              >
                Certifications
              </span>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="nav-right">
            {!user ? (
              <>
                <button
                  className="nav-button"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </button>
                <button
                  className="nav-button primary"
                  onClick={() => navigate("/register")}
                >
                  Start Learning
                </button>
              </>
            ) : (
              <>
                <button
                  className="nav-button primary"
                  onClick={navigateToDashboard}
                >
                  Dashboard
                </button>
                <button className="nav-button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
            <button
              className="mobile-menu-btn"
              ref={mobileMenuBtnRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu" ref={mobileMenuRef}>
          <div className="mobile-dropdown">
            <div
              className="mobile-menu-header"
              onClick={() => setIsMobileLearningDropdownOpen(!isMobileLearningDropdownOpen)}
            >
              Learning Areas
              <i
                className={`fas ${isMobileLearningDropdownOpen ? "fa-chevron-up" : "fa-chevron-down"
                  }`}
              ></i>
            </div>

            {isMobileLearningDropdownOpen && (
              <div className="mobile-dropdown-menu">
                <span
                  onClick={() => {
                    navigate("/cybersecurity-courses");
                    setIsMobileLearningDropdownOpen(false);
                    setIsMenuOpen(false);
                  }}
                  className="mobile-menu-link"
                >
                  <i className="fas fa-shield-alt"></i> Cybersecurity
                </span>
                <span
                  onClick={() => {
                    navigate("/cloud-computing-courses");
                    setIsMobileLearningDropdownOpen(false);
                    setIsMenuOpen(false);
                  }}
                  className="mobile-menu-link"
                >
                  <i className="fas fa-cloud"></i> Cloud
                </span>
                <span
                  onClick={() => {
                    navigate("/data-science-courses");
                    setIsMobileLearningDropdownOpen(false);
                    setIsMenuOpen(false);
                  }}
                  className="mobile-menu-link"
                >
                  <i className="fas fa-chart-bar"></i> Data Science
                </span>
                <span
                  onClick={() => {
                    navigate("/networking-courses");
                    setIsMobileLearningDropdownOpen(false);
                    setIsMenuOpen(false);
                  }}
                  className="mobile-menu-link"
                >
                  <i className="fas fa-network-wired"></i> Networking
                </span>
              </div>
            )}
          </div>

          <span
            className="mobile-menu-link"
            onClick={() => {
              // Check if user is logged in
              const token = sessionStorage.getItem("token");
              if (!token) {
                navigate("/login");
                setIsMenuOpen(false);
                setIsMobileLearningDropdownOpen(false);
                return;
              }
              navigate("/user/certificates");
              setIsMenuOpen(false);
              setIsMobileLearningDropdownOpen(false);
            }}
          >
            Certifications
          </span>

          <div className="mobile-menu-buttons">
            {!user ? (
              <>
                <button
                  className="mobile-menu-button"
                  onClick={() => {
                    navigate("/login");
                    setIsMenuOpen(false);
                  }}
                >
                  Sign In
                </button>
                <button
                  className="mobile-menu-button primary"
                  onClick={() => {
                    navigate("/register");
                    setIsMenuOpen(false);
                  }}
                >
                  Start Learning
                </button>
              </>
            ) : (
              <>
                <button
                  className="mobile-menu-button primary"
                  onClick={() => {
                    navigateToDashboard();
                    setIsMenuOpen(false);
                  }}
                >
                  Dashboard
                </button>
                <button
                  className="mobile-menu-button"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;