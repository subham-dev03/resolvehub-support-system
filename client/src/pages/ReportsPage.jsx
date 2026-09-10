import React, { useEffect, useState } from "react";
import { ListTodo, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";
import api from "../api";
import { Stat, Bar } from "../components/TicketUI";

function ReportsPage() {
  const [s,setS] = useState({total:0,open:0,progress:0,resolved:0,closed:0,urgent:0});
  useEffect(()=>{api.get("/tickets/stats").then(r=>setS(r.data))},[]);
  const total=s.total||1;

  return (
    <div>
      <div className="page-head"><div><div className="eyebrow dark">ADMIN ANALYTICS</div><h1>Support reports</h1><p>A quick operational view of your current ticket workload.</p></div></div>
      <div className="stat-grid"><Stat title="Total tickets" value={s.total} icon={ListTodo} meta="All requests"/><Stat title="Urgent" value={s.urgent} icon={AlertTriangle} meta="Immediate attention"/><Stat title="Resolved" value={s.resolved} icon={CheckCircle2} meta="Resolved requests"/><Stat title="Resolution rate" value={`${Math.round(s.resolved/total*100)}%`} icon={BarChart3} meta="Resolved / total"/></div>
      <div className="report-grid"><section className="panel report-card"><h3>Ticket status mix</h3><div className="big-bars"><Bar label="Open" value={s.open} total={s.total}/><Bar label="In Progress" value={s.progress} total={s.total}/><Bar label="Resolved" value={s.resolved} total={s.total}/><Bar label="Closed" value={s.closed} total={s.total}/></div></section><section className="panel report-card"><h3>Workflow health</h3><div className="health"><div><b>{s.urgent}</b><span>Urgent tickets</span></div><div><b>{s.open}</b><span>Waiting for action</span></div><div><b>{s.progress}</b><span>Being handled</span></div></div></section></div>
    </div>
  );
}

export default ReportsPage;
