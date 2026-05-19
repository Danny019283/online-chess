import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerUser } from "../api";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function register(e: React.FormEvent) {
    e.preventDefault();

    if (username.trim() === "" || password.trim() === "") {
      setMensaje("Complete todos los campos");
      return;
    }

    try {
      await registerUser({ username, password });

      setMensaje("Usuario registrado correctamente");
      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch {
      // Temporal mientras el backend no esté listo
      setMensaje("Registro temporal realizado, backend pendiente");

      setTimeout(() => {
        navigate("/login");
      }, 800);
    }
  }

  return (
    <main className="container">
      <form className="card" onSubmit={register}>
        <h1>Registro</h1>

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

        <button type="submit">Registrarse</button>

        <p>
          ¿Ya tiene cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </form>
    </main>
  );
}

export default Register;