// src/main.jsx
import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import { AuthProvider } from "./auth/AuthContext.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import DashboardLayout from "./layouts/DashboardLayout.jsx";
import App from "./App.jsx";
import LoginPage from "./pages/LoginPage.jsx";

// Pages (lazy)
const ABMClientes        = lazy(() => import("./pages/ABMClientes.jsx"));
const ABMConsultores     = lazy(() => import("./pages/ABMConsultores.jsx"));
const ABMTipos           = lazy(() => import("./pages/ABMTipos.jsx"));
const ABMEstadoTramites  = lazy(() => import("./pages/ABMEstadoTramites.jsx"));
const HistorialEstados   = lazy(() => import("./pages/HistorialEstados.jsx"));
const TramiteDashboard   = lazy(() => import("./components/TramiteDashboard.jsx"));

// --- ¡¡NUEVAS PÁGINAS A IMPORTAR!! ---
const GestionVersiones = lazy(() => import("./pages/GestionVersiones.jsx"));
const EditorFlujo      = lazy(() => import("./pages/EditorFlujo.jsx"));

const NotFound = () => <div style={{ padding: 24 }}>404 — Página no encontrada</div>;
const withSuspense = (el) => <Suspense fallback="Cargando…">{el}</Suspense>;

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <App /> },

      // Dashboard de Trámites (Admin/Recep)
      {
        path: "admin/tramites",
        element: (
          <ProtectedRoute roles={["admin", "recepcionista"]}>
            {withSuspense(<TramiteDashboard />)}
          </ProtectedRoute>
        ),
      },

      // Rutas Admin (protegidas)
      {
        path: "admin/clientes",
        element: (
          <ProtectedRoute roles={["admin"]}>
            {withSuspense(<ABMClientes />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/consultores",
        element: (
          <ProtectedRoute roles={["admin"]}>
            {withSuspense(<ABMConsultores />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/tipos",
        element: (
          <ProtectedRoute roles={["admin"]}>
            {withSuspense(<ABMTipos />)}
          </ProtectedRoute>
        ),
      },
      
      // --- ¡¡NUEVA RUTA DE VERSIONES!! ---
      {
        path: "admin/tipos/:tipoTramiteId/versiones",
        element: (
          <ProtectedRoute roles={["admin"]}>
            {withSuspense(<GestionVersiones />)}
          </ProtectedRoute>
        ),
      },
      // --- ¡¡NUEVA RUTA DEL EDITOR DE FLUJO!! ---
      {
        path: "admin/versiones/:versionId/editar",
        element: (
          <ProtectedRoute roles={["admin"]}>
            {withSuspense(<EditorFlujo />)}
          </ProtectedRoute>
        ),
      },
      // --- FIN DE NUEVAS RUTAS ---

      {
        path: "admin/estados",
        element: (
          <ProtectedRoute roles={["admin"]}>
            {withSuspense(<ABMEstadoTramites />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/historial",
        element: (
          <ProtectedRoute roles={["admin"]}>
            {withSuspense(<HistorialEstados />)}
          </ProtectedRoute>
        ),
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);