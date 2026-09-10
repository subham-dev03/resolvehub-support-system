import React, { useEffect, useMemo, useState } from "react";
import { Trash2, ChevronDown } from "lucide-react";
import api from "../api";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "Agent@123"
  });
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const load = () =>
    api
      .get("/users")
      .then((r) => setUsers(r.data))
      .catch((e) =>
        setError(
          e.response?.data?.message ||
            "Could not load users"
        )
      );

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/users/agents", form);

      setForm({
        name: "",
        email: "",
        password: "Agent@123"
      });

      load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not create agent"
      );
    }
  };

  const toggle = async (id) => {
    try {
      await api.patch(`/users/${id}/toggle`);
      load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not update user"
      );
    }
  };

  const remove = async (id) => {
    if (confirm("Remove this user?")) {
      try {
        await api.delete(`/users/${id}`);
        load();
      } catch (e) {
        setError(
          e.response?.data?.message ||
            "Could not remove user"
        );
      }
    }
  };

  const filteredUsers = useMemo(() => {
    if (filter === "all") {
      return users;
    }

    return users.filter(
      (user) => user.role === filter
    );
  }, [users, filter]);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow dark">
            ADMIN
          </div>

          <h1>Users & Agents</h1>

          <p>
            Manage people who use the support workspace.
          </p>
        </div>
      </div>

      <div className="admin-grid">
        <form
          className="panel form-panel compact"
          onSubmit={add}
        >
          <h3>Add support agent</h3>

          <p>
            Create an agent account for the ticket queue.
          </p>

          <label>
            Name

            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
              placeholder="Amit Kumar"
            />
          </label>

          <label>
            Email

            <input
              required
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value
                })
              }
              placeholder="amit@company.com"
            />
          </label>

          <label>
            Temporary password

            <input
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value
                })
              }
            />
          </label>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <button
            className="btn btn-primary full"
            type="submit"
          >
            Create Agent
          </button>
        </form>

        <section className="panel users-panel">
          <div className="panel-head users-panel-head">
            <div>
              <h3>All users</h3>

              <p>
                {filteredUsers.length}{" "}
                {filteredUsers.length === 1
                  ? "account"
                  : "accounts"}
              </p>
            </div>

            <div className="user-filter">
              <ChevronDown size={16} />

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value)
                }
                aria-label="Filter users"
              >
                <option value="all">All</option>
                <option value="agent">Agent</option>
                <option value="customer">
                  Customer
                </option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="user-list">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <div
                  className="user-row"
                  key={u._id}
                >
                  <div className="avatar">
                    {u.name?.[0]?.toUpperCase()}
                  </div>

                  <div className="user-info">
                    <b>{u.name}</b>
                    <span>{u.email}</span>
                  </div>

                  <span
                    className={`role-chip ${u.role}`}
                  >
                    {u.role}
                  </span>

                  <span
                    className={
                      u.active
                        ? "active-text"
                        : "disabled-text"
                    }
                  >
                    {u.active
                      ? "Active"
                      : "Disabled"}
                  </span>

                  {u.role !== "admin" && (
                    <>
                      <button
                        type="button"
                        className="small-btn"
                        onClick={() =>
                          toggle(u._id)
                        }
                      >
                        {u.active
                          ? "Disable"
                          : "Enable"}
                      </button>

                      <button
                        type="button"
                        className="danger-icon"
                        onClick={() =>
                          remove(u._id)
                        }
                        aria-label={`Remove ${u.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-users">
                <span>
                  No {filter} users found.
                </span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default UsersPage;