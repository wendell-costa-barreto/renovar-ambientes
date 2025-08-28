// App.jsx
import { Routes, Route } from "react-router-dom";
import RenovarWebsite from "./pages/home";
import RenovarBlog from "./pages/blog";
import RenovarAdmin from "./pages/admin";
import RenovarPost from "./pages/dynamic";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RenovarWebsite />} />
      <Route path="/blog" element={<RenovarBlog />} />
      <Route path="/blog/:id" element={<RenovarPost />} />
      <Route path="/admin" element={<RenovarAdmin />} />
    </Routes>
  );
}

export default App;
