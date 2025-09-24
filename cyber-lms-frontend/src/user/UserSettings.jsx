import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import UserSidebar from "../Components/UserSidebar";
import "../style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Toastify from "toastify-js";
import baseUrl from '../baseUrl';

export default function UserSettings() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePreview, setProfilePreview] = useState("../images/default-image.png");
  const [topbarProfile, setTopbarProfile] = useState("../images/default-image.png");
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentProfileImage, setCurrentProfileImage] = useState("");
  const [userFullName, setUserFullName] = useState("Loading...");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Toggle sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Close sidebar when clicking content (on mobile)
  const handleContentClick = () => {
    if (window.innerWidth < 992 && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadUserData();
    // eslint-disable-next-line
  }, []);

  const decoded = token ? jwtDecode(token) : {};
  const userId = decoded.id;

  const loadUserData = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/users/get-users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load user profile");

      const data = await res.json();
      setFullName(data.fullName || "");
      setEmail(data.email || "");
      setUserFullName(data.fullName || "Student");

      // ✅ FIX: Handle Cloudinary URL directly
      if (data.profileImage) {
        setCurrentProfileImage(data.profileImage);
        setProfilePreview(data.profileImage);
        setTopbarProfile(data.profileImage);
      } else {
        // Fallback to default image
        const defaultImage = "../images/default-image.png";
        setCurrentProfileImage("");
        setProfilePreview(defaultImage);
        setTopbarProfile(defaultImage);
      }
    } catch (err) {
      console.error("Load user error:", err);
      showToast("Failed to load user data.", "error");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match("image.*") || file.size > 5 * 1024 * 1024) {
      showToast("Invalid image. JPG/PNG only under 5MB.");
      return;
    }
    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePreview(event.target.result);
      setTopbarProfile(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const validatePassword = () => {
    const errors = {};
    if (newPassword && newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword && !validatePassword()) return;

    setLoading(true);
    try {
      let profileImageUrl = currentProfileImage;

      // ✅ FIX: Upload to Cloudinary if new image selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append("profileImage", selectedImage);

        const uploadRes = await fetch(`${baseUrl}/api/users/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.message || "Image upload failed");
        }

        const uploadData = await uploadRes.json();
        profileImageUrl = uploadData.profileImage; // Full Cloudinary URL
      }

      const updateData = {
        fullName: fullName.trim(),
        email: email.trim(),
        profileImage: profileImageUrl,
      };

      if (newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      const updateRes = await fetch(`${baseUrl}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await updateRes.json();
      if (!updateRes.ok || !result.success) {
        throw new Error(result.message || "Update failed");
      }

      showToast("Profile updated successfully!");
      setSelectedImage(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
      
      // ✅ FIX: Update local state with new image URL
      if (profileImageUrl) {
        setCurrentProfileImage(profileImageUrl);
        setProfilePreview(profileImageUrl);
        setTopbarProfile(profileImageUrl);
      }
      
      loadUserData(); // Reload to get latest data
    } catch (error) {
      console.error("Update error:", error);
      showToast(error.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
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

  return (
    <div className="dashboard-container d-flex bg-dark text-white">
      {/* Sidebar */}
      <UserSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`main-content flex-grow-1 p-4 ${sidebarOpen ? "content-pushed" : ""}`}
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
          <h5 className="mb-0">Settings</h5>
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

        {/* Topbar (Desktop only) */}
        <header className="bg-black d-flex justify-content-between align-items-center p-3 shadow-sm border-bottom mb-4 d-none d-lg-flex">
          <h4 className="text-white m-0">User Settings</h4>
          <div className="d-flex align-items-center">
            <span className="me-3 text-white fw-semibold">{userFullName}</span>
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

        {/* Page Title (Mobile only) */}
        <div className="d-lg-none d-block mb-4 mt-3">
          <h4 className="text-white">User Settings</h4>
          <p className="text-white mt-2">Manage your profile information</p>
        </div>

        {/* Form Section */}
        <div className="d-flex justify-content-center align-items-start">
          <div className="card shadow-lg p-4 w-100 bg-dark text-white border-0" style={{ maxWidth: "600px" }}>
            <h5 className="mb-4 text-center fw-bold text-primary">Update Your Profile</h5>

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="text-center mb-4">
                <img
                  src={profilePreview}
                  alt="Profile Preview"
                  className="rounded-circle border"
                  style={{ width: "120px", height: "120px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = "../images/default-image.png";
                  }}
                />
                <div className="mt-2">
                  <small className="text-muted">Click below to change photo</small>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="profileImage" className="form-label fw-semibold">
                  Profile Picture
                </label>
                <input
                  className="form-control bg-secondary text-white border-secondary"
                  type="file"
                  id="profileImage"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <div className="form-text text-muted">JPG, PNG (Max 5MB)</div>
              </div>

              <div className="mb-3">
                <label htmlFor="fullName" className="form-label fw-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control bg-secondary text-white border-secondary"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control bg-secondary text-white border-secondary"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Section */}
              <div className="border-top border-secondary pt-3 mt-4">
                <h6 className="mb-3 text-primary">Change Password</h6>

                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label fw-semibold">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="form-control bg-secondary text-white border-secondary"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label fw-semibold">
                    New Password
                  </label>
                  <input
                    type="password"
                    className={`form-control bg-secondary text-white ${passwordErrors.newPassword ? "border-danger" : "border-secondary"}`}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                  />
                  {passwordErrors.newPassword && <div className="text-danger small mt-1">{passwordErrors.newPassword}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label fw-semibold">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className={`form-control bg-secondary text-white ${passwordErrors.confirmPassword ? "border-danger" : "border-secondary"}`}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                  />
                  {passwordErrors.confirmPassword && <div className="text-danger small mt-1">{passwordErrors.confirmPassword}</div>}
                </div>

                <div className="form-text text-muted mb-3">
                  Note: Leave password fields blank if you don't want to change your password.
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 mt-3" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i> Update Profile
                  </>
                )}
              </button>
            </form>

            {/* Extra Info */}
            <div className="mt-4 p-3 bg-secondary rounded">
              <h6 className="mb-2">Profile Information</h6>
              <p className="small mb-0 text-muted">
                Your profile information is used to personalize your experience across the platform. Keep your information up to date for the best experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Font Awesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
}