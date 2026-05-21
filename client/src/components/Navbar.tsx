import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../api";

function getUsername() {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser).username as string;
  } catch {
    return null;
  }
}

function Navbar() {
  const navigate = useNavigate();
  const username = getUsername();

  async function logout() {
    try {
      await logoutUser();
    } catch {
      // The local session is cleared even if the server was already unavailable.
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      navigate("/login");
    }
  }

  return (
    <nav className="navbar">
      <h2>Chesstico</h2>

      <div className="nav-links">
        {username ? (
          <>
            <Link to="/lobby">Lobby</Link>
            <Link to="/ranking">Ranking</Link>
            <Link to="/history">Historial</Link>
            <span className="user-badge">♙ {username}</span>
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
