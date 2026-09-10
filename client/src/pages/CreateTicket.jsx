import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "../api";

function CreateTicket() {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", category: "", priority: "Medium" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/categories").then(r => {
      setCats(r.data);
      if (r.data[0]) setForm(f => ({ ...f, category: r.data[0]._id }));
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/tickets", form);
      navigate(`/tickets/${data._id}`);
    } catch (e) {
      setError(e.response?.data?.message || "Could not create ticket");
    }
  };

  return (
    <div>
      <div className="page-head"><div><div className="eyebrow dark">NEW REQUEST</div><h1>Create a support ticket</h1><p>Tell the support team what went wrong. Clear details help us resolve it faster.</p></div></div>
      <form className="panel form-panel" onSubmit={submit}>
        <div className="form-grid">
          <label>Issue title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Laptop is not charging"/></label>
          <label>Category<select required value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{cats.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select></label>
          <label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></label>
          <label className="wide">Describe the problem<textarea required rows="8" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What happened? What have you tried? Include useful details such as device, error messages, or order information."/></label>
        </div>
        {error&&<div className="error-box">{error}</div>}
        <div className="form-actions"><Link to="/tickets" className="btn btn-light-dark">Cancel</Link><button className="btn btn-primary">Submit Ticket <ArrowRight size={17}/></button></div>
      </form>
    </div>
  );
}

export default CreateTicket;
