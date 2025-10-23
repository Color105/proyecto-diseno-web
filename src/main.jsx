import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import { AuthProvider } from "./auth/AuthContext.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import DashboardLayout from "./layouts/DashboardLayout.jsx";
import App from "./App.jsx";
import LoginPage from "./pages/LoginPage.jsx";

// Tus componentes 'pages'
const ABMConsultores    = lazy(() => import("./pages/ABMConsultores.jsx"));
const ABMTipos          = lazy(() => import("./pages/ABMTipos.jsx"));
const ABMEstadoTramites = lazy(() => import("./pages/ABMEstadoTramites.jsx"));
const HistorialEstados  = lazy(() => import("./pages/HistorialEstados.jsx"));

// --- ¡¡CORRECCIÓN!! Importamos desde 'components' ---
const TramiteDashboard  = lazy(() => import("./components/TramiteDashboard.jsx")); 
// --- Fin Corrección ---

const NotFound          = () => <div style={{ padding: 24 }}>404 — Página no encontrada</div>;

const withSuspense = (el) => <Suspense fallback="Cargando…">{el}</Suspense>;

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <App /> },
      
      // Ruta del Dashboard de Trámites
      {
        path: "admin/tramites",
        element: (
          <ProtectedRoute roles={["admin", "recepcionista"]}>
            {withSuspense(<TramiteDashboard />)}
          </ProtectedRoute>
        ),
      },

      // Tus otras rutas admin
      { path: "admin/consultores", element: (<ProtectedRoute roles={["admin"]}>{withSuspense(<ABMConsultores />)}</ProtectedRoute>), },
      { path: "admin/tipos", element: (<ProtectedRoute roles={["admin"]}>{withSuspense(<ABMTipos />)}</ProtectedRoute>), },
      { path: "admin/estados", element: (<ProtectedRoute roles={["admin"]}>{withSuspense(<ABMEstadoTramites />)}</ProtectedRoute>), },
      { path: "admin/historial", element: (<ProtectedRoute roles={["admin"]}>{withSuspense(<HistorialEstados />)}</ProtectedRoute>), },

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

