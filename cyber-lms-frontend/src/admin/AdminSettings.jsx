import React, { useEffect, useState, useCallback } from 'react';
import '../style.css';
import Toastify from 'toastify-js';
import Sidebar from '../Components/Sidebar';
import Topbar from '../Components/Topbar';
import baseUrl from '../baseUrl';

const AdminSettings = () => {
  const defaultImage = '/images/default-image.png';
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profileImage: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(defaultImage);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem('token');

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
    }
  }, [token]);

  const showToast = useCallback((msg, color) => {
    Toastify({ text: msg, backgroundColor: color, duration: 3000 }).showToast();
  }, []);

  // Prevent double URLs
  const getImageUrl = (imgPath) => {
    if (!imgPath) return defaultImage;
    if (imgPath.startsWith("http")) return imgPath; // Cloudinary or external
    return `${baseUrl}/uploads/${imgPath}`; // fallback for local
  };

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch profile');

      setProfile({
        fullName: data.fullName || '',
        email: data.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        profileImage: data.profileImage || ''
      });
      setImagePreview(getImageUrl(data.profileImage));
    } catch (err) {
      showToast(err.message, 'red');
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Image change
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return showToast('Please upload a valid image file', 'red');
    }
    if (file.size > 5 * 1024 * 1024) {
      return showToast('Image must be smaller than 5MB', 'red');
    }
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Upload image
  const uploadImage = async () => {
    const formData = new FormData();
    formData.append("profileImage", selectedImage);

    const res = await fetch(`${baseUrl}/api/admin/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result.profileImage; // <-- this will now be Cloudinary secure_url
  };

  // Password validation
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

  // Submit
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (profile.newPassword && !validatePassword()) {
    return;
  }

  setLoading(true);
  try {
    let imageName = profile.profileImage;

    // Only upload if a new image is selected
    if (selectedImage) {
      imageName = await uploadImage(); // Cloudinary URL comes back
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

    const res = await fetch(`${baseUrl}/api/admin/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    const updated = await res.json();
    if (!res.ok) throw new Error(updated.message);

    showToast('Profile updated successfully!', 'green');

    setProfile((prev) => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      profileImage: updated.profileImage || imageName,
    }));

    setImagePreview(getImageUrl(updated.profileImage || imageName));
    setSelectedImage(null);
    setPasswordErrors({});
  } catch (err) {
    showToast(err.message, 'red');
  } finally {
    setLoading(false);
  }
};


  const logout = () => {
    sessionStorage.removeItem('token');
    showToast('Logged out successfully', 'blue');
    setTimeout(() => (window.location.href = '/login'), 1000);
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <main className="main">
        <Topbar />
        <section className="main-content">
          <h2 className="text-white">Admin Profile Settings</h2>
          <form
            onSubmit={handleSubmit}
            className="form-box bg-dark text-white p-4 rounded shadow"
            style={{ maxWidth: '500px', margin: '0 auto' }}
          >
            <div className="text-center mb-4">
              <img
                src={imagePreview}
                alt="Profile Preview"
                className="img-thumbnail"
                style={{
                  width: '150px',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '50%'
                }}
                onError={(e) => { e.target.src = defaultImage; }}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="profileImage" className="form-label">Upload Profile Picture</label>
              <input
                type="file"
                id="profileImage"
                className="form-control"
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <input
                type="text"
                id="fullName"
                className="form-control"
                value={profile.fullName}
                onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            {/* Password Update Section */}
            <div className="border-top border-secondary pt-3 mt-4">
              <h6 className="mb-3 text-primary">Change Password</h6>

              <div className="mb-3">
                <label htmlFor="currentPassword" className="form-label">
                  Current Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="currentPassword"
                  value={profile.currentPassword}
                  onChange={(e) => setProfile(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter your current password"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  className={`form-control ${passwordErrors.newPassword ? 'border-danger' : ''}`}
                  id="newPassword"
                  value={profile.newPassword}
                  onChange={(e) => setProfile(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password (min 8 characters)"
                />
                {passwordErrors.newPassword && (
                  <div className="text-danger small mt-1">{passwordErrors.newPassword}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className={`form-control ${passwordErrors.confirmPassword ? 'border-danger' : ''}`}
                  id="confirmPassword"
                  value={profile.confirmPassword}
                  onChange={(e) => setProfile(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm your new password"
                />
                {passwordErrors.confirmPassword && (
                  <div className="text-danger small mt-1">{passwordErrors.confirmPassword}</div>
                )}
              </div>

              <div className="form-text text-muted mb-3">
                Note: Leave password fields blank if you don't want to change your password.
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 mt-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2" /> Update Profile
                </>
              )}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default AdminSettings;