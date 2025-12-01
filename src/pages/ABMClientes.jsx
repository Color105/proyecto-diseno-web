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

// ======================
// Helpers de validación
// ======================

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const soloLetrasEspacios = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;

function validarNombre(nombre) {
  const value = nombre.trim();
  if (!value) return "El nombre es obligatorio.";
  if (value.length < 3) return "El nombre debe tener al menos 3 caracteres.";
  if (!soloLetrasEspacios.test(value)) return "Solo se permiten letras y espacios.";
  if (value.split(/\s+/).length < 2) return "Por favor ingrese nombre y apellido.";
  return "";
}

// CUIT argentino: 11 dígitos + dígito verificador
function validarCuit(cuit) {
  const digits = cuit.replace(/[^0-9]/g, "");
  if (!digits) return "El CUIT es obligatorio.";
  if (digits.length !== 11) return "El CUIT debe tener 11 dígitos.";

  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const nums = digits.split("").map((d) => parseInt(d, 10));

  let suma = 0;
  for (let i = 0; i < 10; i++) {
    suma += nums[i] * pesos[i];
  }
  const resto = suma % 11;
  let digito = 11 - resto;
  if (digito === 11) digito = 0;
  if (digito === 10) digito = 9;

  if (digito !== nums[10]) return "CUIT inválido (dígito verificador incorrecto).";
  return "";
}

function validarTelefono(telefono) {
  const digits = telefono.replace(/[^0-9]/g, "");
  if (!digits) return ""; // opcional
  if (digits.length < 8 || digits.length > 15) {
    return "Teléfono inválido (use entre 8 y 15 dígitos).";
  }
  return "";
}

function validarDireccion(dir) {
  const value = dir.trim();
  if (!value) return "La dirección es obligatoria.";
  if (value.length < 5) return "La dirección es demasiado corta.";
  if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(value)) {
    return "La dirección debe contener al menos una letra.";
  }
  return "";
}

function validarEmail(email, obligatorio = true) {
  const value = email.trim();
  if (!value) return obligatorio ? "El email es obligatorio." : "";
  if (!emailRegex.test(value)) return "Email inválido.";
  return "";
}

function validarPerfil(perfil) {
  const errors = {};
  const eNombre = validarNombre(perfil.nombre_apellido_cliente);
  if (eNombre) errors.nombre_apellido_cliente = eNombre;

  const eCuit = validarCuit(perfil.cuit_cliente);
  if (eCuit) errors.cuit_cliente = eCuit;

  const eMail = validarEmail(perfil.mail_cliente, true);
  if (eMail) errors.mail_cliente = eMail;

  const eDir = validarDireccion(perfil.direccion_cliente);
  if (eDir) errors.direccion_cliente = eDir;

  const eTel = validarTelefono(perfil.telefono_cliente);
  if (eTel) errors.telefono_cliente = eTel;

  return errors;
}

function validarLogin(login) {
  const errors = {};
  if (!login.nameLogin.trim()) {
    errors.nameLogin = "El nombre de usuario es obligatorio.";
  }
  const eEmail = validarEmail(login.emailLogin, true);
  if (eEmail) errors.emailLogin = eEmail;

  if (!login.passwordLogin) {
    errors.passwordLogin = "La contraseña es obligatoria.";
  } else if (login.passwordLogin.length < 8) {
    errors.passwordLogin = "La contraseña debe tener al menos 8 caracteres.";
  }

  return errors;
}

