import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import "./admin.css";

const RenovarAdmin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "", data: null });
  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    label: "",
    imageFile: null,
    imagePosition: "full",
  });

  const parseMarkdown = (content) => {
    return content;
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
      loadPosts();
    }

    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      imageFile: e.target.files[0],
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const loginData = {
      username: formData.get("username"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch(`/${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        throw new Error(`Login failed with status ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const text = await response.text();
      if (!text.trim()) {
        throw new Error("Server returned empty response");
      }

      const data = JSON.parse(text);
      console.log("Login successful:", data);

      // Store token and update state
      localStorage.setItem("adminToken", data.token);
      setToken(data.token);
      setIsLoggedIn(true);
      loadPosts();
      showMessage("Login successful!", "success");
    } catch (error) {
      console.error("Login error:", error.message);
      showMessage(`Login failed: ${error.message}`, "error");
    }
  };
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("adminToken");
    setIsLoggedIn(false);
    setPosts([]);
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();

    try {
      let body;
      let headers = { Authorization: `Bearer ${token}` };

      if (formData.imageFile) {
        // Send as FormData if there's a file
        body = new FormData();
        body.append("title", formData.title);
        body.append("content", formData.content);
        body.append("label", formData.label);
        body.append("image", formData.imageFile);
        body.append("imagePosition", formData.imagePosition);
      } else {
        // Send as JSON if no file
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({
          title: formData.title,
          content: formData.content,
          label: formData.label,
          imagePosition: formData.imagePosition,
          image: null, // explicitly set null
        });
      }

      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers,
        body,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      showMessage("Post created successfully!", "success");
      loadPosts();

      // Clear form
      setFormData({
        title: "",
        content: "",
        label: "",
        imageFile: null,
        imagePosition: "full",
      });
    } catch (err) {
      console.error(err);
      showMessage(err.message || "Error creating post", "error");
    }
  };

  const loadPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/posts`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const postsData = await res.json();
      setPosts(postsData);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setPosts([]);
    }
  };

  const handleEditPost = async (editedPost) => {
    const { id, title, content, label, imageFile } = editedPost;
    const fd = new FormData();
    fd.append("title", title);
    fd.append("content", content);
    fd.append("label", label);
    if (imageFile) fd.append("image", imageFile);

    try {
      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type for FormData
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error: ${text}`);
      }

      const data = await res.json();
      if (data.success) {
        showMessage("Post updated successfully!", "success");
        loadPosts();
      } else {
        showMessage(data.error || "Failed to update post", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Error updating post: " + err.message, "error");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (res.ok) {
        await loadPosts();
        setModal({ isOpen: false, type: "", data: null });
        showMessage("POST DELETED SUCCESSFULLY!", "success");
      } else {
        showMessage("FAILED TO DELETE POST", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showMessage("FAILED TO DELETE POST. PLEASE TRY AGAIN.", "error");
    }
  };

  const openModal = (type, data = null) => {
    setModal({ isOpen: true, type, data });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: "", data: null });
  };

  return (
    <div className="renovar-admin">
      <div className="admin-container">
        <div className="header">
          <h1>RENOVAR</h1>
          <p>ADMIN DASHBOARD</p>
        </div>

        {!isLoggedIn ? (
          <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoading}
            message={message}
          />
        ) : (
          <AdminPanel
            onLogout={handleLogout}
            onSubmitPost={handleSubmitPost}
            formData={formData}
            onInputChange={handleInputChange}
            onFileChange={handleFileChange}
            isLoading={isLoading}
            message={message}
            posts={posts}
            onEditPost={openModal}
            onDeletePost={openModal}
            showMarkdownHelp={showMarkdownHelp}
            setShowMarkdownHelp={setShowMarkdownHelp}
            parseMarkdown={parseMarkdown}
          />
        )}

        {modal.isOpen && modal.type === "edit" && (
          <EditModal
            post={modal.data}
            onSave={handleEditPost}
            onClose={closeModal}
            parseMarkdown={parseMarkdown}
          />
        )}

        {modal.isOpen && modal.type === "delete" && (
          <DeleteModal
            post={modal.data}
            onConfirm={handleDeletePost}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
};

const LoginForm = ({ onSubmit, isLoading, message }) => {
  return (
    <div className="form-card" id="loginCard">
      <h2>Welcome Back</h2>
      {message.text && (
        <div className={`${message.type}-message`}>{message.text}</div>
      )}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <div className="input-wrapper">
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          className={`btn ${isLoading ? "loading" : ""}`}
          disabled={isLoading}
        >
          {isLoading ? "PLEASE WAIT..." : "SIGN IN"}
        </button>
      </form>
    </div>
  );
};

const AdminPanel = ({
  onLogout,
  onSubmitPost,
  formData,
  onInputChange,
  onFileChange,
  isLoading,
  message,
  posts,
  onEditPost,
  onDeletePost,
  parseMarkdown,
  showMarkdownHelp,
  setShowMarkdownHelp,
}) => {
  const [previewContent, setPreviewContent] = useState("");

  useEffect(() => {
    setPreviewContent(parseMarkdown(formData.content));
  }, [formData.content, parseMarkdown]);

  return (
    <div className="form-card" id="postCard">
      <button
        onClick={() => (window.location.href = "/blog")}
        className="logout-btn"
      >
        ← BACK TO BLOG
      </button>
      <button
        onClick={onLogout}
        className="logout-btn"
        style={{ left: "auto", right: "2rem" }}
      >
        LOGOUT
      </button>

      <h2>Create New Post</h2>

      {message.text && (
        <div className={`${message.type}-message`}>{message.text}</div>
      )}

      <form onSubmit={onSubmitPost}>
        <div className="form-group">
          <label htmlFor="title">Post Title</label>
          <div className="input-wrapper">
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Enter an engaging title"
              value={formData.title}
              onChange={onInputChange}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="content">Content (Markdown Supported)</label>
          <div className="input-wrapper">
            <textarea
              id="content"
              name="content"
              placeholder="Write your post content here... Use # for headings, ** for bold, etc."
              value={formData.content}
              onChange={onInputChange}
              required
              disabled={isLoading}
              rows="6"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="imageUpload">Add Image</label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={onFileChange}
            disabled={isLoading}
          />
          <select
            id="imagePosition"
            name="imagePosition"
            value={formData.imagePosition}
            onChange={onInputChange}
            disabled={isLoading}
          >
            <option value="full">Full Width</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>

        <div className="preview-container">
          {formData.content ? (
            <ReactMarkdown
              children={formData.content}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            />
          ) : (
            <p className="preview-placeholder">Preview will appear here...</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="label">Category</label>
          <div className="input-wrapper">
            <input
              id="label"
              name="label"
              type="text"
              placeholder="e.g., Tech, Tutorial, News"
              value={formData.label}
              onChange={onInputChange}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          className={`btn ${isLoading ? "loading" : ""}`}
          disabled={isLoading}
        >
          {isLoading ? "PUBLISHING..." : "PUBLISH POST"}
        </button>
      </form>

      <button
        type="button"
        className="btn-secondary"
        onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}
        style={{ marginTop: "10px" }}
      >
        Markdown Help
      </button>

      {showMarkdownHelp && (
        <div className="markdown-help">
          <h4>Markdown Cheat Sheet</h4>
          <ul>
            <li>
              <strong># Header 1</strong> →{" "}
              <h1 style={{ display: "inline", fontSize: "1rem" }}>Header 1</h1>
            </li>
            <li>
              <strong>## Header 2</strong> →{" "}
              <h2 style={{ display: "inline", fontSize: "0.9rem" }}>
                Header 2
              </h2>
            </li>
            <li>
              <strong>**Bold**</strong> → <strong>Bold</strong>
            </li>
            <li>
              <strong>*Italic*</strong> → <em>Italic</em>
            </li>
            <li>
              <strong>[Link](url)</strong> →{" "}
              <a href="#markdown" style={{ color: "#0000EE" }}>
                Link
              </a>
            </li>
            <li>
              <strong>* List item</strong> → • List item
            </li>
            <li>
              <strong>1. Ordered item</strong> → 1. Ordered item
            </li>
            <li>
              <strong>`Code`</strong> → <code>Code</code>
            </li>
            <li>
              <strong>&gt; Blockquote</strong> →{" "}
              <blockquote
                style={{ display: "inline", margin: 0, paddingLeft: "0.5rem" }}
              >
                Blockquote
              </blockquote>
            </li>
          </ul>
        </div>
      )}
      <PostsPreview posts={posts} onEdit={onEditPost} onDelete={onDeletePost} />
    </div>
  );
};

const PostsPreview = ({ posts, onEdit, onDelete }) => {
  if (!posts.length) return null;

  return (
    <div id="postsPreview" className="posts-preview">
      <h3>Recent Posts</h3>
      <div id="recentPosts">
        {posts.map((post) => (
          <div key={post.id} className="post-item">
            <div className="post-header">
              <strong>
                {post.title.length > 20
                  ? post.title.substring(0, 20) + "..."
                  : post.title}
              </strong>
              {post.label && (
                <span className="post-label">
                  {post.label.length > 10
                    ? post.label.substring(0, 10) + "..."
                    : post.label}
                </span>
              )}
            </div>
            <p>
              {post.content.substring(0, 35)}
              {post.content.length > 35 ? "..." : ""}
            </p>
            <div className="post-actions">
              <button className="btn-edit" onClick={() => onEdit("edit", post)}>
                Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => onDelete("delete", post)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EditModal = ({ post, onSave, onClose, parseMarkdown }) => {
  const [editData, setEditData] = useState({
    title: post.title || "",
    content: post.content || "",
    label: post.label || "",
    imageFile: null, // optional image
  });
  const [previewContent, setPreviewContent] = useState("");

  useEffect(() => {
    setPreviewContent(parseMarkdown(editData.content));
  }, [editData.content, parseMarkdown]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      setEditData((prev) => ({ ...prev, imageFile: files[0] }));
    } else {
      setEditData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    onSave({ id: post.id, ...editData }); // only include ID for the URL
  };

  return (
    <div className="custom-modal active">
      <div className="modal-content">
        <h3>Edit Post</h3>
        <div className="form-group">
          <label htmlFor="editTitle">Title</label>
          <input
            type="text"
            id="editTitle"
            name="title"
            value={editData.title}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="editContent">Content (Markdown Supported)</label>
          <textarea
            id="editContent"
            name="content"
            value={editData.content}
            onChange={handleInputChange}
            rows="6"
          />
        </div>

        <div className="form-group">
          <label>Live Preview</label>
          <div
            className="content-preview"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="editLabel">Category</label>
          <input
            type="text"
            id="editLabel"
            name="label"
            value={editData.label}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="editImage">Upload Image (Optional)</label>
          <input
            type="file"
            id="editImage"
            name="imageFile"
            accept="image/*"
            onChange={handleInputChange}
          />
        </div>

        <div className="modal-buttons">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteModal = ({ post, onConfirm, onClose }) => {
  return (
    <div className="custom-modal active">
      <div className="modal-content">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete the post "{post.title}"?</p>
        <div className="modal-buttons">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-danger" onClick={() => onConfirm(post.id)}>
            Delete Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenovarAdmin;
