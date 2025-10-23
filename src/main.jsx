import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import DashboardLayout from "./layouts/DashboardLayout.jsx";
import App from "./App.jsx";

const ABMConsultores   = lazy(() => import("./pages/ABMConsultores.jsx"));
const ABMTipos         = lazy(() => import("./pages/ABMTipos.jsx"));
// Corregido: la ruta de importación ahora usa "./pages"
const ABMEstadoTramites = lazy(_c5 => import("./pages/ABMEstadoTramites.jsx"));
const HistorialEstados = lazy(() => import("./pages/HistorialEstados.jsx"));
const NotFound         = () => <div style={{ padding: 24 }}>404 — Página no encontrada</div>;

const withSuspense = (el) => <Suspense fallback="Cargando…">{el}</Suspense>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <App /> },
      { path: "admin/consultores", element: withSuspense(<ABMConsultores />) },
      { path: "admin/tipos",       element: withSuspense(<ABMTipos />) },
      // Ruta agregada para el nuevo ABM
      { path: "admin/estados",     element: withSuspense(<ABMEstadoTramites />) },
      { path: "admin/historial",   element: withSuspense(<HistorialEstados />) },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);