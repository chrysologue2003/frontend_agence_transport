import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { RoleRoute } from './RoleRoute.jsx';
import { ROLES } from '../utils/constants.js';
import { Loader } from '../components/common/Loader.jsx';

// Lazy loaded page components
const Login = lazy(() =>
  import('../pages/Login.jsx').then((m) => ({ default: m.Login })),
);
const Dashboard = lazy(() =>
  import('../pages/Dashboard.jsx').then((m) => ({ default: m.Dashboard })),
);
const Clients = lazy(() =>
  import('../pages/Clients.jsx').then((m) => ({ default: m.Clients })),
);
const Vehicules = lazy(() =>
  import('../pages/Vehicules.jsx').then((m) => ({ default: m.Vehicules })),
);
const Chauffeurs = lazy(() =>
  import('../pages/Chauffeurs.jsx').then((m) => ({ default: m.Chauffeurs })),
);
const Activites = lazy(() =>
  import('../pages/Activites.jsx').then((m) => ({ default: m.Activites })),
);
const Paiements = lazy(() =>
  import('../pages/Paiements.jsx').then((m) => ({ default: m.Paiements })),
);
const Depenses = lazy(() =>
  import('../pages/Depenses.jsx').then((m) => ({ default: m.Depenses })),
);
const Caisse = lazy(() =>
  import('../pages/Caisse.jsx').then((m) => ({ default: m.Caisse })),
);
const Recettes = lazy(() =>
  import('../pages/Recettes.jsx').then((m) => ({ default: m.Recettes })),
);
const TypesPrestations = lazy(() =>
  import('../pages/TypesPrestations.jsx').then((m) => ({
    default: m.TypesPrestations,
  })),
);
const CategoriesDepenses = lazy(() =>
  import('../pages/CategoriesDepenses.jsx').then((m) => ({
    default: m.CategoriesDepenses,
  })),
);
const Users = lazy(() =>
  import('../pages/Users.jsx').then((m) => ({ default: m.Users })),
);
const Rapports = lazy(() =>
  import('../pages/Rapports.jsx').then((m) => ({ default: m.Rapports })),
);

export const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <Loader size="lg" message="Chargement de la page..." />
        </div>
      }
    >
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Application Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/activites"
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.ADMINISTRATEUR,
                  ROLES.RESPONSABLE,
                  ROLES.AGENT,
                ]}
              >
                <Activites />
              </RoleRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.ADMINISTRATEUR,
                  ROLES.RESPONSABLE,
                  ROLES.AGENT,
                ]}
              >
                <Clients />
              </RoleRoute>
            }
          />
          <Route
            path="/vehicules"
            element={
              <RoleRoute
                allowedRoles={[ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE]}
              >
                <Vehicules />
              </RoleRoute>
            }
          />
          <Route
            path="/chauffeurs"
            element={
              <RoleRoute
                allowedRoles={[ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE]}
              >
                <Chauffeurs />
              </RoleRoute>
            }
          />
          <Route
            path="/paiements"
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.ADMINISTRATEUR,
                  ROLES.RESPONSABLE,
                  ROLES.COMPTABLE_CAISSIER,
                  ROLES.AGENT,
                ]}
              >
                <Paiements />
              </RoleRoute>
            }
          />
          <Route
            path="/depenses"
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.ADMINISTRATEUR,
                  ROLES.RESPONSABLE,
                  ROLES.COMPTABLE_CAISSIER,
                ]}
              >
                <Depenses />
              </RoleRoute>
            }
          />

          {/* Financial routes restricted to Admin, Resp, Caissier */}
          <Route
            path="/recettes"
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.ADMINISTRATEUR,
                  ROLES.RESPONSABLE,
                  ROLES.COMPTABLE_CAISSIER,
                ]}
              >
                <Recettes />
              </RoleRoute>
            }
          />
          <Route
            path="/caisse"
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.ADMINISTRATEUR,
                  ROLES.RESPONSABLE,
                  ROLES.COMPTABLE_CAISSIER,
                ]}
              >
                <Caisse />
              </RoleRoute>
            }
          />
          <Route
            path="/rapports"
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.ADMINISTRATEUR,
                  ROLES.RESPONSABLE,
                  ROLES.COMPTABLE_CAISSIER,
                ]}
              >
                <Rapports />
              </RoleRoute>
            }
          />

          {/* Configuration & Administration */}
          <Route
            path="/types-prestations"
            element={
              <RoleRoute
                allowedRoles={[ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE]}
              >
                <TypesPrestations />
              </RoleRoute>
            }
          />
          <Route
            path="/categories-depenses"
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.ADMINISTRATEUR,
                  ROLES.RESPONSABLE,
                  ROLES.COMPTABLE_CAISSIER,
                ]}
              >
                <CategoriesDepenses />
              </RoleRoute>
            }
          />
          <Route
            path="/users"
            element={
              <RoleRoute allowedRoles={[ROLES.ADMINISTRATEUR]}>
                <Users />
              </RoleRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};
