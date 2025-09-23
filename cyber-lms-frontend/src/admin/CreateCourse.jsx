import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import Toastify from 'toastify-js';
import baseUrl from '../baseUrl';

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    price: "",
    thumbnail: "",
    instructor: "",
  });

  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/users/instructors`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setInstructors(data);
    } catch (err) {
      showToast("Error fetching instructors");
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      content: [],
    };

    setLoading(true);
    try {
      const res = await fetch(
        `${baseUrl}/api/courses/createCourse`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        showToast("Course created successfully!");
        navigate('/admin/courses')
      } else {
        showToast(data.message || "Error creating course", 'error');
      }
    } catch (error) {
      setLoading(false);
      showToast("Server error");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-dark text-white py-3">
          <h4 className="mb-0">Create New Course</h4>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Title */}
              <div className="col-md-6">
                <label htmlFor="title" className="form-label fw-semibold">
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
              <div className="col-md-6">
                <label htmlFor="category" className="form-label fw-semibold">
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
                <label htmlFor="description" className="form-label fw-semibold">
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
              <div className="col-md-6">
                <label htmlFor="level" className="form-label fw-semibold">
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
              <div className="col-md-6">
                <label htmlFor="price" className="form-label fw-semibold">
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
              <div className="col-md-6">
                <label htmlFor="thumbnail" className="form-label fw-semibold">
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

              {/* Instructor */}
              <div className="col-md-6">
                <label htmlFor="instructor" className="form-label fw-semibold">
                  Assign Instructor
                </label>
                <select
                  id="instructor"
                  className="form-select"
                  value={formData.instructor}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Instructor --</option>
                  {instructors.map((inst) => (
                    <option key={inst._id} value={inst._id}>
                      {inst.fullName} ({inst.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary me-2"
                onClick={() => window.history.back()}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-dark px-4"
                disabled={loading}
              >
                {loading ? "Saving..." : "Create Course"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
