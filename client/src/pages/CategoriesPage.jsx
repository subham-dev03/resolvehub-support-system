import React, { useEffect, useState } from "react";
import { Tags, Trash2 } from "lucide-react";
import api from "../api";

function CategoriesPage() {
  const [cats,setCats] = useState([]);
  const [form,setForm] = useState({name:"",description:""});
  const load = () => api.get("/categories").then(r=>setCats(r.data));
  useEffect(()=>{load()},[]);
  const add = async e => { e.preventDefault(); await api.post("/categories",form); setForm({name:"",description:""}); load(); };
  const del = async id => { if(confirm("Delete category?")){ await api.delete(`/categories/${id}`); load(); } };

  return (
    <div>
      <div className="page-head"><div><div className="eyebrow dark">ADMIN</div><h1>Categories</h1><p>Organize incoming requests into clear support areas.</p></div></div>
      <div className="admin-grid">
        <form className="panel form-panel compact" onSubmit={add}><h3>New category</h3><label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Hardware"/></label><label>Description<textarea rows="4" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Short description"/></label><button className="btn btn-primary full">Add Category</button></form>
        <section className="panel"><div className="category-grid">{cats.map(c=><div className="category-card" key={c._id}><div className="feature-icon"><Tags size={18}/></div><div><h3>{c.name}</h3><p>{c.description||"No description"}</p></div><button className="danger-icon" onClick={()=>del(c._id)}><Trash2 size={16}/></button></div>)}</div></section>
      </div>
    </div>
  );
}

export default CategoriesPage;
