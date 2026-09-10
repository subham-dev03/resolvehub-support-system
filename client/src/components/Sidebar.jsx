import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Ticket,
  LayoutDashboard,
  ListTodo,
  PlusCircle,
  Users,
  Tags,
  BarChart3,
  UserRoundCog,
  LogOut,
  Menu,
  X
} from "lucide-react";

export default function Sidebar({ user, logout }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const links = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard
    }
  ];

  if (user.role === "customer") {
    links.push({
      to: "/tickets",
      label: "My Tickets",
      icon: ListTodo
    });

    links.push({
      to: "/tickets/new",
      label: "Create Ticket",
      icon: PlusCircle
    });
  }

  if (user.role === "agent") {
    links.push({
      to: "/tickets",
      label: "Tickets",
      icon: ListTodo
    });

    links.push({
      to: "/assigned-tickets",
      label: "Assigned Tickets",
      icon: UserRoundCog
    });
  }

  if (user.role === "admin") {
    links.push({
      to: "/tickets",
      label: "Tickets",
      icon: ListTodo
    });

    links.push({
      to: "/users",
      label: "Users & Agents",
      icon: Users
    });

    links.push({
      to: "/categories",
      label: "Categories",
      icon: Tags
    });

    links.push({
      to: "/reports",
      label: "Reports",
      icon: BarChart3
    });
  }

  return (
    <>
      <button
        className="mobile-menu"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link
          to="/dashboard"
          className="brand side-brand"
          onClick={() => setOpen(false)}
        >
          <span className="brand-mark">
            <Ticket size={20} />
          </span>

          Resolve<span>Hub</span>
        </Link>

        <div className="side-role">
          <div className="avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div>
            <b>{user.name}</b>
            <small>{user.role}</small>
          </div>
        </div>

        <div className="side-label">
          WORKSPACE
        </div>

        <nav>
          {links.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  isActive(item.to)
                    ? "active"
                    : ""
                }
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button onClick={logout}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}