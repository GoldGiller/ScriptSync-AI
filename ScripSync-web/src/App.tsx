import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Convert from "./pages/Convert";
import History from "./pages/History";
import Schema from "./pages/Schema";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/convert" element={<Convert />} />
          <Route path="/history" element={<History />} />
          <Route path="/schema" element={<Schema />} />
        </Routes>
      </div>
    </Router>
  );
}
