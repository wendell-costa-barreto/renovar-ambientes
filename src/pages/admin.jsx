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

  const showMessage = (text, type = "sucesso") => {
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
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        throw new Error(`Login falhou com status ${response.status}`);
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
      showMessage("Post criado com sucesso!", "success");
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
      showMessage(err.message || "Erro em criar post", "error");
    }
  };

  const loadPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/posts`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const postsData = await res.json();
      setPosts(postsData);
    } catch (err) {
      console.error("Falha ao carregar posts:", err);
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
      <h2>Bem-vindo de volta</h2>
      {message.text && (
        <div className={`${message.type}-message`}>{message.text}</div>
      )}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="username">Nome de Usuário</label>
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
          <label htmlFor="password">Senha</label>
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
          {isLoading ? "Por favor, aguarde..." : "Entrar"}
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
        ← Voltar para o Blog
      </button>
      <button
        onClick={onLogout}
        className="logout-btn"
        style={{ left: "auto", right: "2rem" }}
      >
        Sair
      </button>

      <h2>Criar Novo Post</h2>

      {message.text && (
        <div className={`${message.type}-message`}>{message.text}</div>
      )}

      <form onSubmit={onSubmitPost}>
        <div className="form-group">
          <label htmlFor="title">Título do Post</label>
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
          <label htmlFor="content">Conteúdo do Post</label>
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

        <div className="preview-container">
          {formData.content ? (
            <ReactMarkdown
              children={formData.content}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            />
          ) : (
            <p className="preview-placeholder">Preview vai aparacer aqui</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="label">Categoria</label>
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
        Ajuda com Markdown
      </button>

      {showMarkdownHelp && (
        <div className="markdown-help">
          <h4>Ajuda com Markdown</h4>
          <ul>
            <li>
              <strong># Título 1</strong> →{" "}
              <h1 style={{ display: "inline", fontSize: "1rem" }}>Título 1</h1>
            </li>
            <li>
              <strong>## Título 2</strong> →{" "}
              <h2 style={{ display: "inline", fontSize: "0.9rem" }}>
                Título 2
              </h2>
            </li>
            <li>
              <strong>**Negrito**</strong> → <strong>Negrito</strong>
            </li>
            <li>
              <strong>*Itálico*</strong> → <em>Itálico</em>
            </li>
            <li>
              <strong>[Link](url)</strong> →{" "}
              <a href="#markdown" style={{ color: "#0000EE" }}>
                Link
              </a>
            </li>
            <li>
              <strong>* Lista item</strong> → • Lista item
            </li>
            <li>
              <strong>1. Itens ordenados</strong> → 1. Item 1
            </li>
            <li>
              <strong>`Código`</strong> → <code>Código</code>
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
      <h3>Posts recentes</h3>
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
                Editar
              </button>
              <button
                className="btn-delete"
                onClick={() => onDelete("delete", post)}
              >
                Deletar
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
        <h3>Editar post</h3>
        <div className="form-group">
          <label htmlFor="editTitle">Título</label>
          <input
            type="text"
            id="editTitle"
            name="title"
            value={editData.title}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="editContent">Conteúdo</label>
          <textarea
            id="editContent"
            name="content"
            value={editData.content}
            onChange={handleInputChange}
            rows="6"
          />
        </div>

        <div className="form-group">
          <label>Preview</label>
          <div
            className="content-preview"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="editLabel">Categoria</label>
          <input
            type="text"
            id="editLabel"
            name="label"
            value={editData.label}
            onChange={handleInputChange}
          />
        </div>

        <div className="modal-buttons">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            Salvar alterações
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
        <h3>Confirmar deletação</h3>
        <p>Tem certeza de que deseja deletar? "{post.title}"?</p>
        <div className="modal-buttons">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-danger" onClick={() => onConfirm(post.id)}>
            Deletar post
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenovarAdmin;
