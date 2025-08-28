import { useState } from "react";
import "../pages/home.css";

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header>
      <div className="logo-placeholder">
        <a href="/">
          <img src="imagens/logo-renovar-nobackgroung.png" alt="" />
        </a>
      </div>
      <div
        className={`menu-toggle ${menuOpen ? "active" : ""}`}
        id="menu-toggle"
        onClick={toggleMenu}
      >
        ☰
      </div>
      <nav className={`menu ${menuOpen ? "menu-toggle" : ""}`} id="menu">
        <ul>
          <li>
            <a href="#sobre" onClick={() => setMenuOpen(false)}>
              Quem Somos
            </a>
          </li>
          <li>
            <a href="#processo" onClick={() => setMenuOpen(false)}>
              Processo
            </a>
          </li>
          <li>
            <a href="/blog" onClick={() => setMenuOpen(false)}>
              Blog
            </a>
          </li>
          <li>
            <a href="#contato" onClick={() => setMenuOpen(false)}>
              Contato
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
