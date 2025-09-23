import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import baseUrl from '../baseUrl';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      showToast("Unauthorized! Please login.", "error");
      navigate("/login");
    } else {
      fetchCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/courses/instructor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch courses");

      setCourses(data);
    } catch (err) {
      if (err.message.toLowerCase().includes("unauthorized")) {
        showToast("Session expired! Please login again.", "error");
        navigate("/login");
      } else {
        showToast(err.message || "Failed to load courses", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id) => {
    const confirmDelete = window.confirm("Delete this course?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${baseUrl}/api/courses/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Failed to delete course", "error");
        return;
      }

      showToast("Course deleted successfully");
      fetchCourses();
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Delete error", "error");
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center text-light bg-dark p-5 rounded">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="admin-container d-flex bg-dark text-light min-vh-100">
      <Sidebar />
      <main className="main flex-grow-1">
        <Topbar />

        {/* Create Course Button */}
        <div className="d-flex justify-content-end p-3">
          <button
            className="btn btn-primary add-user-button"
            onClick={() => navigate("/admin/add-course")}
          >
            + Create Course
          </button>
        </div>

        {/* Responsive Table Section */}
        <section className="main-content p-3">
          <div className="table-container table-responsive bg-secondary rounded p-3 shadow">
            <table className="table table-dark table-bordered table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">SR.</th>
                  <th scope="col">TITLE</th>
                  <th scope="col">CATEGORY</th>
                  <th scope="col">INSTRUCTOR</th>
                  <th scope="col">PRICE</th>
                  <th scope="col" className="text-center">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.length > 0 ? (
                  courses.map((course, index) => (
                    <tr key={course._id}>
                      <td>{String(index + 1).padStart(3, "0")}</td>
                      <td>{course.title}</td>
                      <td>{course.category}</td>
                      <td>{course.instructor?.fullName || "N/A"}</td>
                      <td>${course.price}</td>
                      <td className="actions text-center">
                        <i
                          className="fas fa-pen edit me-2 text-info"
                          onClick={() =>
                            navigate(`/admin/update-course/${course._id}`)
                          }
                          style={{ cursor: "pointer" }}
                          title="Edit"
                        ></i>
                        <i
                          className="fas fa-trash delete me-2 text-danger"
                          onClick={() => deleteCourse(course._id)}
                          style={{ cursor: "pointer" }}
                          title="Delete"
                        ></i>
                        <i
                          className="fas fa-eye view text-success"
                          onClick={() =>
                            navigate(`/admin/view-course/${course._id}`)
                          }
                          style={{ cursor: "pointer" }}
                          title="View"
                        ></i>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No courses available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination / Footer */}
            <div className="d-flex justify-content-between mt-3">
              <button className="btn btn-outline-light btn-sm">◀ Prev</button>
              <button className="btn btn-outline-light btn-sm">Next ▶</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CourseManagement;
