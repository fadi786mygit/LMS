import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Toastify from 'toastify-js';
import baseUrl from '../baseUrl';

const UpdateCourse = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    price: "",
    thumbnail: "",
    instructor: "",
  });

  const [instructors, setInstructors] = useState([]);
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  // Fetch instructors from backend
useEffect(() => {
  const token = sessionStorage.getItem("token");

  const fetchInstructors = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/users/get-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      console.log("Raw instructor API data:", data); // 🔍 Check structure

      if (res.ok) {
        let usersArray = [];

        // Handle different possible API structures
        if (Array.isArray(data)) {
          usersArray = data;
        } else if (Array.isArray(data.users)) {
          usersArray = data.users;
        } else if (data.data && Array.isArray(data.data.users)) {
          usersArray = data.data.users;
        }

        const instructorList = usersArray.filter(
          (user) => user.role === "instructor"
        );

        setInstructors(instructorList || []);
      } else {
        console.error(data.message || "Failed to fetch instructors");
      }
    } catch (error) {
      console.error("Error fetching instructors:", error);
    }
  };

  fetchInstructors();
}, []);

  // Fetch course data
  useEffect(() => {
  const token = sessionStorage.getItem("token");
  if (!courseId) {
    showToast("No course ID provided.");
    navigate("/course");
    return;
  }

  const fetchCourseData = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        showToast("Failed to load course data.");
        return;
      }

      const course = await res.json();
      setForm({
        title: course.title || "",
        description: course.description || "",
        category: course.category || "",
        level: course.level || "beginner",
        price: course.price || "",
        thumbnail: course.thumbnail || "",
        instructor: course.instructor._id || "", // ✅ ensure we store only ID
      });
    } catch (error) {
      console.error(error);
    }
  };

  fetchCourseData();
}, [courseId, navigate]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    const payload = {
      ...form,
      price: parseFloat(form.price),
    };

    try {
      const res = await fetch(`${baseUrl}/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Course updated successfully!");
        navigate("/admin/courses");
      } else {
        showToast(data.message || "Error updating course.");
      }
    } catch (error) {
      showToast("Something went wrong!");
      console.error(error);
    }
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

  return (
    <div className="container mt-5">
      <div className="card shadow-lg border-0 rounded-4 mx-auto" style={{ maxWidth: "700px" }}>
        <div
          className="card-header text-white text-center rounded-top-4"
          style={{
            background: "linear-gradient(90deg, #0d6efd, #0dcaf0)",
          }}
        >
          <h4 className="mb-0 fw-bold">📚 Update Course</h4>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Course Title</label>
              <input
                type="text"
                className="form-control shadow-sm"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Description</label>
              <textarea
                className="form-control shadow-sm"
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Category</label>
              <input
                type="text"
                className="form-control shadow-sm"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Level</label>
              <select
                className="form-select shadow-sm"
                name="level"
                value={form.level}
                onChange={handleChange}
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Price ($)</label>
              <input
                type="number"
                className="form-control shadow-sm"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Thumbnail URL</label>
              <input
                type="text"
                className="form-control shadow-sm"
                name="thumbnail"
                value={form.thumbnail}
                onChange={handleChange}
              />
            </div>

            {/* Instructor dropdown */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Instructor</label>
              <select
                className="form-select shadow-sm"
                name="instructor"
                value={form.instructor}
                onChange={handleChange}
                required
              >
                <option value="">Select Instructor</option>
                {instructors.map((inst) => (
                  <option key={inst._id} value={inst._id}>
                    {inst.fullName} ({inst.username})
                  </option>
                ))}
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

export default UpdateCourse;
