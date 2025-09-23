// src/Pages/EditCourse.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Toastify from "toastify-js";
import baseUrl from '../baseUrl';

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    price: "",
    thumbnail: "",
  });

  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toast
  const showToast = (msg, type = "success") => {
    Toastify({
      text: msg,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: type === "success" ? "green" : "red",
      },
    }).showToast();
  };

  // Fetch existing course
  useEffect(() => {
    const fetchCourse = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const res = await fetch(`${baseUrl}/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          showToast("Failed to load course details", "error");
          navigate("/instructor/dashboard");
          return;
        }

        const data = await res.json();

        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          level: data.level,
          price: data.price,
          thumbnail: data.thumbnail,
        });

        setContents(
          data.content?.map((c, idx) => ({
            _id: c._id, // keep reference
            ctitle: c.ctitle,
            type: c.type,
            url: c.url,
            file: null, // updated file if instructor re-uploads
          })) || []
        );

        setLoading(false);
      } catch (err) {
        console.error("Error fetching course:", err);
        showToast("Error loading course", "error");
        navigate("/instructor/dashboard");
      }
    };

    fetchCourse();
  }, [id, navigate]);

  // Handle form field changes
  const handleChange = (e) => {
    const { id, value, files } = e.target;
    if (id === "thumbnail") {
      setFormData((prev) => ({ ...prev, thumbnail: files[0] })); // file upload
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  // Handle content update
  const handleContentChange = (index, field, value) => {
    const updatedContents = [...contents];
    updatedContents[index][field] = value;
    setContents(updatedContents);
  };

  // Delete content item (mark for deletion)
  const deleteContent = async (contentId) => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(
        `${baseUrl}/api/courses/${id}/content/${contentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (res.ok) {
        setContents(contents.filter((c) => c._id !== contentId));
        showToast("Content deleted successfully");
      } else {
        showToast(data.message || "Failed to delete content", "error");
      }
    } catch (error) {
      console.error("Error deleting content:", error);
      showToast("Server error", "error");
    }
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    const formDataObj = new FormData();
    formDataObj.append("title", formData.title);
    formDataObj.append("description", formData.description);
    formDataObj.append("category", formData.category);
    formDataObj.append("level", formData.level);
    formDataObj.append("price", formData.price);

    if (formData.thumbnail instanceof File) {
      formDataObj.append("thumbnail", formData.thumbnail);
    }

    // Send updated contents
    contents.forEach((c, i) => {
      formDataObj.append(`contents[${i}][_id]`, c._id);
      formDataObj.append(`contents[${i}][ctitle]`, c.ctitle);
      formDataObj.append(`contents[${i}][type]`, c.type);

      if (c.file) {
        formDataObj.append(`contents[${i}][file]`, c.file);
      } else {
        formDataObj.append(`contents[${i}][url]`, c.url);
      }
    });

    try {
      const res = await fetch(`${baseUrl}/api/courses/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj,
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Course updated successfully!");
        navigate("/instructor/dashboard");
      } else {
        showToast(data.message || "Failed to update course", "error");
      }
    } catch (err) {
      console.error("Error updating course:", err);
      showToast("Server error", "error");
    }
  };

  if (loading) return <p className="text-center text-white">Loading course...</p>;

  return (
    <div className="container mt-3">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-dark text-white py-2">
          <h5 className="mb-0">Edit Course</h5>
        </div>
        <div className="card-body p-3">
          <form onSubmit={handleSubmit}>
            {/* Course fields */}
            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label">Course Title</label>
                <input
                  type="text"
                  id="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  id="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  id="description"
                  className="form-control"
                  rows="2"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Level</label>
                <select
                  id="level"
                  className="form-select"
                  value={formData.level}
                  onChange={handleChange}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  id="price"
                  className="form-control"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label">Thumbnail</label>
                <input
                  type="file"
                  id="thumbnail"
                  className="form-control"
                  accept="image/*"
                  onChange={handleChange}
                />
                {!(formData.thumbnail instanceof File) && formData.thumbnail && (
                  <img
                    src={formData.thumbnail}
                    alt="Current Thumbnail"
                    className="mt-2"
                    style={{ width: "150px", borderRadius: "6px" }}
                  />
                )}
              </div>
            </div>

            {/* Existing course contents */}
            <div className="mt-3">
              <h6 className="mb-2 border-bottom pb-1">Course Contents</h6>
              {contents.length === 0 && (
                <p className="text-muted">No contents available. Use "Add Content" page to add.</p>
              )}
              {contents.map((content, index) => (
                <div key={content._id || index} className="row g-2 align-items-end mb-2 border rounded p-2">
                  <div className="col-md-3">
                    <label className="form-label small">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={content.ctitle}
                      onChange={(e) => handleContentChange(index, "ctitle", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small">Type</label>
                    <select
                      className="form-select"
                      value={content.type}
                      onChange={(e) => handleContentChange(index, "type", e.target.value)}
                    >
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small">Replace File</label>
                    <input
                      type="file"
                      className="form-control"
                      accept={content.type === "video" ? "video/*" : "application/pdf"}
                      onChange={(e) =>
                        handleContentChange(index, "file", e.target.files[0])
                      }
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small">Or URL</label>
                    <input
                      type="text"
                      className="form-control"
                      value={content.url}
                      onChange={(e) => handleContentChange(index, "url", e.target.value)}
                    />
                  </div>
                  <div className="col-md-1 text-center">
                    <button
                      type="button"
                      className="btn btn-danger btn-sm w-100"
                      onClick={() => deleteContent(content._id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-end mt-3">
              <button
                type="button"
                className="btn btn-outline-secondary me-2"
                onClick={() => navigate("/instructor/dashboard")}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-dark">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
