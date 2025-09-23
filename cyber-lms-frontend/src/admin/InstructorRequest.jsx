// src/pages/Admin/InstructorRequests.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import baseUrl from '../baseUrl';

const InstructorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchRequests();
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

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(
        `${baseUrl}/api/instructor/requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests(data);
    } catch (error) {
      showToast("Error fetching requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await axios.put(
        `${baseUrl}/api/instructor/request/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`Request ${status} successfully`);
      fetchRequests();
    } catch (error) {
      showToast("Action failed", "error");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="badge bg-success">Approved</span>;
      case "rejected":
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-warning text-dark">Pending</span>;
    }
  };

  if (loading) return <div className="container mt-5 text-white">Loading...</div>;

  return (
    <div className="admin-container d-flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className="main flex-grow-1"
        style={{
          marginLeft: "250px",
          transition: "margin-left 0.3s ease",
          backgroundColor: "#000", // 🔥 Black background
          minHeight: "100vh",
          color: "#fff",
        }}
      >
        <Topbar />

        <div className="container-fluid mt-4">
          <div className="card shadow-lg border-0 bg-dark text-white">
            <div className="card-header bg-dark text-white py-3">
              <h4 className="mb-0 text-center">📋 Instructor Requests</h4>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm table-hover align-middle text-center table-dark">
                  <thead className="table-light text-dark">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th className="d-none d-md-table-cell">Email</th>
                      <th className="d-none d-lg-table-cell">Message</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length > 0 ? (
                      requests.map((req, index) => (
                        <tr key={req._id}>
                          <td>{index + 1}</td>
                          <td className="text-start">{req.fullName}</td>
                          <td className="d-none d-md-table-cell">
                            <a
                              href={`mailto:${req.email}`}
                              className="text-decoration-none text-info"
                            >
                              {req.email}
                            </a>
                          </td>
                          <td className="text-start d-none d-lg-table-cell">
                            {req.message?.length > 50
                              ? `${req.message.substring(0, 50)}...`
                              : req.message}
                          </td>
                          <td>{getStatusBadge(req.status)}</td>
                          <td>
                            <div className="d-flex flex-wrap justify-content-center gap-1">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleAction(req._id, "approved")}
                              >
                                <span className="d-none d-md-inline">Approve</span>
                                <span className="d-md-none">✓</span>
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleAction(req._id, "rejected")}
                              >
                                <span className="d-none d-md-inline">Reject</span>
                                <span className="d-md-none">✕</span>
                              </button>

                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-muted py-4 text-center">
                          No requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Responsive CSS */}
      <style jsx>{`
        @media (max-width: 991.98px) {
          .main {
            margin-left: 0 !important;
          }
        }

        .sidebar {
          width: 250px;
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          z-index: 100;
        }

        .table-responsive {
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
};

export default InstructorRequests;
