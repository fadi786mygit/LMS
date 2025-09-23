import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Toastify from 'toastify-js';
import baseUrl from '../baseUrl';

const UpdateCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [tools, setTools] = useState([{ name: "", link: "" }]);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token || !id) {
      showToast("Unauthorized or missing category ID.");
      navigate("/login");
    } else {
      loadCategory();
    }
  }, []);

  const loadCategory = async () => {
    try {
      const res = await fetch(
        `${baseUrl}/api/categories/getCategory/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const category = await res.json();
      setName(category.name);

      if (category.tools?.length) {
        setTools(
          category.tools.map((tool) =>
            typeof tool === "object" ? tool : { name: tool, link: "" }
          )
        );
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load category");
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

  const handleToolChange = (index, field, value) => {
    const updatedTools = [...tools];
    updatedTools[index][field] = value;
    setTools(updatedTools);
  };

  const addToolRow = () => {
    setTools([...tools, { name: "", link: "" }]);
  };

  const removeToolRow = (index) => {
    const updatedTools = tools.filter((_, i) => i !== index);
    setTools(updatedTools);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filteredTools = tools.filter(
      (t) => t.name.trim() && t.link.trim()
    );

    try {
      const res = await fetch(
        `${baseUrl}/api/categories/updateCategory/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, tools: filteredTools }),
        }
      );

      if (res.ok) {
        showToast("Category updated successfully");
        navigate("/admin/tools");
      } else {
        const data = await res.json();
        showToast(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating category");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow border-0 rounded-4">
        <div
          className="card-header text-white text-center fw-bold rounded-top-4"
          style={{
            background: "linear-gradient(90deg, #0d6efd, #0dcaf0)",
          }}
        >
          ✏️ Update Category
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* Category Name */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Category Name</label>
              <input
                type="text"
                className="form-control shadow-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Tools Section */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Tools</label>
              {tools.map((tool, index) => (
                <div
                  key={index}
                  className="row g-2 align-items-center mb-2"
                >
                  <div className="col-md-5">
                    <input
                      type="text"
                      className="form-control shadow-sm"
                      placeholder="Tool Name"
                      value={tool.name}
                      onChange={(e) =>
                        handleToolChange(index, "name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="col-md-5">
                    <input
                      type="url"
                      className="form-control shadow-sm"
                      placeholder="Tool Link (https://...)"
                      value={tool.link}
                      onChange={(e) =>
                        handleToolChange(index, "link", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="col-md-2 text-end">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeToolRow(index)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-success btn-sm mt-2"
                onClick={addToolRow}
              >
                <i className="fas fa-plus me-1"></i> Add Tool
              </button>
            </div>

            {/* Submit & Back Buttons */}
            <div className="d-grid gap-2">
              <button type="submit" className="btn btn-success btn-lg">
                <i className="fas fa-save me-2"></i> Update Category
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-secondary"
              >
                <i className="fas fa-arrow-left me-2"></i> Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateCategory;
