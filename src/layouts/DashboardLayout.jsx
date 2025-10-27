// src/layouts/DashboardLayout.jsx
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './DashboardLayout.css';

// --- Iconos ---
const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/></svg>;
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V18h14v-1.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V18h6v-1.5c0-2.33-4.67-3.5-7-3.5z"/></svg>;
const IconFile = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>;
const IconList = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zm0-8h14V7H7v2z"/></svg>;
const IconHistory = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>;
const IconBriefcase = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>;
const IconCustomer = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;

// Link Sidebar
function SidebarLink({ to, icon, label, ...props }) {
  return (
    <li>
      <NavLink
        to={to}
        end
        className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
        {...props}
      >
        {icon}
        <span>{label}</span>
      </NavLink>
    </li>
  );
}

// Sidebar
function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="logo-icon">GT</span>
        <div className="logo-text">
          <h2>Gestión de Trámites</h2>
          <span>Panel {user?.role || '...'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <SidebarLink to="/" label="Inicio" icon={<IconHome />} />

          {/* Admin */}
          {user?.role === 'admin' && (
            <>
              <SidebarLink to="/admin/clientes"    label="Clientes"            icon={<IconCustomer />} />
              <SidebarLink to="/admin/consultores" label="Consultores"         icon={<IconUsers />} />
              <SidebarLink to="/admin/tipos"       label="Tipos"               icon={<IconFile />} />
              <SidebarLink to="/admin/estados"     label="Estados de Trámite"  icon={<IconList />} />
              <SidebarLink to="/admin/historial"   label="Historial"           icon={<IconHistory />} />
            </>
          )}

          {/* Admin / Recepcionista */}
          {(user?.role === 'admin' || user?.role === 'recepcionista') && (
            <SidebarLink to="/admin/tramites" label="Ver Trámites" icon={<IconBriefcase />} />
          )}

          {/* Cliente */}
          {user?.role === 'cliente' && (
            <>
              <SidebarLink to="/mis-tramites"     label="Mis Trámites"     icon={<IconBriefcase />} />
              <SidebarLink to="/tramites/nuevo"   label="Solicitar Trámite" icon={<IconFile />} />
            </>
          )}
        </ul>
      </nav>

      <div className="sidebar-footer">© 2025 UTN-FRM</div>
    </aside>
  );
}

// Header
function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-title">Panel</div>
      <div className="header-user">
        <span>{user?.email}</span>
        <button onClick={handleLogout} className="btn-primary-logout">Cerrar Sesión</button>
      </div>
    </header>
  );
}

// Layout
export default function DashboardLayout() {
  const { loading } = useAuth();
  if (loading) return <div>Cargando sesión...</div>;

  return (
    <div className="shell">
      <Sidebar />
      <Header />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
