import React, { useState, useEffect } from "react";
import Sidebar from "../Components/InstructorSidebar";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { useParams } from "react-router-dom";
import baseUrl from '../baseUrl';

export default function InstructorUploadVideo() {
  const { courseId: courseIdFromUrl } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [file, setFile] = useState(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Sync courseId from URL into state
  useEffect(() => {
    console.log("Course ID from URL:", courseIdFromUrl);
    if (courseIdFromUrl) {
      setCourseId(courseIdFromUrl);
    }
  }, [courseIdFromUrl]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(`${baseUrl}/api/courses/instructor`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("Fetched courses:", data);
        setCourses(data);

        // ✅ If only one course exists and no URL param, auto-select it
        if (!courseIdFromUrl && data.length === 1) {
          setCourseId(data[0]._id);
        }
      } catch (err) {
        console.error("Error loading courses", err);
        showToast("Error loading courses", "error");
      }
    };
    fetchCourses();
  }, [courseIdFromUrl]);

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

  const handleUpload = async (e) => {
    e.preventDefault();

    console.log("Uploading with courseId:", courseId);

    if ((!file && !externalUrl) || !title || !courseId) {
      showToast("Please provide either a video file OR an external video URL", "error");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("courseId", courseId);

    if (file) {
      formData.append("video", file);
    }

    if (externalUrl) {
      formData.append("externalUrl", externalUrl);
    }

    try {
      const token = sessionStorage.getItem("token");

      const res = await fetch(`${baseUrl}/api/videos/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const responseData = await res.json();
      console.log("Server response:", responseData);

      if (!res.ok) {
        throw new Error(responseData.error || `Upload failed with status ${res.status}`);
      }

      showToast("Video uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
      setExternalUrl(""); // reset url field

    } catch (err) {
      console.error("Upload error:", err);
      showToast(err.message || "Error uploading video", "error");
    } finally {
      setLoading(false);
    }
  };

   

  return (
    <div className="dashboard-container bg-dark text-white">
      <Sidebar />
      <div className="main-content p-4">
        <h3>Upload New Video</h3>
        <form onSubmit={handleUpload} className="bg-secondary p-4 rounded">
          {/* Video title */}
          <div className="mb-3">
            <label className="form-label">Video Title *</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          {/* Course selection (if not from URL) */}
          {!courseIdFromUrl && courses.length > 1 && (
            <div className="mb-3">
              <label className="form-label">Select Course *</label>
              <select
                className="form-control"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Video upload */}
          <div className="mb-3">
            <label className="form-label">Upload Video </label>
            <input
              type="file"
              className="form-control"
              accept="video/*"
              onChange={(e) => setFile(e.target.files[0])}
              
            />
          </div>

          {/* External Video URL */}
          <div className="mb-3">
            <label className="form-label">External Video URL (YouTube, Vimeo, etc.)</label>
            <input
              type="url"
              className="form-control"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://youtube.com/..."
            />
            <small className="text-muted">Provide this OR upload a video file.</small>
          </div>


          {/* Submit button */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Uploading..." : "Upload Video"}
          </button>
        </form>
      </div>
    </div>
  );
}