import { useState, useRef, useEffect } from "react";
import "./navbar.css";

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header>
      <div className="logo-placeholder">
        <a href="/">
          <img src="imagens/logo-renovar-nobackgroung.png" alt="Logo" />
        </a>
      </div>

      <div
        className={`menu-toggle ${menuOpen ? "active" : ""}`}
        onClick={toggleMenu}
      >
        ☰
      </div>

      <nav ref={menuRef} className={`menu ${menuOpen ? "ativo" : ""}`}>
        <ul>
          <li>
            <a href="/#sobre" onClick={() => setMenuOpen(false)}>
              Quem Somos
            </a>
          </li>
          <li>
            <a href="/blog" onClick={() => setMenuOpen(false)}>
              Blog
            </a>
          </li>
          <li>
            <a href="/#contato" onClick={() => setMenuOpen(false)}>
              Contato
            </a>
          </li>
          <li>
            <a href="/admin" onClick={() => setMenuOpen(false)}>
              Admin
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
