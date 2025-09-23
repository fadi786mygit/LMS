import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Toastify from 'toastify-js';
import baseUrl from "../baseUrl";

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [tools, setTools] = useState([{ name: "", link: "" }]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = "your-auth-token-if-needed"; // Replace with actual token

  const handleToolChange = (index, field, value) => {
    const updatedTools = [...tools];
    updatedTools[index][field] = value;
    setTools(updatedTools);
  };

  const addToolField = () => {
    setTools([...tools, { name: "", link: "" }]);
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

  const removeToolField = (index) => {
    const updatedTools = tools.filter((_, i) => i !== index);
    setTools(updatedTools);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = categoryName.trim();
    const validTools = tools
      .map((t) => ({
        name: t.name.trim(),
        link: t.link.trim(),
      }))
      .filter((t) => t.name.length > 0);

    if (!trimmedName || validTools.length === 0) {
      showToast("Please enter a category name and at least one tool name.", 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${baseUrl}/api/categories/createCategory`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: trimmedName, tools: validTools }),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (!res.ok) throw new Error(data.message || "Failed to create category.");

      showToast("Category created successfully!");
      navigate("/admin/tools");
    } catch (err) {
      setLoading(false);
      showToast("Error: " + err.message, 'error');
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow border-0">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Add New Category</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Category Name */}
            <div className="mb-3">
              <label htmlFor="categoryName" className="form-label fw-semibold">
                Category Name
              </label>
              <input
                id="categoryName"
                type="text"
                className="form-control"
                placeholder="Enter category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
            </div>

            {/* Tools */}
            <label className="form-label fw-semibold">Tools</label>
            {tools.map((tool, index) => (
              <div className="row g-2 mb-2 align-items-center" key={index}>
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tool name"
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
                    className="form-control"
                    placeholder="Tool link (optional)"
                    value={tool.link}
                    onChange={(e) =>
                      handleToolChange(index, "link", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-2 d-flex">
                  <button
                    type="button"
                    className={`btn btn-${
                      index === 0 ? "secondary" : "danger"
                    } w-100`}
                    onClick={() =>
                      index === 0 ? addToolField() : removeToolField(index)
                    }
                  >
                    <i
                      className={`fas fa-${index === 0 ? "plus" : "minus"}`}
                    ></i>
                  </button>
                </div>
              </div>
            ))}

            {/* Buttons */}
            <div className="d-flex justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary me-2"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
