import React, { useEffect, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  ListTodo,
  CircleDot,
  Clock3,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import api from "../api";
import { Stat, Bar, TicketRow, Empty } from "../components/TicketUI";

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    progress: 0,
    resolved: 0,
    urgent: 0
  });

  const [tickets, setTickets] = useState([]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get("/tickets/stats"),
      api.get("/tickets")
    ])
      .then(([s, t]) => {
        setStats(s.data);
        setTickets(t.data.tickets.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow dark">OVERVIEW</div>
          <h1>
            Good to see you, {user.name.split(" ")[0]} 👋
          </h1>
          <p>
            Here's what's happening with your support workspace today.
          </p>
        </div>

        {user.role === "customer" && (
          <Link
            to="/tickets/new"
            className="btn btn-primary"
          >
            <PlusCircle size={18} />
            New Ticket
          </Link>
        )}
      </div>

      <div className="stat-grid">
        <Stat
          title="Total tickets"
          value={stats.total}
          icon={ListTodo}
          meta="All tracked requests"
        />

        <Stat
          title="Open"
          value={stats.open}
          icon={CircleDot}
          meta="Waiting for action"
        />

        <Stat
          title="In progress"
          value={stats.progress}
          icon={Clock3}
          meta="Currently being worked"
        />

        <Stat
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          meta="Successfully closed"
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Recent tickets</h3>
              <p>Your latest support activity</p>
            </div>

            <Link to="/tickets" className="text-link">
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          {tickets.length ? (
            <div className="ticket-list">
              {tickets.map((t) => (
                <TicketRow key={t._id} t={t} />
              ))}
            </div>
          ) : (
            <Empty
              title="No tickets yet"
              text={
                user.role === "customer"
                  ? "Create your first ticket to get started."
                  : "Assigned tickets will appear here."
              }
            />
          )}
        </section>

        <section className="panel priority-panel">
          <div className="panel-head">
            <div>
              <h3>Priority pulse</h3>
              <p>Tickets that need attention</p>
            </div>
          </div>

          <div className="pulse">
            <div className="pulse-number">
              {stats.urgent}
            </div>

            <div>
              <b>Urgent tickets</b>
              <span>Need immediate attention</span>
            </div>
          </div>

          <div className="priority-bars">
            <Bar
              label="Open"
              value={stats.open}
              total={stats.total}
            />

            <Bar
              label="In Progress"
              value={stats.progress}
              total={stats.total}
            />

            <Bar
              label="Resolved"
              value={stats.resolved}
              total={stats.total}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;