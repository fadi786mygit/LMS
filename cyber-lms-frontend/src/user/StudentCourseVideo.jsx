// src/pages/StudentCourseVideos.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../Components/UserSidebar";
import Toastify from "toastify-js";
import axios from "axios";
import "toastify-js/src/toastify.css";
import baseUrl from '../baseUrl';

export default function StudentCourseVideos() {
  const { courseId } = useParams();

  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState(0);
  const [completedContent, setCompletedContent] = useState([]);
  const [progressLoading, setProgressLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  // ✅ Fetch course content
  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${baseUrl}/api/courses/${courseId}/content`,
        { headers: getAuthHeaders() }
      );
      setContent(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching content", err);
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch progress
  const fetchProgress = async () => {
    try {
      setProgressLoading(true);
      const res = await axios.get(
        `${baseUrl}/api/enrollments/${courseId}/user-progress`,
        { headers: getAuthHeaders() }
      );
      if (res.data) {
        setProgress(res.data.progress || 0);
        setCompletedContent(
          res.data.completedContent?.map((c) => c.contentId.toString()) || []
        );
      }
    } catch (err) {
      console.error("Error fetching progress", err);
    } finally {
      setProgressLoading(false);
    }
  };

  // ✅ Mark content as complete
  const markContentAsCompleted = async (contentId) => {
    try {
      const res = await axios.post(
        `${baseUrl}/api/enrollments/${courseId}/complete-content`,
        { contentId },
        { headers: getAuthHeaders() }
      );

      if (res.data) {
        setProgress(res.data.progress);
        setCompletedContent((prev) => [...prev, contentId]);

        Toastify({
          text: `Marked as completed! Progress: ${res.data.progress}%`,
          duration: 3000,
          gravity: "top",
          position: "right",
          style: { background: "green" },
        }).showToast();
      }
    } catch (err) {
      Toastify({
        text: "Error marking content complete",
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: "red" },
      }).showToast();
    }
  };

  useEffect(() => {
    fetchContent();
    fetchProgress();
  }, [courseId]);

  // ✅ Render content by type
  const renderContent = (c) => {
    const url = c.url;
    const type = c.type?.toLowerCase() || "";
    const isCompleted = completedContent.includes(c._id.toString());


    const completionButton = (
      <div className="mt-2">
        {isCompleted ? (
          <span className="badge bg-success">Completed</span>
        ) : (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => markContentAsCompleted(c._id)}
          >
            Mark as Completed
          </button>
        )}
      </div>
    );


    switch (type) {
      case "pdf":
        return (
          <>
            <h5>{c.title}</h5>
            <iframe
              src={url}
              title={c.title}
              className="w-100 rounded border"
              style={{ height: "500px" }}
            ></iframe>
            {completionButton}
          </>
        );

      case "image":
        return (
          <>
            <h5>{c.title}</h5>
            <img src={url} alt={c.title} className="w-100 rounded my-3" />
            {completionButton}
          </>
        );

      case "text":
        return (
          <>
            <h5>{c.title}</h5>
            <div className="card">
              <div className="card-body">
                <p className="card-text">{c.description || url}</p>
              </div>
            </div>
            {completionButton}
          </>
        );

      default:
        return (
          <>
            <h5>{c.title}</h5>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-secondary"
            >
              Download Content
            </a>
            {completionButton}
          </>
        );
    }
  };

  // ✅ Loading UI
  if (loading || progressLoading) {
    return (
      <div className="dashboard-container bg-dark text-white">
        <Sidebar />
        <div className="main-content p-4 d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Final UI
  return (
    <div className="dashboard-container bg-dark text-white">
      <Sidebar />
      <div className="main-content p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Course Content</h3>
          <div style={{ width: "200px" }}>
            <span>Progress: {progress}%</span>
            <div className="progress mt-1">
              <div
                className="progress-bar bg-success"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {content.length === 0 ? (
          <p className="text-gray-400">No content available for this course.</p>
        ) : (
          content.map((c) => (
            <div key={c._id} className="bg-dark p-3 rounded border mb-3">
              {renderContent(c)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