export default function ABMClientes() {
  const { user } = useAuth();
  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("create"); // 'create' | 'edit'
  const [perfil, setPerfil] = useState(emptyPerfil);
  const [login, setLogin] = useState(emptyLogin);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [deleteMessage, setDeleteMessage] = useState(""); // 👈 mensaje global para borrar

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
    setErrors({});
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
    setLogin(emptyLogin);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar este cliente definitivamente?")) return;

    try {
      setLoading(true);
      setDeleteMessage(""); // limpiamos mensaje previo

      await deleteCliente(id); // lanza Error si el backend responde 4xx/5xx

      await fetchClientes();
      if (perfil.id === id) resetForm();
    } catch (err) {
      console.error("Error al eliminar cliente:", err);
      const apiMessage = err?.message || "No se pudo eliminar el cliente.";
      setDeleteMessage(apiMessage);
      alert(apiMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const perfilErrors = validarPerfil(perfil);
    const loginErrors = mode === "create" ? validarLogin(login) : {};
    const allErrors = { ...perfilErrors, ...loginErrors };

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    setErrors({});
    setDeleteMessage("");
    setLoading(true);

    try {
      if (mode === "create") {
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
          },
        };
        await updateCliente(perfil.id, payload);
      }

      await fetchClientes();
      resetForm();
    } finally {
      setLoading(false);
    }
  }

  // helpers para onChange con validación inmediata por campo
  const updatePerfilField = (field, value) => {
    setPerfil((prev) => ({ ...prev, [field]: value }));

    setErrors((prev) => {
      const newErrors = { ...prev };
      let msg = "";

      if (field === "nombre_apellido_cliente") msg = validarNombre(value);
      if (field === "cuit_cliente") msg = validarCuit(value);
      if (field === "mail_cliente") msg = validarEmail(value, true);
      if (field === "direccion_cliente") msg = validarDireccion(value);
      if (field === "telefono_cliente") msg = validarTelefono(value);

      if (msg) newErrors[field] = msg;
      else delete newErrors[field];

      return newErrors;
    });
  };

  const updateLoginField = (field, value) => {
    setLogin((prev) => ({ ...prev, [field]: value }));

    setErrors((prev) => {
      const newErrors = { ...prev };
      let msg = "";

      if (field === "nameLogin" && !value.trim()) {
        msg = "El nombre de usuario es obligatorio.";
      }
      if (field === "emailLogin") {
        msg = validarEmail(value, true);
      }
      if (field === "passwordLogin") {
        if (!value) msg = "La contraseña es obligatoria.";
        else if (value.length < 8) msg = "La contraseña debe tener al menos 8 caracteres.";
      }

      if (msg) newErrors[field] = msg;
      else delete newErrors[field];

      return newErrors;
    });
  };

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

        <form className="abmClientes-form" onSubmit={handleSubmit} noValidate>
          <div className="grid">
            <label>
              <span>Nombre y Apellido</span>
              <input
                value={perfil.nombre_apellido_cliente}
                onChange={(e) =>
                  updatePerfilField("nombre_apellido_cliente", e.target.value)
                }
                required
              />
              {errors.nombre_apellido_cliente && (
                <p className="field-error">{errors.nombre_apellido_cliente}</p>
              )}
            </label>

            <label>
              <span>CUIT</span>
              <input
                value={perfil.cuit_cliente}
                onChange={(e) => updatePerfilField("cuit_cliente", e.target.value)}
                required
              />
              {errors.cuit_cliente && (
                <p className="field-error">{errors.cuit_cliente}</p>
              )}
            </label>

            <label>
              <span>Mail</span>
              <input
                type="email"
                value={perfil.mail_cliente}
                onChange={(e) =>
                  updatePerfilField("mail_cliente", e.target.value)
                }
                required
              />
              {errors.mail_cliente && (
                <p className="field-error">{errors.mail_cliente}</p>
              )}
            </label>

            <label>
              <span>Dirección</span>
              <input
                value={perfil.direccion_cliente}
                onChange={(e) =>
                  updatePerfilField("direccion_cliente", e.target.value)
                }
                required
              />
              {errors.direccion_cliente && (
                <p className="field-error">{errors.direccion_cliente}</p>
              )}
            </label>

            <label>
              <span>Teléfono</span>
              <input
                type="tel"
                value={perfil.telefono_cliente}
                onChange={(e) =>
                  updatePerfilField("telefono_cliente", e.target.value)
                }
              />
              {errors.telefono_cliente && (
                <p className="field-error">{errors.telefono_cliente}</p>
              )}
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
                    onChange={(e) =>
                      updateLoginField("nameLogin", e.target.value)
                    }
                    required
                  />
                  {errors.nameLogin && (
                    <p className="field-error">{errors.nameLogin}</p>
                  )}
                </label>

                <label>
                  <span>Email de login</span>
                  <input
                    type="email"
                    value={login.emailLogin}
                    onChange={(e) =>
                      updateLoginField("emailLogin", e.target.value)
                    }
                    required
                  />
                  {errors.emailLogin && (
                    <p className="field-error">{errors.emailLogin}</p>
                  )}
                </label>

                <label>
                  <span>Password</span>
                  <input
                    type="password"
                    value={login.passwordLogin}
                    onChange={(e) =>
                      updateLoginField("passwordLogin", e.target.value)
                    }
                    required
                  />
                  {errors.passwordLogin && (
                    <p className="field-error">{errors.passwordLogin}</p>
                  )}
                </label>

                <label>
                  <span>Rol</span>
                  <select
                    value={login.roleLogin}
                    onChange={(e) =>
                      setLogin({ ...login, roleLogin: e.target.value })
                    }
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

        {/* Mensaje de error al eliminar */}
        {deleteMessage && (
          <div className="alert error">
            {deleteMessage}
          </div>
        )}

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
