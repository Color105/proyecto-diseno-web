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

const GestionVersiones   = lazy(() => import("./pages/GestionVersiones.jsx"));
const EditorFlujo        = lazy(() => import("./pages/EditorFlujo.jsx"));

// ⭐ NUEVA página: Subir Documentación
const SubirDocumentacionPage = lazy(() =>
  import("./pages/SubirDocumentacionPage.jsx")
);

// ⭐ NUEVA página: Listas de Precios
const ListaPreciosPage = lazy(() =>
  import("./pages/ListaPreciosPage.jsx")   // guarda que esta ruta coincida con dónde guardaste el JSX
);

const NotFound = () => (
  <div style={{ padding: 24 }}>404 — Página no encontrada</div>
);

const withSuspense = (el) => (
  <Suspense fallback="Cargando…">
    {el}
  </Suspense>
);

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

      // ====== Rutas Admin ======
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
      {
        path: "admin/estados",
        element: (
          <ProtectedRoute roles={["admin"]}>
            {withSuspense(<ABMEstadoTramites />)}
          </ProtectedRoute>
        ),
      },

      // Versiones de Tipo de Trámite
      {
        path: "admin/tipos/:tipoTramiteId/versiones",
        element: (
          <ProtectedRoute roles={["admin"]}>
            {withSuspense(<GestionVersiones />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/versiones/:versionId/editar",
        element: (
          <ProtectedRoute roles={["admin"]}>
            {withSuspense(<EditorFlujo />)}
          </ProtectedRoute>
        ),
      },

      // Historial
      {
        path: "admin/historial",
        element: (
          <ProtectedRoute roles={["admin"]}>
            {withSuspense(<HistorialEstados />)}
          </ProtectedRoute>
        ),
      },

      // ⭐ NUEVA RUTA: Subir Documentación
      {
        path: "admin/subir-documentacion",
        element: (
          <ProtectedRoute roles={["admin", "recepcionista"]}>
            {withSuspense(<SubirDocumentacionPage />)}
          </ProtectedRoute>
        ),
      },

      // ⭐ NUEVA RUTA: Listas de Precios
      {
        path: "admin/listas-precios",
        element: (
          <ProtectedRoute roles={["admin"]}>
            {withSuspense(<ListaPreciosPage />)}
          </ProtectedRoute>
        ),
      },

      // 404 dentro del layout
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
