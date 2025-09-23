import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import baseUrl from '../baseUrl';

const UpdateInstructor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    role: "",
    isVerified: "",
  });

  const showToast = (message, type = "success") => {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: type === "success" ? "#198754" : "#dc3545",
      },
    }).showToast();
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/users/get-users/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setFormData({
          fullName: data.fullName,
          username: data.username,
          email: data.email,
          role: data.role,
          isVerified: data.isVerified ? "true" : "false",
        });
      } catch (error) {
        showToast(error.message, "error");
      }
    };

    fetchUser();
  }, [id, token]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${baseUrl}/api/users/update-user/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          isVerified: formData.isVerified === "true",
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      showToast("User updated successfully!");
      navigate("/admin/instructors-management");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <div className="container mt-5">
      <div
        className="card shadow-lg border-0 rounded-4 mx-auto"
        style={{ maxWidth: "550px" }}
      >
        <div
          className="card-header text-white text-center rounded-top-4"
          style={{
            background: "linear-gradient(90deg, #0d6efd, #0dcaf0)",
          }}
        >
          <h4 className="mb-0 fw-bold">✏️ Update User</h4>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label fw-semibold">
                👤 Full Name
              </label>
              <input
                type="text"
                id="fullName"
                className="form-control shadow-sm"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="username" className="form-label fw-semibold">
                🆔 Username
              </label>
              <input
                type="text"
                id="username"
                className="form-control shadow-sm"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                📧 Email
              </label>
              <input
                type="email"
                id="email"
                className="form-control shadow-sm"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="role" className="form-label fw-semibold">
                🛠 Role
              </label>
              <select
                id="role"
                className="form-select shadow-sm"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="instructor">Instructor</option>
                <option value="student">Student</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="isVerified" className="form-label fw-semibold">
                ✅ Is Verified?
              </label>
              <select
                id="isVerified"
                className="form-select shadow-sm"
                value={formData.isVerified}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-success btn-lg shadow-sm">
                💾 Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateInstructor;
