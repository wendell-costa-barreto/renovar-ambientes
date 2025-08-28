import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./dynamic.css";

const RenovarPost = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  useEffect(() => {
    if (id && id !== "dynamic") {
      loadPost(id);
    } else {
      setError("No post specified. Please provide a post ID or slug.");
      setLoading(false);
    }
  }, [id]);

  const loadPost = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/post/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Post not found");
        } else {
          throw new Error("Failed to load post");
        }
      }

      const postData = await response.json();
      setPost(postData);
    } catch (err) {
      console.error("Error loading post:", err);
      setError(err.message || "Failed to load post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const parseMarkdown = (text) => {
    if (!text) return "";

    text = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const lines = text.split("\n");
    let html = "";
    let inList = false;
    let inCodeBlock = false;
    let inBlockquote = false;

    lines.forEach((line) => {
      if (/^```/.test(line)) {
        inCodeBlock = !inCodeBlock;
        html += inCodeBlock ? "<pre><code>" : "</code></pre>";
        return;
      }
      if (inCodeBlock) {
        html += line + "\n";
        return;
      }

      if (/^> /.test(line)) {
        if (!inBlockquote) {
          html += "<blockquote>";
          inBlockquote = true;
        }
        html += line.replace(/^> /, "") + "\n";
        return;
      } else if (inBlockquote) {
        html += "</blockquote>";
        inBlockquote = false;
      }

      // Headers
      if (/^### (.*)/.test(line))
        html += "<h3>" + line.replace(/^### /, "") + "</h3>";
      else if (/^## (.*)/.test(line))
        html += "<h2>" + line.replace(/^## /, "") + "</h2>";
      else if (/^# (.*)/.test(line))
        html += "<h1>" + line.replace(/^# /, "") + "</h1>";
      // Lists
      else if (/^\* /.test(line)) {
        if (!inList) {
          html += "<ul>";
          inList = true;
        }
        html += "<li>" + line.replace(/^\* /, "") + "</li>";
      } else {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        if (line.trim() !== "") html += "<p>" + line + "</p>";
      }
    });

    // Close any open tags
    if (inList) html += "</ul>";
    if (inBlockquote) html += "</blockquote>";
    if (inCodeBlock) html += "</code></pre>";

    // Inline formatting
    html = html
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // italic
      .replace(/`(.*?)`/g, "<code>$1</code>") // inline code
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      ); // links

    return html;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleBackClick = () => {
    navigate("/blog");
  };

  const handleHeaderClick = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="renovar-post">
        <div className="post-container">
          <div className="loading">Loading post...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="renovar-post">
        <div className="post-container">
          <div className="error-message">
            {error}
            <button
              className="back-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="renovar-post">
        <div className="post-container">
          <div className="error-message">
            Post not found
            <button className="back-btn" onClick={handleBackClick}>
              Back to Blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="renovar-post">
      <div className="post-container">
        <Header onClick={handleHeaderClick} />

        <PostCard
          post={post}
          parseMarkdown={parseMarkdown}
          formatDate={formatDate}
          onBackClick={handleBackClick}
        />
      </div>
    </div>
  );
};

const Header = ({ onClick }) => {
  return (
    <div className="header" onClick={onClick}>
      <h1>RENOVAR</h1>
      <p>BLOG POST</p>
    </div>
  );
};

const PostCard = ({ post, parseMarkdown, formatDate, onBackClick }) => {
  useEffect(() => {
    document.title = `${post.title} | RENOVAR`;
  }, [post.title]);

  return (
    <div className="post-card">
      <div className="post-meta">
        <span className="post-label">{post.label || "Uncategorized"}</span>
        <span className="post-date">
          {post.updated && `Updated: ${formatDate(post.updated)}`}
          {!post.updated &&
            post.createdAt &&
            `Published: ${formatDate(post.createdAt)}`}
          {!post.updated &&
            !post.createdAt &&
            post.date &&
            `Published: ${post.date}`}
        </span>
      </div>

      <h1 className="post-title">{post.title}</h1>

      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
      />

      <button className="back-btn" onClick={onBackClick}>
        ← BACK TO BLOG
      </button>
    </div>
  );
};

export default RenovarPost;
