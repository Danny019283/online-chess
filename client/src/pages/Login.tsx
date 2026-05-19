import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../api";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();

    if (username.trim() === "" || password.trim() === "") {
      setMensaje("Complete todos los campos");
      return;
    }

    try {
      await loginUser({ username, password });

      localStorage.setItem("user", username);
      navigate("/lobby");
    } catch {
      // Temporal mientras el backend no esté listo
      localStorage.setItem("user", username);
      setMensaje("Ingreso temporal activado, backend pendiente");
      navigate("/lobby");
    }
  }

  return (
    <main className="container">
      <form className="card" onSubmit={login}>
        <h1>Iniciar sesión</h1>

        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {mensaje && <p className="form-message">{mensaje}</p>}

        <button type="submit">Entrar</button>

        <p>
          ¿No tiene cuenta? <Link to="/register">Registrarse</Link>
        </p>
      </form>
    </main>
  );
}

export default Login;