import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");

  function logout() {
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <h2>Reino Chess</h2>

      <div className="nav-links">
        {user ? (
          <>
            <Link to="/lobby">Lobby</Link>
            <Link to="/ranking">Ranking</Link>
            <Link to="/history">Historial</Link>
            <span className="user-badge">♙ {user}</span>
            <button onClick={logout}>Salir</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Registro</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;