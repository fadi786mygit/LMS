// src/pages/AddContent.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import baseUrl from '../baseUrl';

export default function AddContent() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [contents, setContents] = useState([
        { ctitle: "", type: "video", file: null, url: "" },
    ]);
    const [loading, setLoading] = useState(false);

    // Toast function
    const showToast = (message, type = "success") => {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: {
                background: type === "success" ? "green" : "red",
            },
        }).showToast();
    };

    // Add new content field
    const addContentField = () => {
        setContents([
            ...contents,
            { ctitle: "", type: "video", file: null, url: "" },
        ]);
    };

    // Remove content field
    const removeContentField = (index) => {
        if (contents.length > 1) {
            setContents(contents.filter((_, i) => i !== index));
        }
    };

    // Handle input changes
    const handleChange = (index, field, value) => {
        const newContents = [...contents];
        newContents[index][field] = value;

        // Reset file if URL is entered
        if (field === "url" && value) {
            newContents[index].file = null;
        }
        setContents(newContents);
    };

    // Handle file upload
    const handleFileChange = (index, event) => {
        const file = event.target.files[0];
        const newContents = [...contents];

        if (file) {
            newContents[index].file = file;
            newContents[index].url = ""; // Clear URL when file is selected
        } else {
            newContents[index].file = null;
        }
        setContents(newContents);
    };

    // Validate form - FIXED VERSION
    const validateForm = () => {
        console.log("Validating form contents:", contents);

        for (let i = 0; i < contents.length; i++) {
            const content = contents[i];
            console.log(`Content ${i}:`, {
                ctitle: content.ctitle,
                hasFile: !!content.file,
                hasUrl: !!content.url
            });

            // Check if title is empty or only whitespace
            if (!content.ctitle || content.ctitle.trim() === "") {
                showToast(`Content item ${i + 1} must have a title`, "error");
                return false;
            }

            // Check if both file and URL are missing
            if (!content.file && (!content.url || content.url.trim() === "")) {
                showToast(`Content item ${i + 1} must have either a file or URL`, "error");
                return false;
            }
        }
        console.log("Form validation passed");
        return true;
    };

    // Submit form
    // src/pages/AddContent.jsx - FIXED handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const formData = new FormData();

        // FIXED: Send individual fields, not JSON array
        contents.forEach((content, index) => {
            // Send each field as individual form data entries
            formData.append(`ctitle_${index}`, content.ctitle.trim());
            formData.append(`type_${index}`, content.type);

            // Add file if present
            if (content.file) {
                formData.append(`file_${index}`, content.file);
            } else if (content.url) {
                formData.append(`url_${index}`, content.url.trim());
            } // ✅ properly closed else-if block
        });


        // Debug: Log what we're sending
        console.log("=== FORM DATA CONTENTS ===");
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(key, `[FILE] ${value.name} (${value.type}, ${value.size} bytes)`);
            } else {
                console.log(key, value);
            }
        }

        try {
            const token = sessionStorage.getItem("token");

            const response = await axios.post(
                `${baseUrl}/api/courses/${courseId}/add-content`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                    timeout: 60000,
                }
            );

            showToast(response.data.message || "Content added successfully!");

            // Redirect after success
            setTimeout(() => {
                navigate("/instructor/courses");
            }, 1500);

        } catch (error) {
            console.error("Error adding content:", error);
            console.error("Error response:", error.response?.data);
            showToast(
                error.response?.data?.message || "Error adding content",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-header bg-dark text-white">
                    <h4 className="mb-0">Add Content to Course</h4>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        {contents.map((content, index) => (
                            <div key={index} className="border p-3 mb-3 rounded">
                                <div className="row g-3">
                                    <div className="col-md-12">
                                        <label className="form-label">Content Title *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter content title"
                                            value={content.ctitle}
                                            onChange={(e) => handleChange(index, "ctitle", e.target.value)}
                                            required
                                        />
                                        {content.ctitle && (
                                            <small className="text-success">✅ Title entered</small>
                                        )}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Content Type *</label>
                                        <select
                                            className="form-select"
                                            value={content.type}
                                            onChange={(e) => handleChange(index, "type", e.target.value)}
                                        >
                                            <option value="video">Video</option>
                                            <option value="pdf">PDF</option>
                                            <option value="text">Text</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            {content.type === 'video' ? 'Video File' :
                                                content.type === 'pdf' ? 'PDF File' : 'Text File'}
                                        </label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept={
                                                content.type === 'video' ? 'video/*' :
                                                    content.type === 'pdf' ? '.pdf' : '*'
                                            }
                                            onChange={(e) => handleFileChange(index, e)}
                                        />
                                        {content.file && (
                                            <small className="text-success">
                                                ✅ File selected: {content.file.name}
                                            </small>
                                        )}
                                    </div>

                                    <div className="col-md-12">
                                        <label className="form-label">Or enter URL (if no file)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter content URL"
                                            value={content.url}
                                            onChange={(e) => handleChange(index, "url", e.target.value)}
                                            disabled={!!content.file}
                                        />
                                        {content.url && !content.file && (
                                            <small className="text-success">✅ URL entered</small>
                                        )}
                                    </div>

                                    {contents.length > 1 && (
                                        <div className="col-md-12 text-end">
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                onClick={() => removeContentField(index)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="d-flex justify-content-between mt-4">
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={addContentField}
                            >
                                + Add Another Content
                            </button>

                            <div>
                                <button
                                    type="button"
                                    className="btn btn-secondary me-2"
                                    onClick={() => navigate("/instructor/courses")}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={loading}
                                >
                                    {loading ? "Uploading Content..." : "Save Content"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}   