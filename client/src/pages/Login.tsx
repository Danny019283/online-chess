import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { loginUser } from "../api";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function login(e: FormEvent) {
    e.preventDefault();

    if (username.trim() === "" || password.trim() === "") {
      setMensaje("Complete todos los campos");
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser({ username, password });

      localStorage.setItem("user", JSON.stringify(response.data));
      localStorage.setItem("userId", response.data.userId.toString());

      setMensaje("");
      navigate("/lobby");
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Error al iniciar sesión";
      setMensaje(errorMsg);
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        {mensaje && <p className="form-message">{mensaje}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Ingresando..." : "Entrar"}
        </button>

        <p>
          ¿No tiene cuenta? <Link to="/register">Registrarse</Link>
        </p>
      </form>
    </main>
  );
}

export default Login;
