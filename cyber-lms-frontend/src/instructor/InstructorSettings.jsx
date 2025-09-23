// src/pages/InstructorSettings.jsx
import React, { useEffect, useState, useCallback } from "react";
import "../style.css";
import Toastify from "toastify-js";
import InstructorSidebar from "../Components/InstructorSidebar";
import baseUrl from '../baseUrl';

const InstructorSettings = () => {
  const defaultImage = "/images/default-image.png";
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    profileImage: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(defaultImage);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem("token");

  // Redirect if no token
  useEffect(() => {
    if (!token) window.location.href = "/login";
  }, [token]);

  const showToast = useCallback((msg, color) => {
    Toastify({ text: msg, backgroundColor: color, duration: 3000 }).showToast();
  }, []);

  const getImageUrl = (imgPath) => {
  if (!imgPath) return defaultImage;

  // If it's already a Cloudinary (or external) URL, return as is
  if (imgPath.startsWith("http")) return imgPath;

  // Otherwise assume it's a local upload
  return `${baseUrl}/uploads/${imgPath}`;
};


  // Fetch instructor profile
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/api/instructor/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch profile");

      setProfile({
        fullName: data.fullName || "",
        email: data.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        profileImage: data.profileImage || "",
      });
      setImagePreview(getImageUrl(data.profileImage));
    } catch (err) {
      showToast(err.message, "red");
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return showToast("Please upload a valid image file", "red");
    if (file.size > 5 * 1024 * 1024)
      return showToast("Image must be smaller than 5MB", "red");
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

const uploadImage = async () => {
  const formData = new FormData();
  formData.append("profileImage", selectedImage);

  const res = await fetch(`${baseUrl}/api/instructor/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result.profileImage;
};


  const validatePassword = () => {
    const errors = {};
    if (profile.newPassword && profile.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }
    if (profile.newPassword !== profile.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (profile.newPassword && !validatePassword()) return;

    setLoading(true);
    try {
      let imageName = profile.profileImage;
      if (imageName && imageName.includes("/uploads/")) {
        imageName = imageName.split("/uploads/")[1];
      }
      if (selectedImage) {
        imageName = await uploadImage();
      }

      const updateData = {
        fullName: profile.fullName.trim(),
        email: profile.email.trim(),
        ...(imageName && { profileImage: imageName }),
      };

      if (profile.newPassword) {
        updateData.currentPassword = profile.currentPassword;
        updateData.newPassword = profile.newPassword;
      }

      const res = await fetch(`${baseUrl}/api/instructor/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const updated = await res.json();
      if (!res.ok) throw new Error(updated.message);

      showToast("Profile updated successfully!", "green");

      setProfile((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        profileImage: updated.profileImage || imageName,
      }));

      setImagePreview(getImageUrl(updated.profileImage || imageName));
      setSelectedImage(null);
      setPasswordErrors({});
    } catch (err) {
      showToast(err.message, "red");
    } finally {
      setLoading(false);
    }
  };

  // Sidebar toggle
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleContentClick = () => {
    if (window.innerWidth < 992 && sidebarOpen) setSidebarOpen(false);
  };

  return (
    <div className="dashboard-container d-flex bg-dark text-white">
      {/* Sidebar */}
      <InstructorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`main-content flex-grow-1 p-4 ${
          sidebarOpen ? "content-pushed" : ""
        }`}
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
          <h5 className="mb-0">Profile Settings</h5>
        </div>

        {/* Topbar (Desktop only) */}
        <header className="bg-black d-flex justify-content-between align-items-center p-3 shadow-sm border-bottom mb-4 d-none d-lg-flex">
          <h4 className="text-white m-0">Instructor Profile Settings</h4>
        </header>

        {/* Form Section */}
        <div className="d-flex justify-content-center align-items-center">
          <div className="w-100" style={{ maxWidth: "500px" }}>
            <form
              onSubmit={handleSubmit}
              className="form-box bg-dark text-white p-4 rounded shadow border border-secondary"
            >
              <div className="text-center mb-4">
                <img
                  src={imagePreview}
                  alt="Profile Preview"
                  className="img-thumbnail"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "3px solid #495057",
                  }}
                  onError={(e) => {
                    e.target.src = defaultImage;
                  }}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="profileImage" className="form-label">
                  Upload Profile Picture
                </label>
                <input
                  type="file"
                  id="profileImage"
                  className="form-control bg-secondary border-dark text-white"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="fullName" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  className="form-control bg-secondary border-dark text-white"
                  value={profile.fullName}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-control bg-secondary border-dark text-white"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Password Section */}
              <div className="border-top border-secondary pt-3 mt-4">
                <h6 className="mb-3 text-primary">Change Password</h6>

                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="form-control bg-secondary border-dark text-white"
                    id="currentPassword"
                    value={profile.currentPassword}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">
                    New Password
                  </label>
                  <input
                    type="password"
                    className={`form-control bg-secondary text-white ${
                      passwordErrors.newPassword
                        ? "border-danger"
                        : "border-dark"
                    }`}
                    id="newPassword"
                    value={profile.newPassword}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                  />
                  {passwordErrors.newPassword && (
                    <div className="text-danger small mt-1">
                      {passwordErrors.newPassword}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className={`form-control bg-secondary text-white ${
                      passwordErrors.confirmPassword
                        ? "border-danger"
                        : "border-dark"
                    }`}
                    id="confirmPassword"
                    value={profile.confirmPassword}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                  {passwordErrors.confirmPassword && (
                    <div className="text-danger small mt-1">
                      {passwordErrors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 mt-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2" /> Update Profile
                  </>
                )}
              </button>
            </form>
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

export default InstructorSettings;
