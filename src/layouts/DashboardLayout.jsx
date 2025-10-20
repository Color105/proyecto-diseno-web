// src/layouts/DashboardLayout.jsx
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";

function Icon({ path, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d={path} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const icons = {
  home: "M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-6v-7H10v7H4a1 1 0 0 1-1-1v-10.5Z",
  users: "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M20 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  types: "M4 7h16M4 12h16M4 17h10",
  history: "M3 12a9 9 0 1 0 3-6.7M3 3v6h6M12 7v6l4 2",
};

function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);
  const crumbs = parts.map((segment, i) => ({
    href: "/" + parts.slice(0, i + 1).join("/"),
    label: segment.charAt(0).toUpperCase() + segment.slice(1),
  }));
  return (
    <nav aria-label="Breadcrumb" className="crumbs">
      <ol>
        <li><Link to="/">Inicio</Link></li>
        {crumbs.map(c => <li key={c.href}><Link to={c.href}>{c.label}</Link></li>)}
      </ol>
    </nav>
  );
}

export default function DashboardLayout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <div className="brand-logo">GT</div>
          <div>
            <div className="brand-title">Gestión de Trámites</div>
            <div className="brand-sub">Panel administrativo</div>
          </div>
        </Link>

        <div className="side-section">
          <div className="side-label">Navegación</div>
          <nav className="menu">
            <NavLink end to="/" className={({isActive}) => "item" + (isActive ? " active" : "")}>
              <Icon path={icons.home} /> <span>Inicio</span>
            </NavLink>
            <NavLink to="/admin/consultores" className={({isActive}) => "item" + (isActive ? " active" : "")}>
              <Icon path={icons.users} /> <span>Consultores</span>
            </NavLink>
            <NavLink to="/admin/tipos" className={({isActive}) => "item" + (isActive ? " active" : "")}>
              <Icon path={icons.types} /> <span>Tipos</span>
            </NavLink>
            <NavLink to="/admin/historial" className={({isActive}) => "item" + (isActive ? " active" : "")}>
              <Icon path={icons.history} /> <span>Historial</span>
            </NavLink>
          </nav>
        </div>

        <div className="side-footer">
          <small>© {new Date().getFullYear()} UTN-FRM</small>
        </div>
      </aside>

      <div className="content">
        <header className="topbar">
          <h1 className="title">Panel</h1>
          <Breadcrumbs />
        </header>

        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
