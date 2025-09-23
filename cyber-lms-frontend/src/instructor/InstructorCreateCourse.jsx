import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Toastify from "toastify-js";
import InstructorSidebar from "../Components/InstructorSidebar";
import "toastify-js/src/toastify.css";
import "../style.css";
import baseUrl from '../baseUrl';

const InstructorCreateCourse = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    price: "",
    thumbnail: "",
  });

  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  const [instructorId, setInstructorId] = useState("");

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setInstructorId(decoded.id);
    }
  }, [token]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validate course fields
    if (!formData.title || !formData.description || !formData.thumbnail) {
      showToast("Title, description, and thumbnail are required.", "error");
      return;
    }

    // ✅ Build FormData
    const formDataObj = new FormData();
    formDataObj.append("title", formData.title);
    formDataObj.append("description", formData.description);
    formDataObj.append("category", formData.category);
    formDataObj.append("level", formData.level);
    formDataObj.append("price", formData.price);
    formDataObj.append("thumbnail", formData.thumbnail);

    // ✅ Send request
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/courses/create-course`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj,
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        showToast("Course created successfully!");
        navigate("/instructor/dashboard");
      } else {
        showToast(data.message || "Error creating course", "error");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error creating course:", error);
      showToast("Server error, please try again later.", "error");
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
    <div className="dashboard-container bg-dark text-white">
      {/* ✅ Sidebar (handles its own toggle + overlay) */}
      <InstructorSidebar />

      {/* ✅ Main Content */}
      <div className="main-content p-3 p-md-4">
        <div className="instructor-container mt-3">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white py-3">
              <h4 className="mb-0">Create New Course</h4>
            </div>
            <div className="card-body p-3 p-md-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Title */}
                  <div className="col-12 col-lg-6">
                    <label htmlFor="title" className="form-label fw-semibold mb-2">
                      Course Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="form-control"
                      placeholder="Enter course title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="col-12 col-lg-6">
                    <label htmlFor="category" className="form-label fw-semibold mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      id="category"
                      className="form-control"
                      placeholder="Enter course category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="col-12">
                    <label htmlFor="description" className="form-label fw-semibold mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      className="form-control"
                      placeholder="Enter course description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  {/* Level */}
                  <div className="col-12 col-lg-6">
                    <label htmlFor="level" className="form-label fw-semibold mb-2">
                      Level
                    </label>
                    <select
                      id="level"
                      className="form-select"
                      value={formData.level}
                      onChange={handleChange}
                      required
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div className="col-12 col-lg-6">
                    <label htmlFor="price" className="form-label fw-semibold mb-2">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      id="price"
                      className="form-control"
                      placeholder="Enter price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Thumbnail */}
                  <div className="col-12">
                    <label htmlFor="thumbnail" className="form-label fw-semibold mb-2">
                      Thumbnail URL
                    </label>
                    <input
                      type="text"
                      id="thumbnail"
                      className="form-control"
                      placeholder="Enter thumbnail URL"
                      value={formData.thumbnail}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-sm me-2"
                    onClick={() => window.history.back()}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      "Create Course"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Font Awesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </div>
  );
};

export default InstructorCreateCourse;