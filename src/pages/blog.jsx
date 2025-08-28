import React, { useState, useEffect } from "react";
import "./blog.css";
import NavBar from "../components/navbar";

const RenovarBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [navbarScrolled, setNavbarScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setNavbarScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    loadPosts();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("api/posts");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const postsData = await res.json();
      setPosts(postsData);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError(
        "Unable to load posts. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post) => {
    const identifier = post.slug || post.id;
    window.location.href = `/blog/${identifier}`;
  };

  return (
    <div className="renovar-blog">
      <NavBar />
      <HeroSection />
      <PostsSection
        posts={posts}
        loading={loading}
        error={error}
        onRetry={loadPosts}
        onPostClick={handlePostClick}
      />
    </div>
  );
};

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="overlay">
        <h1 className="title">BEM-VINDO AO RENOVAR</h1>
        <p className="subtitle">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate, id
        </p>
      </div>
    </section>
  );
};

const PostsSection = ({ posts, loading, error, onRetry, onPostClick }) => {
  return (
    <section className="posts-section">
      <div className="section-title">
        <h2>POSTAGENS RECENTES</h2>
        <p>FIQUE ATUALIZADO COM NOSSOS ÚLTIMOS ARTIGOS E INSIGHTS</p>
      </div>

      <main id="blog-posts">
        {loading && <LoadingState />}
        {error && <ErrorState error={error} onRetry={onRetry} />}
        {!loading && !error && posts.length === 0 && <EmptyState />}
        {!loading && !error && posts.length > 0 && (
          <PostsGrid posts={posts} onPostClick={onPostClick} />
        )}
      </main>
    </section>
  );
};

const LoadingState = () => {
  return <div className="loading"></div>;
};

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="empty-state">
      <h3>UNABLE TO LOAD POSTS</h3>
      <p>{error}</p>
      <button className="cta-button" onClick={onRetry}>
        RETRY
      </button>
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className="empty-state">
      <h3>NO POSTS YET</h3>
    </div>
  );
};

const PostsGrid = ({ posts, onPostClick }) => {
  return (
    <div className="posts-grid">
      {posts.reverse().map((post) => (
        <PostCard key={post.id} post={post} onClick={() => onPostClick(post)} />
      ))}
    </div>
  );
};

const PostCard = ({ post, onClick }) => {
  return (
    <div className="post" onClick={onClick}>
      <img
        src="https://placehold.co/600x400/000000/FFFFFF?text=POST"
        alt={post.title}
      />
      <div className="post-content">
        <h2>
          {post.title.length > 25
            ? post.title.substring(0, 25) + "..."
            : post.title}
        </h2>
        <p>
          {post.content.length > 50
            ? post.content.substring(0, 50) + "..."
            : post.content}
        </p>
        <div className="post-meta">
          <span className="label">
            {post.label.length > 25
              ? post.label.substring(0, 25) + "..."
              : post.label}
          </span>
          <span className="date">{post.date}</span>
        </div>
      </div>
    </div>
  );
};

export default RenovarBlog;
