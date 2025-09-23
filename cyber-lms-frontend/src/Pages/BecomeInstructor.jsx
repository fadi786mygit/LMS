// src/pages/BecomeInstructor.js
import React, { useState } from "react";
import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { useNavigate } from "react-router-dom";
import baseUrl from '../baseUrl';

const BecomeInstructor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${baseUrl}/api/instructor/request`, formData);
      Toastify({
        text: "Request submitted successfully!",
        backgroundColor: "green",
        duration: 2000,
        
      }).showToast();
      setTimeout(() => {
        navigate('/login');
      }, 1000); 
      setFormData({ fullName: "", email: "", phone: "", message: "" });
    } catch (err) {
      Toastify({
        text: "Error submitting request",
        backgroundColor: "red",
        duration: 3000,
      }).showToast();
    }
  };

  return (
    <div className="container my-5 d-flex justify-content-center">
      <div className="card shadow-lg p-4 rounded-4" style={{ maxWidth: "600px", width: "100%" }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4 fw-bold text-primary">
            Become an Instructor
          </h2>
          <p className="text-center text-muted mb-4">
            Share your experience with us and start teaching learners worldwide 🌍
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="form-control rounded-3"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-control rounded-3"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Phone</label>
              <input
                type="text"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                className="form-control rounded-3"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Experience</label>
              <textarea
                name="message"
                placeholder="Tell us about your teaching experience..."
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="form-control rounded-3"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold rounded-3"
            >
              🚀 Submit Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BecomeInstructor;
