import React, { useState } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes
} from "react-router-dom";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import CreateTicket from "./pages/CreateTicket";
import TicketDetails from "./pages/TicketDetails";
import UsersPage from "./pages/UsersPage";
import CategoriesPage from "./pages/CategoriesPage";
import ReportsPage from "./pages/ReportsPage";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

const getStoredUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("helpdesk_user") || "null"
    );
  } catch {
    return null;
  }
};

function ProtectedLayout({ user, logout }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        logout={logout}
      />

      <main className="main">
        <Topbar user={user} />

        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(
    getStoredUser
  );

  const login = (data) => {
    localStorage.setItem(
      "helpdesk_token",
      data.token
    );

    localStorage.setItem(
      "helpdesk_user",
      JSON.stringify(data.user)
    );

    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem(
      "helpdesk_token"
    );

    localStorage.removeItem(
      "helpdesk_user"
    );

    setUser(null);
  };

  return (
    <Routes>

      <Route
        path="/"
        element={
          <Landing user={user} />
        }
      />

      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <Auth
              mode="login"
              onAuth={login}
            />
          )
        }
      />

      <Route
        path="/register"
        element={
          user ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <Auth
              mode="register"
              onAuth={login}
            />
          )
        }
      />

      <Route
        element={
          <ProtectedLayout
            user={user}
            logout={logout}
          />
        }
      >

        <Route
          path="/dashboard"
          element={
            <Dashboard user={user} />
          }
        />

        <Route
          path="/tickets"
          element={
            <Tickets user={user} />
          }
        />

        <Route
          path="/tickets/new"
          element={
            <CreateTicket />
          }
        />

        <Route
          path="/tickets/:id"
          element={
            <TicketDetails user={user} />
          }
        />

        <Route
          path="/assigned-tickets"
          element={
            user?.role === "agent" ? (
              <Tickets
                user={user}
                assignedOnly={true}
              />
            ) : (
              <Navigate
                to="/dashboard"
                replace
              />
            )
          }
        />

        {user?.role === "admin" && (
          <>
            <Route
              path="/users"
              element={
                <UsersPage />
              }
            />

            <Route
              path="/categories"
              element={
                <CategoriesPage />
              }
            />

            <Route
              path="/reports"
              element={
                <ReportsPage />
              }
            />
          </>
        )}

      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;