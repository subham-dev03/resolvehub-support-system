import React from "react";
import { ArrowRight, ListTodo } from "lucide-react";
import { Link } from "react-router-dom";

export function Stat({ title, value, icon: Icon, meta }) {
  return (
    <div className="stat-card">
      <div className="stat-icon"><Icon size={20} /></div>
      <small>{title}</small>
      <strong>{value}</strong>
      <span>{meta}</span>
    </div>
  );
}

export function Bar({ label, value, total }) {
  return (
    <div className="bar-row">
      <div><span>{label}</span><b>{value}</b></div>
      <div className="bar-track">
        <i style={{ width: `${total ? Math.min((value / total) * 100, 100) : 0}%` }} />
      </div>
    </div>
  );
}

export function TicketRow({ t }) {
  return (
    <Link className="ticket-row" to={`/tickets/${t._id}`}>
      <div className="ticket-id">#{t.ticketNumber}</div>
      <div className="ticket-main">
        <b>{t.title}</b>
        <span>{t.category?.name || "General"} · {new Date(t.updatedAt).toLocaleDateString()}</span>
      </div>
      <StatusBadge status={t.status} />
      <PriorityBadge priority={t.priority} />
      <ArrowRight size={16} className="row-arrow" />
    </Link>
  );
}

export function StatusBadge({ status }) {
  return <span className={`badge status ${status.toLowerCase().replace(" ", "-")}`}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  return <span className={`badge priority ${priority.toLowerCase()}`}>{priority}</span>;
}

export function Empty({ title, text }) {
  return (
    <div className="empty">
      <div className="empty-icon"><ListTodo size={23} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
