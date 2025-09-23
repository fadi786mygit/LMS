import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";


export default function UserSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const logout = () => {
    sessionStorage.removeItem("token");
    showToast("Log out successfully");
    setTimeout(() => navigate("/login"), 1000);
  };

  const navItems = [
    { name: "Dashboard", icon: "fa-house", path: "/user/dashboard" },
    { name: "Courses", icon: "fa-book-open", path: "/user/courses" },
    { name: "Certifications", icon: "fa-certificate", path: "/user/certificates" },
    { name: "Verify Certificate", icon: "fa-check-circle", path: "/user/verify-certificate" },
    { name: "Labs", icon: "fa-flask", path: "/user/labs" },
    { name: "Tutorials", icon: "fa-tv", path: "/user/tutorials" },
    { name: "Community", icon: "fa-users", path: "/user/community" },
    { name: "Settings", icon: "fa-gear", path: "/user/user-setting" },
  ];

  const handleLiClick = (path) => {
    navigate(path);
    if (isMobile) setIsOpen(false);
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

  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <button
          className="sidebar-toggle d-md-none"
          onClick={() => setIsOpen(true)}
        >
          <i className="fas fa-bars"></i>
        </button>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Close button for mobile */}
        {isMobile && (
          <button
            className="sidebar-close d-md-none"
            onClick={() => setIsOpen(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        )}

        {/* Sidebar Header */}
        <div className="sidebar-header">
          <h4 className="text-white fw-bold text-center">CYBERSECURE</h4>
          <button
            onClick={() => navigate("/")}
            className="btn btn-outline-success text-white w-100 mt-3"
          >
            <i className="fa fa-home me-2"></i> Back to home
          </button>
        </div>

        {/* Navigation */}
        <nav>
          <ul>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li
                  key={item.name}
                  onClick={() => handleLiClick(item.path)}
                  className={isActive ? "active" : ""}
                >
                  <div className="sidebar-link">
                    <i className={`fas ${item.icon}`}></i> {item.name}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <li onClick={logout}>
            <div className="sidebar-link">
              <i className="fas fa-sign-out-alt"></i> Log Out
            </div>
          </li>
        </div>
      </aside>
    </>
  );
}
