import { useEffect, useMemo, useState } from "react";
import "./ABMClientes.css";
import { listClientes, createCliente, updateCliente, deleteCliente } from "../services/adminApi";
import { useAuth } from "../auth/AuthContext";

const emptyPerfil = {
  id: null,
  nombre_apellido_cliente: "",
  cuit_cliente: "",
  mail_cliente: "",
  direccion_cliente: "",
  telefono_cliente: "",
};

const emptyLogin = {
  nameLogin: "",
  emailLogin: "",
  passwordLogin: "",
  roleLogin: "cliente",
};

export default function ABMClientes() {
  const { user } = useAuth();
  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("create"); // 'create' | 'edit'
  const [perfil, setPerfil] = useState(emptyPerfil);
  const [login, setLogin] = useState(emptyLogin);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    try {
      setLoading(true);
      const data = await listClientes();
      setClientes(data || []);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setPerfil(emptyPerfil);
    setLogin(emptyLogin);
    setMode("create");
  }

  function handleEdit(row) {
    setMode("edit");
    setPerfil({
      id: row.id,
      nombre_apellido_cliente: row.nombre_apellido_cliente || "",
      cuit_cliente: row.cuit_cliente || "",
      mail_cliente: row.mail_cliente || "",
      direccion_cliente: row.direccion_cliente || "",
      telefono_cliente: row.telefono_cliente || "",
    });
    // En editar NO tocamos credenciales → dejamos login vacío
    setLogin(emptyLogin);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar este cliente definitivamente?")) return;
    await deleteCliente(id);
    await fetchClientes();
    if (perfil.id === id) resetForm();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (mode === "create") {
      // mapear payload anidado que espera Rails
      const payload = {
        cliente: {
          nombre_apellido_cliente: perfil.nombre_apellido_cliente.trim(),
          cuit_cliente: perfil.cuit_cliente.trim(),
          mail_cliente: perfil.mail_cliente.trim(),
          direccion_cliente: perfil.direccion_cliente.trim(),
          telefono_cliente: perfil.telefono_cliente.trim(),
          user_attributes: {
            name: login.nameLogin.trim(),
            email: login.emailLogin.trim(),
            password: login.passwordLogin,
            password_confirmation: login.passwordLogin,
            role: login.roleLogin || "cliente",
          },
        },
      };
      await createCliente(payload);
    } else {
      const payload = {
        cliente: {
          nombre_apellido_cliente: perfil.nombre_apellido_cliente.trim(),
          cuit_cliente: perfil.cuit_cliente.trim(),
          mail_cliente: perfil.mail_cliente.trim(),
          direccion_cliente: perfil.direccion_cliente.trim(),
          telefono_cliente: perfil.telefono_cliente.trim(),
          // sin user_attributes en editar
        },
      };
      await updateCliente(perfil.id, payload);
    }

    await fetchClientes();
    resetForm();
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return clientes;
    return clientes.filter((c) =>
      [
        c.nombre_apellido_cliente,
        c.cuit_cliente,
        c.mail_cliente,
        c.direccion_cliente,
        c.telefono_cliente,
        c?.user?.email,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [clientes, search]);

  if (!isAdmin) {
    return (
      <div className="abmClientes-wrapper">
        <div className="abmClientes-card">
          <h2>Acceso restringido</h2>
          <p>Esta sección es solo para administradores.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="abmClientes-wrapper">
      {/* Formulario */}
      <div className="abmClientes-card">
        <div className="abmClientes-header">
          <h2>{mode === "create" ? "Nuevo Cliente" : "Editar Cliente"}</h2>
          {mode === "edit" && (
            <button className="btn ghost" onClick={resetForm}>
              Cancelar edición
            </button>
          )}
        </div>

        <form className="abmClientes-form" onSubmit={handleSubmit}>
          <div className="grid">
            <label>
              <span>Nombre y Apellido</span>
              <input
                value={perfil.nombre_apellido_cliente}
                onChange={(e) =>
                  setPerfil({ ...perfil, nombre_apellido_cliente: e.target.value })
                }
                required
              />
            </label>

            <label>
              <span>CUIT</span>
              <input
                value={perfil.cuit_cliente}
                onChange={(e) => setPerfil({ ...perfil, cuit_cliente: e.target.value })}
                required
              />
            </label>

            <label>
              <span>Mail</span>
              <input
                type="email"
                value={perfil.mail_cliente}
                onChange={(e) => setPerfil({ ...perfil, mail_cliente: e.target.value })}
              />
            </label>

            <label>
              <span>Dirección</span>
              <input
                value={perfil.direccion_cliente}
                onChange={(e) =>
                  setPerfil({ ...perfil, direccion_cliente: e.target.value })
                }
              />
            </label>

            <label>
              <span>Teléfono</span>
              <input
                value={perfil.telefono_cliente}
                onChange={(e) =>
                  setPerfil({ ...perfil, telefono_cliente: e.target.value })
                }
              />
            </label>
          </div>

          {mode === "create" && (
            <>
              <div className="divider" />
              <h3>Credenciales de acceso</h3>
              <div className="grid">
                <label>
                  <span>Nombre de usuario</span>
                  <input
                    value={login.nameLogin}
                    onChange={(e) => setLogin({ ...login, nameLogin: e.target.value })}
                    required
                  />
                </label>

                <label>
                  <span>Email de login</span>
                  <input
                    type="email"
                    value={login.emailLogin}
                    onChange={(e) => setLogin({ ...login, emailLogin: e.target.value })}
                    required
                  />
                </label>

                <label>
                  <span>Password</span>
                  <input
                    type="password"
                    value={login.passwordLogin}
                    onChange={(e) =>
                      setLogin({ ...login, passwordLogin: e.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  <span>Rol</span>
                  <select
                    value={login.roleLogin}
                    onChange={(e) => setLogin({ ...login, roleLogin: e.target.value })}
                  >
                    <option value="cliente">cliente</option>
                    <option value="admin">admin</option>
                  </select>
                </label>
              </div>
            </>
          )}

          <div className="actions">
            <button className="btn primary" type="submit" disabled={loading}>
              {mode === "create" ? "Crear" : "Guardar cambios"}
            </button>
            <button className="btn" type="button" onClick={resetForm}>
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* Tabla */}
      <div className="abmClientes-card">
        <div className="abmClientes-header">
          <h2>Clientes</h2>
          <input
            className="search"
            placeholder="Buscar por nombre, CUIT, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="table-wrapper">
            <table className="abmClientes-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>CUIT</th>
                  <th>Mail</th>
                  <th>Dirección</th>
                  <th>Teléfono</th>
                  <th>Login/email</th>
                  <th style={{ width: 160 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="empty">
                      Sin resultados
                    </td>
                  </tr>
                )}
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.nombre_apellido_cliente}</td>
                    <td>{c.cuit_cliente}</td>
                    <td>{c.mail_cliente}</td>
                    <td>{c.direccion_cliente}</td>
                    <td>{c.telefono_cliente}</td>
                    <td>{c?.user?.email || "-"}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn small" onClick={() => handleEdit(c)}>
                          Editar
                        </button>
                        <button
                          className="btn small danger"
                          onClick={() => handleDelete(c.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

