import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #ddd" }}>
      <Link to="/">Inicio</Link>

      {!user && <Link to="/login">Login</Link>}

      {user?.role === "cliente" && (
        <>
          <Link to="/tramites/nuevo">Solicitar trámite</Link>
          <Link to="/mis-tramites">Mis trámites</Link>
        </>
      )}

      {user?.role === "recepcionista" && (
        <>
          <Link to="/recepcion/panel">Panel Recepción</Link>
          <Link to="/recepcion/asignaciones">Asignar consultor</Link>
        </>
      )}

      {user?.role === "admin" && (
        <>
          <Link to="/admin/tramites">Trámites</Link>
          <Link to="/admin/catalogos">Catálogos</Link>
          <Link to="/admin/usuarios">Usuarios</Link>
        </>
      )}

      {user && (
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span>{user.name} ({user.role})</span>
          <button onClick={logout}>Salir</button>
        </div>
      )}
    </nav>
  );
}
