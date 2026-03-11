import { useState, useEffect, useRef } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const AGENTS = [
  { id:"a1", name:"Priya Sharma",  initials:"PS", online:true,  hue:"258" },
  { id:"a2", name:"Rohit Verma",   initials:"RV", online:true,  hue:"199" },
  { id:"a3", name:"Ananya Iyer",   initials:"AI", online:false, hue:"158" },
];
const PROPERTIES = [
  { id:"p1", name:"Koramangala",  full:"Gharpayy Koramangala", price:8500 },
  { id:"p2", name:"Indiranagar",  full:"Gharpayy Indiranagar", price:9200 },
  { id:"p3", name:"HSR Layout",   full:"Gharpayy HSR Layout",  price:7800 },
  { id:"p4", name:"BTM Layout",   full:"Gharpayy BTM Layout",  price:7200 },
];
const STAGES = [
  { id:"new",             label:"New Lead",          dot:"#818cf8" },
  { id:"contacted",       label:"Contacted",          dot:"#a78bfa" },
  { id:"requirement",     label:"Req. Collected",     dot:"#fb923c" },
  { id:"suggested",       label:"Suggested",          dot:"#38bdf8" },
  { id:"visit_scheduled", label:"Visit Scheduled",    dot:"#34d399" },
  { id:"visit_completed", label:"Visit Done",         dot:"#4ade80" },
  { id:"booked",          label:"Booked",             dot:"#22c55e" },
  { id:"lost",            label:"Lost",               dot:"#f87171" },
];
const SOURCES = ["Website Form","WhatsApp","Social Media","Phone Call","Lead Form","Manual"];

function genId() { return "GP"+Date.now().toString(36).slice(-4).toUpperCase()+Math.random().toString(36).slice(2,4).toUpperCase(); }
function ago(d) {
  const s = Math.floor((Date.now()-new Date(d))/1000);
  if(s<60) return "just now"; if(s<3600) return `${Math.floor(s/60)}m ago`;
  if(s<86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`;
}
function assignAgent(leads) {
  const online = AGENTS.filter(a=>a.online);
  const pool = online.length ? online : AGENTS;
  const c={}; pool.forEach(a=>c[a.id]=0);
  leads.forEach(l=>{ if(c[l.agentId]!==undefined) c[l.agentId]++; });
  return pool.sort((a,b)=>c[a.id]-c[b.id])[0].id;
}

const SEED = [
  { id:"GP001", name:"Arjun Mehta",    phone:"9876543210", email:"arjun@gmail.com",  source:"Website Form", stage:"visit_scheduled", agentId:"a1", budget:"8000–10000", area:"Koramangala", notes:"Single occ, vegetarian preferred", createdAt:new Date(Date.now()-3*864e5).toISOString(), lastActivity:new Date(Date.now()-864e5).toISOString(),   visits:[{property:"p1",date:new Date(Date.now()+2*864e5).toISOString().slice(0,10),time:"11:00",outcome:null}],   tl:[{a:"Lead captured · Website Form",t:new Date(Date.now()-3*864e5).toISOString()},{a:"Assigned → Priya Sharma",t:new Date(Date.now()-3*864e5).toISOString()},{a:"Called — interested, wants to visit",t:new Date(Date.now()-2*864e5).toISOString()},{a:"Visit booked · Koramangala",t:new Date(Date.now()-864e5).toISOString()}], reminder:false },
  { id:"GP002", name:"Sneha Patil",    phone:"9123456789", email:"sneha@outlook.com",source:"WhatsApp",      stage:"requirement",     agentId:"a2", budget:"7000–9000",  area:"Indiranagar",  notes:"", createdAt:new Date(Date.now()-864e5).toISOString(),   lastActivity:new Date(Date.now()-6*36e5).toISOString(),  visits:[], tl:[{a:"Lead captured · WhatsApp",t:new Date(Date.now()-864e5).toISOString()},{a:"Assigned → Rohit Verma",t:new Date(Date.now()-864e5).toISOString()}], reminder:false },
  { id:"GP003", name:"Kavya Reddy",    phone:"9988776655", email:"",                 source:"Lead Form",     stage:"new",             agentId:"a3", budget:"6000–8000",  area:"HSR Layout",   notes:"", createdAt:new Date().toISOString(), lastActivity:new Date().toISOString(), visits:[], tl:[{a:"Lead captured · Lead Form",t:new Date().toISOString()},{a:"Assigned → Ananya Iyer",t:new Date().toISOString()}], reminder:false },
  { id:"GP004", name:"Rahul Nair",     phone:"9001122334", email:"rahul@gmail.com",  source:"Social Media",  stage:"booked",          agentId:"a1", budget:"9000–12000", area:"Indiranagar",  notes:"Confirmed — unit 4B Indiranagar", createdAt:new Date(Date.now()-10*864e5).toISOString(), lastActivity:new Date(Date.now()-2*864e5).toISOString(), visits:[{property:"p2",date:new Date(Date.now()-3*864e5).toISOString().slice(0,10),time:"14:00",outcome:"positive"}], tl:[{a:"Lead captured · Social Media",t:new Date(Date.now()-10*864e5).toISOString()},{a:"Requirements collected",t:new Date(Date.now()-8*864e5).toISOString()},{a:"Visit completed — positive",t:new Date(Date.now()-3*864e5).toISOString()},{a:"🎉 Booking confirmed",t:new Date(Date.now()-2*864e5).toISOString()}], reminder:false },
  { id:"GP005", name:"Divya Krishnan", phone:"9771234567", email:"divya@yahoo.com",  source:"Phone Call",    stage:"lost",            agentId:"a2", budget:"5000–7000",  area:"BTM Layout",   notes:"Found accommodation elsewhere", createdAt:new Date(Date.now()-7*864e5).toISOString(), lastActivity:new Date(Date.now()-4*864e5).toISOString(), visits:[], tl:[{a:"Lead captured · Phone Call",t:new Date(Date.now()-7*864e5).toISOString()},{a:"No suitable match found",t:new Date(Date.now()-5*864e5).toISOString()},{a:"Marked as Lost",t:new Date(Date.now()-4*864e5).toISOString()}], reminder:false },
  { id:"GP006", name:"Vikram Singh",   phone:"9845612378", email:"vikram@gmail.com", source:"Website Form",  stage:"contacted",       agentId:"a2", budget:"8000–10000", area:"Koramangala",  notes:"", createdAt:new Date(Date.now()-2*864e5).toISOString(), lastActivity:new Date(Date.now()-25*36e5).toISOString(), visits:[], tl:[{a:"Lead captured · Website Form",t:new Date(Date.now()-2*864e5).toISOString()},{a:"Initial call done",t:new Date(Date.now()-25*36e5).toISOString()}], reminder:false },
];

// ── Icon component ────────────────────────────────────────────────────────────
const IC = {
  grid:"M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  users:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  kanban:"M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
  cal:"M8 7V3M16 7V3M3 11h18M5 5h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z",
  bar:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  plus:"M12 5v14M5 12h14",
  search:"M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z",
  bell:"M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  x:"M18 6L6 18M6 6l12 12",
  check:"M20 6L9 17l-5-5",
  phone:"M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 6.18 19.79 19.79 0 01.07 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.85 6.85l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  mail:"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  clock:"M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2",
  chevR:"M9 18l6-6-6-6",
  chevL:"M15 18l-6-6 6-6",
  edit:"M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  home:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  trend:"M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  star:"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  logout:"M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  filter:"M22 3H2l8 9.46V19l4 2v-8.54L22 3",
};

function Svg({ ic, size=16, style={} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {IC[ic]?.split("M").filter(Boolean).map((d,i)=><path key={i} d={"M"+d}/>)}
    </svg>
  );
}

// ── Stage pill ────────────────────────────────────────────────────────────────
function Pill({ stageId, tiny }) {
  const s = STAGES.find(x=>x.id===stageId);
  if(!s) return null;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding: tiny ? "2px 8px" : "3px 10px",
      borderRadius:20, fontSize: tiny?10:11, fontWeight:600,
      background: s.dot+"18", color: s.dot,
      border:`1px solid ${s.dot}35`, whiteSpace:"nowrap",
      letterSpacing:"0.01em"
    }}>
      <span style={{width:5,height:5,borderRadius:"50%",background:s.dot,flexShrink:0}}/>
      {s.label}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Av({ name, hue="258", size=32, showRing }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:size*0.32,
      background:`hsl(${hue},70%,94%)`,
      border: showRing ? `2px solid hsl(${hue},70%,70%)` : `1.5px solid hsl(${hue},50%,88%)`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*0.36, fontWeight:700,
      color:`hsl(${hue},60%,42%)`, flexShrink:0,
      fontFamily:"'Instrument Sans',sans-serif",
      boxShadow: showRing ? `0 0 0 3px hsl(${hue},70%,90%)` : "none"
    }}>
      {name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function GharpayyCRM() {
  const [leads, setLeads] = useState(SEED);
  const [view, setView] = useState("dashboard");
  const [sel, setSel] = useState(null);
  const [newLead, setNewLead] = useState(false);
  const [visitFor, setVisitFor] = useState(null);
  const [q, setQ] = useState("");
  const [fStage, setFStage] = useState("all");
  const [fAgent, setFAgent] = useState("all");
  const [toast, setToast] = useState(null);

  useEffect(()=>{
    const t = setInterval(()=>{
      setLeads(p=>p.map(l=>{
        if(["booked","lost"].includes(l.stage)) return l;
        return (Date.now()-new Date(l.lastActivity))/864e5>=1 && !l.reminder ? {...l,reminder:true} : l;
      }));
    },15000);
    return ()=>clearInterval(t);
  },[]);

  const notify = (msg,type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const addLead = data => {
    const agentId = assignAgent(leads);
    const agent = AGENTS.find(a=>a.id===agentId);
    setLeads(p=>[{ id:genId(), ...data, stage:"new", agentId, createdAt:new Date().toISOString(), lastActivity:new Date().toISOString(), visits:[], tl:[{a:`Lead captured · ${data.source}`,t:new Date().toISOString()},{a:`Assigned → ${agent.name}`,t:new Date().toISOString()}], reminder:false },...p]);
    notify(`Assigned to ${agent.name}`);
    setNewLead(false);
  };

  const moveStage = (id,stage) => {
    const s = STAGES.find(x=>x.id===stage);
    setLeads(p=>p.map(l=>l.id!==id?l:{...l,stage,lastActivity:new Date().toISOString(),reminder:false,tl:[...l.tl,{a:`Stage → ${s.label}`,t:new Date().toISOString()}]}));
    notify(`Moved to ${s.label}`);
  };

  const saveNote = (id,notes) => setLeads(p=>p.map(l=>l.id!==id?l:{...l,notes,lastActivity:new Date().toISOString(),reminder:false,tl:[...l.tl,{a:"Note updated",t:new Date().toISOString()}]}));

  const scheduleVisit = (id,v) => {
    const prop = PROPERTIES.find(p=>p.id===v.property);
    setLeads(p=>p.map(l=>l.id!==id?l:{...l,stage:"visit_scheduled",lastActivity:new Date().toISOString(),reminder:false,visits:[...l.visits,{...v,outcome:null}],tl:[...l.tl,{a:`Visit booked · ${prop.name} · ${v.date}`,t:new Date().toISOString()}]}));
    notify("Visit scheduled!"); setVisitFor(null);
  };

  const markOutcome = (id,vi,outcome) => {
    setLeads(p=>p.map(l=>{ if(l.id!==id)return l; const visits=l.visits.map((v,i)=>i===vi?{...v,outcome}:v); return {...l,visits,stage:outcome==="positive"?"visit_completed":l.stage,lastActivity:new Date().toISOString(),reminder:false,tl:[...l.tl,{a:`Visit outcome · ${outcome==="positive"?"Positive ✓":"Follow-up"}`,t:new Date().toISOString()}]}; }));
  };

  const dismiss = id => setLeads(p=>p.map(l=>l.id!==id?l:{...l,reminder:false,lastActivity:new Date().toISOString()}));

  const reminders = leads.filter(l=>l.reminder&&!["booked","lost"].includes(l.stage));
  const filtered = leads.filter(l=>{
    const sq=q.toLowerCase();
    return (!sq||l.name.toLowerCase().includes(sq)||l.phone.includes(sq)||l.id.toLowerCase().includes(sq))
      &&(fStage==="all"||l.stage===fStage)&&(fAgent==="all"||l.agentId===fAgent);
  });

  const stats = {
    total:leads.length,
    active:leads.filter(l=>!["booked","lost"].includes(l.stage)).length,
    booked:leads.filter(l=>l.stage==="booked").length,
    visits:leads.filter(l=>["visit_scheduled","visit_completed"].includes(l.stage)).length,
    conv:leads.length?Math.round(leads.filter(l=>l.stage==="booked").length/leads.length*100):0,
  };

  const nav = [
    {id:"dashboard",ic:"grid",label:"Overview"},
    {id:"leads",ic:"users",label:"Leads"},
    {id:"pipeline",ic:"kanban",label:"Pipeline"},
    {id:"visits",ic:"cal",label:"Visits"},
    {id:"agents",ic:"bar",label:"Agents"},
  ];

  return (
    <div style={{display:"flex",height:"100vh",background:"#fafaf9",fontFamily:"'Plus Jakarta Sans','DM Sans',system-ui,sans-serif",overflow:"hidden",color:"#1c1917"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Sans:wght@600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#d6d3d1;border-radius:2px}
        input,select,textarea,button{font-family:inherit;}
        .nav-btn{display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:9px;border:none;background:none;width:100%;font-size:13px;font-weight:500;color:#78716c;transition:all 0.12s;cursor:pointer;text-align:left;}
        .nav-btn:hover{background:#f5f5f4;color:#1c1917;}
        .nav-btn.on{background:#fff;color:#1c1917;font-weight:600;box-shadow:0 1px 4px #00000012,0 0 0 1px #e7e5e4;}
        .btn{padding:8px 16px;border-radius:8px;border:none;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all 0.12s;}
        .btn-dark{background:#1c1917;color:#fafaf9;}
        .btn-dark:hover{background:#292524;}
        .btn-sm{padding:5px 12px;font-size:12px;}
        .btn-out{background:#fff;border:1px solid #e7e5e4;color:#44403c;}
        .btn-out:hover{background:#fafaf9;border-color:#d6d3d1;}
        .btn-ghost{background:none;border:none;color:#a8a29e;padding:5px 8px;font-size:12px;cursor:pointer;}
        .btn-ghost:hover{color:#1c1917;}
        .inp{background:#fff;border:1px solid #e7e5e4;border-radius:8px;padding:8px 12px;color:#1c1917;font-size:13px;width:100%;transition:border-color 0.15s,box-shadow 0.15s;}
        .inp:focus{outline:none;border-color:#a78bfa;box-shadow:0 0 0 3px #a78bfa20;}
        .lbl{font-size:11.5px;font-weight:600;color:#78716c;display:block;margin-bottom:5px;letter-spacing:0.02em;}
        .card{background:#fff;border:1px solid #e7e5e4;border-radius:14px;}
        .card-hover{transition:box-shadow 0.15s,border-color 0.15s;}
        .card-hover:hover{box-shadow:0 4px 20px #00000010;border-color:#d6d3d1;}
        .row{cursor:pointer;transition:background 0.1s;}
        .row:hover{background:#fafaf9;}
        .modal-bg{position:fixed;inset:0;background:#1c191780;display:flex;align-items:center;justify-content:center;z-index:200;padding:20px;backdrop-filter:blur(4px);}
        .modal{background:#fff;border:1px solid #e7e5e4;border-radius:18px;padding:28px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 80px #00000020;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp 0.22s ease}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        .si{animation:slideIn 0.2s ease}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .pulse{animation:pulse 2s infinite}
        .tag{display:inline-flex;align-items:center;font-size:11px;font-weight:600;padding:2px 9px;border-radius:6px;}
        .divider{height:1px;background:#f5f5f4;}
      `}</style>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside style={{width:220,background:"#fff",borderRight:"1px solid #f5f5f4",display:"flex",flexDirection:"column",padding:"0 12px",flexShrink:0}}>
        {/* Logo */}
        <div style={{padding:"20px 6px 18px",borderBottom:"1px solid #f5f5f4",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#7c3aed,#a78bfa)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Svg ic="home" size={15} style={{stroke:"#fff"}}/>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:"#1c1917",letterSpacing:"-0.03em",fontFamily:"'Instrument Sans',sans-serif"}}>Gharpayy</div>
              <div style={{fontSize:10,color:"#a8a29e",fontWeight:500,letterSpacing:"0.05em",textTransform:"uppercase"}}>CRM</div>
            </div>
          </div>
        </div>

        <nav style={{flex:1,display:"flex",flexDirection:"column",gap:2,paddingTop:4}}>
          {nav.map(n=>(
            <button key={n.id} className={`nav-btn${view===n.id?" on":""}`} onClick={()=>setView(n.id)}>
              <Svg ic={n.ic} size={15}/>
              {n.label}
              {n.id==="leads"&&reminders.length>0&&(
                <span style={{marginLeft:"auto",background:"#fef3c7",color:"#d97706",borderRadius:10,fontSize:10,fontWeight:700,padding:"1px 7px"}}>{reminders.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Agent card */}
        <div style={{borderTop:"1px solid #f5f5f4",padding:"14px 4px",display:"flex",alignItems:"center",gap:10}}>
          <Av name="Admin User" hue="258" size={30} showRing/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,color:"#1c1917"}}>Admin</div>
            <div style={{fontSize:10,color:"#a8a29e"}}>Manager</div>
          </div>
          <button className="btn-ghost"><Svg ic="logout" size={13}/></button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Topbar */}
        <header style={{background:"#fff",borderBottom:"1px solid #f5f5f4",padding:"0 24px",height:54,display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:15,fontWeight:700,color:"#1c1917",letterSpacing:"-0.01em"}}>
              {nav.find(n=>n.id===view)?.label}
            </span>
            {view==="leads"&&<span style={{fontSize:12,color:"#a8a29e",background:"#f5f5f4",borderRadius:6,padding:"2px 8px",fontWeight:600}}>{filtered.length}</span>}
          </div>
          {reminders.length>0&&(
            <button className="btn btn-out btn-sm" style={{color:"#d97706",borderColor:"#fde68a",background:"#fffbeb",gap:6}} onClick={()=>setView("leads")}>
              <Svg ic="bell" size={13}/>{reminders.length} follow-up{reminders.length>1?"s":""}
            </button>
          )}
          <button className="btn btn-dark btn-sm" onClick={()=>setNewLead(true)}>
            <Svg ic="plus" size={13}/>New Lead
          </button>
        </header>

        {/* Page */}
        <main style={{flex:1,overflow:"auto",padding:22}} className="fu">
          {view==="dashboard" && <Dashboard stats={stats} leads={leads} setView={setView} setSel={setSel} reminders={reminders} dismiss={dismiss}/>}
          {view==="leads"     && <LeadsView leads={filtered} q={q} setQ={setQ} fStage={fStage} setFStage={setFStage} fAgent={fAgent} setFAgent={setFAgent} onSel={setSel} reminders={reminders} dismiss={dismiss} moveStage={moveStage}/>}
          {view==="pipeline"  && <Pipeline leads={leads} onSel={setSel} moveStage={moveStage}/>}
          {view==="visits"    && <Visits leads={leads} onSel={setSel} onSchedule={setVisitFor} markOutcome={markOutcome}/>}
          {view==="agents"    && <AgentsView leads={leads}/>}
        </main>
      </div>

      {/* ── Detail Drawer ─────────────────────────────────────────────────── */}
      {sel&&<Drawer lead={leads.find(l=>l.id===sel.id)||sel} onClose={()=>setSel(null)} moveStage={moveStage} onVisit={()=>setVisitFor(sel.id)} saveNote={saveNote} markOutcome={markOutcome}/>}

      {newLead&&<NewLeadModal onClose={()=>setNewLead(false)} onSubmit={addLead}/>}
      {visitFor&&<VisitModal lead={leads.find(l=>l.id===visitFor)} onClose={()=>setVisitFor(null)} onSubmit={d=>scheduleVisit(visitFor,d)}/>}

      {/* Toast */}
      {toast&&(
        <div className="si" style={{position:"fixed",bottom:22,right:22,background:toast.type==="ok"?"#f0fdf4":"#fef2f2",border:`1px solid ${toast.type==="ok"?"#bbf7d0":"#fecaca"}`,borderRadius:10,padding:"10px 18px",color:toast.type==="ok"?"#16a34a":"#ef4444",fontSize:13,fontWeight:600,zIndex:300,boxShadow:"0 8px 30px #00000015",display:"flex",alignItems:"center",gap:8}}>
          <Svg ic={toast.type==="ok"?"check":"bell"} size={14}/>{toast.msg}
        </div>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({stats,leads,setView,setSel,reminders,dismiss}) {
  const recent = [...leads].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {/* Reminder alerts */}
      {reminders.length>0&&(
        <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:"14px 18px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <Svg ic="bell" size={14} style={{stroke:"#d97706"}}/>
            <span style={{fontSize:13,fontWeight:700,color:"#92400e"}}>{reminders.length} lead{reminders.length>1?"s":""} need follow-up</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {reminders.slice(0,3).map(l=>(
              <div key={l.id} style={{display:"flex",alignItems:"center",gap:12,background:"#fff",borderRadius:8,padding:"9px 14px",border:"1px solid #fde68a"}}>
                <Av name={l.name} hue="40" size={28}/>
                <div style={{flex:1}}>
                  <span style={{fontSize:13,fontWeight:600,color:"#1c1917"}}>{l.name}</span>
                  <span style={{color:"#a8a29e",fontSize:12}}> · {ago(l.lastActivity)} inactive</span>
                </div>
                <Pill stageId={l.stage} tiny/>
                <button className="btn btn-dark btn-sm" onClick={()=>{setSel(l);dismiss(l.id);}}>Follow up</button>
                <button className="btn-ghost" onClick={()=>dismiss(l.id)}><Svg ic="x" size={13}/></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {label:"Total Leads",   val:stats.total,  sub:"All time",                ic:"users",  hue:"258"},
          {label:"Active",        val:stats.active, sub:"In pipeline",             ic:"trend",  hue:"199"},
          {label:"Bookings",      val:stats.booked, sub:`${stats.conv}% conv. rate`,ic:"star",  hue:"158"},
          {label:"Visits",        val:stats.visits, sub:"Scheduled & done",        ic:"cal",    hue:"35"},
        ].map(s=>(
          <div key={s.label} className="card card-hover" style={{padding:"20px 22px",cursor:"pointer"}} onClick={()=>setView("leads")}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
              <span style={{fontSize:12,fontWeight:500,color:"#78716c"}}>{s.label}</span>
              <div style={{width:34,height:34,borderRadius:9,background:`hsl(${s.hue},80%,95%)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Svg ic={s.ic} size={15} style={{stroke:`hsl(${s.hue},65%,45%)`}}/>
              </div>
            </div>
            <div style={{fontSize:32,fontWeight:800,color:"#1c1917",lineHeight:1,letterSpacing:"-0.03em",fontFamily:"'Instrument Sans',sans-serif"}}>{s.val}</div>
            <div style={{fontSize:11,color:"#a8a29e",marginTop:5,fontWeight:500}}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:14}}>
        {/* Pipeline bars */}
        <div className="card" style={{padding:22}}>
          <div style={{fontSize:13,fontWeight:700,color:"#1c1917",marginBottom:18,letterSpacing:"-0.01em"}}>Pipeline Overview</div>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {STAGES.map(s=>{
              const cnt=leads.filter(l=>l.stage===s.id).length;
              const pct=stats.total?cnt/stats.total*100:0;
              return (
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:7,height:7,borderRadius:2,background:s.dot,flexShrink:0}}/>
                  <span style={{fontSize:12,color:"#78716c",width:134,flexShrink:0}}>{s.label}</span>
                  <div style={{flex:1,height:6,background:"#f5f5f4",borderRadius:4,overflow:"hidden"}}>
                    <div style={{width:`${pct}%`,height:"100%",background:s.dot,borderRadius:4,transition:"width 0.5s ease"}}/>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,color:"#1c1917",width:18,textAlign:"right"}}>{cnt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent leads */}
        <div className="card" style={{padding:22}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:"#1c1917",letterSpacing:"-0.01em"}}>Recent Leads</div>
            <button className="btn-ghost" style={{fontSize:12,color:"#7c3aed",fontWeight:600}} onClick={()=>setView("leads")}>View all →</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:2}}>
            {recent.map(l=>{
              const ag=AGENTS.find(a=>a.id===l.agentId);
              return (
                <div key={l.id} className="row" style={{display:"flex",alignItems:"center",gap:10,padding:"8px",borderRadius:9}} onClick={()=>setSel(l)}>
                  <Av name={l.name} hue={ag?.hue||"258"} size={30}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#1c1917",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.name}</div>
                    <div style={{fontSize:11,color:"#a8a29e"}}>{l.source} · {ago(l.createdAt)}</div>
                  </div>
                  <Pill stageId={l.stage} tiny/>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Source pills */}
      <div className="card" style={{padding:22}}>
        <div style={{fontSize:13,fontWeight:700,color:"#1c1917",marginBottom:16,letterSpacing:"-0.01em"}}>Lead Sources</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {SOURCES.map(src=>{
            const cnt=leads.filter(l=>l.source===src).length;
            if(!cnt) return null;
            return (
              <div key={src} style={{background:"#fafaf9",border:"1px solid #e7e5e4",borderRadius:12,padding:"14px 20px",textAlign:"center",minWidth:110}}>
                <div style={{fontSize:26,fontWeight:800,color:"#1c1917",letterSpacing:"-0.03em",fontFamily:"'Instrument Sans',sans-serif"}}>{cnt}</div>
                <div style={{fontSize:11,color:"#a8a29e",marginTop:3,fontWeight:500}}>{src}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Leads View ────────────────────────────────────────────────────────────────
function LeadsView({leads,q,setQ,fStage,setFStage,fAgent,setFAgent,onSel,reminders,dismiss,moveStage}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {reminders.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {reminders.map(l=>(
            <div key={l.id} style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:12}}>
              <Svg ic="clock" size={14} style={{stroke:"#d97706",flexShrink:0}}/>
              <span style={{fontSize:13,fontWeight:600,color:"#92400e"}}>Follow-up:</span>
              <span style={{fontSize:13,color:"#44403c"}}>{l.name} · {ago(l.lastActivity)} inactive</span>
              <Pill stageId={l.stage} tiny/>
              <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                <button className="btn btn-dark btn-sm" onClick={()=>{onSel(l);dismiss(l.id);}}>Open</button>
                <button className="btn-ghost" onClick={()=>dismiss(l.id)}><Svg ic="x" size={13}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <div style={{position:"relative",flex:1,maxWidth:300}}>
          <div style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#a8a29e"}}><Svg ic="search" size={14}/></div>
          <input className="inp" style={{paddingLeft:34}} placeholder="Search name, phone, ID…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <select className="inp" style={{width:"auto"}} value={fStage} onChange={e=>setFStage(e.target.value)}>
          <option value="all">All Stages</option>
          {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select className="inp" style={{width:"auto"}} value={fAgent} onChange={e=>setFAgent(e.target.value)}>
          <option value="all">All Agents</option>
          {AGENTS.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"minmax(150px,1fr) 120px 120px 160px 130px 80px",gap:12,padding:"10px 18px",background:"#fafaf9",borderBottom:"1px solid #f5f5f4"}}>
          {["Lead","Phone","Source","Stage","Agent","Activity"].map(h=>(
            <span key={h} style={{fontSize:11,fontWeight:700,color:"#a8a29e",textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</span>
          ))}
        </div>
        <div style={{overflowY:"auto",maxHeight:"calc(100vh - 310px)"}}>
          {leads.length===0&&<div style={{padding:48,textAlign:"center",color:"#d6d3d1",fontSize:14}}>No leads match your filters.</div>}
          {leads.map((l,i)=>{
            const ag=AGENTS.find(a=>a.id===l.agentId);
            return (
              <div key={l.id} className="row" onClick={()=>onSel(l)} style={{display:"grid",gridTemplateColumns:"minmax(150px,1fr) 120px 120px 160px 130px 80px",gap:12,padding:"12px 18px",borderBottom:"1px solid #f5f5f4",borderLeft:`3px solid ${l.reminder?"#fbbf24":"transparent"}`}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"#1c1917"}}>{l.name}</div>
                  <div style={{fontSize:10,color:"#d6d3d1",marginTop:1,fontFamily:"monospace",letterSpacing:"0.03em"}}>{l.id}</div>
                </div>
                <div style={{fontSize:13,color:"#44403c",display:"flex",alignItems:"center"}}>{l.phone}</div>
                <div style={{fontSize:12,color:"#78716c",display:"flex",alignItems:"center"}}>{l.source}</div>
                <div style={{display:"flex",alignItems:"center"}}><Pill stageId={l.stage}/></div>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <Av name={ag?.name} hue={ag?.hue||"258"} size={22}/>
                  <span style={{fontSize:12,color:"#44403c"}}>{ag?.name.split(" ")[0]}</span>
                </div>
                <div style={{fontSize:11,color:l.reminder?"#d97706":"#a8a29e",display:"flex",alignItems:"center",fontWeight:l.reminder?700:400}}>
                  {l.reminder&&"⚠ "}{ago(l.lastActivity)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Pipeline ──────────────────────────────────────────────────────────────────
function Pipeline({leads,onSel,moveStage}) {
  return (
    <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:12,height:"calc(100vh - 140px)",alignItems:"flex-start"}}>
      {STAGES.map(stage=>{
        const sl=leads.filter(l=>l.stage===stage.id);
        return (
          <div key={stage.id} style={{minWidth:205,maxWidth:205,background:"#fafaf9",border:"1px solid #e7e5e4",borderRadius:13,padding:"13px 11px",display:"flex",flexDirection:"column",gap:8,maxHeight:"100%",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:7,paddingBottom:9,borderBottom:"1px solid #f0f0ef",flexShrink:0}}>
              <div style={{width:8,height:8,borderRadius:2,background:stage.dot}}/>
              <span style={{fontSize:12,fontWeight:700,color:"#44403c",flex:1}}>{stage.label}</span>
              <span style={{background:stage.dot+"20",color:stage.dot,borderRadius:8,fontSize:10,fontWeight:700,padding:"2px 8px"}}>{sl.length}</span>
            </div>
            <div style={{overflowY:"auto",display:"flex",flexDirection:"column",gap:7}}>
              {sl.map(l=>{
                const ag=AGENTS.find(a=>a.id===l.agentId);
                const si=STAGES.findIndex(s=>s.id===l.stage);
                return (
                  <div key={l.id} onClick={()=>onSel(l)} className="card card-hover" style={{padding:"12px 13px",cursor:"pointer",borderRadius:10}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#1c1917",marginBottom:4}}>{l.name}</div>
                    <div style={{fontSize:11,color:"#a8a29e",marginBottom:10}}>{l.source} · {ago(l.lastActivity)}</div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <Av name={ag?.name} hue={ag?.hue||"258"} size={18}/>
                        <span style={{fontSize:11,color:"#78716c"}}>{ag?.name.split(" ")[0]}</span>
                      </div>
                      <div style={{display:"flex",gap:4}} onClick={e=>e.stopPropagation()}>
                        {si>0&&<button className="btn btn-out" style={{padding:"2px 7px",fontSize:11,borderRadius:5}} onClick={()=>moveStage(l.id,STAGES[si-1].id)}><Svg ic="chevL" size={11}/></button>}
                        {si<STAGES.length-1&&<button className="btn btn-dark" style={{padding:"2px 7px",fontSize:11,borderRadius:5}} onClick={()=>moveStage(l.id,STAGES[si+1].id)}><Svg ic="chevR" size={11}/></button>}
                      </div>
                    </div>
                    {l.reminder&&<div style={{marginTop:7,fontSize:10,color:"#d97706",fontWeight:700,display:"flex",alignItems:"center",gap:4}}><Svg ic="clock" size={10}/>Follow-up needed</div>}
                  </div>
                );
              })}
              {sl.length===0&&<div style={{fontSize:12,color:"#d6d3d1",textAlign:"center",padding:"18px 0"}}>Empty</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Visits ────────────────────────────────────────────────────────────────────
function Visits({leads,onSel,onSchedule,markOutcome}) {
  const all=leads.flatMap(l=>l.visits.map((v,i)=>({...v,lead:l,vi:i})));
  const today=new Date().toDateString();
  const upcoming=all.filter(v=>new Date(v.date)>=new Date(today));
  const past=all.filter(v=>new Date(v.date)<new Date(today));

  const VCard=({v})=>{
    const prop=PROPERTIES.find(p=>p.id===v.property);
    return (
      <div className="card card-hover" style={{padding:"15px 17px",borderRadius:11}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:7}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"#1c1917"}}>{v.lead.name}</div>
            <div style={{fontSize:12,color:"#78716c",marginTop:2}}>{prop?.full||v.property}</div>
          </div>
          {v.outcome==="positive"&&<span className="tag" style={{background:"#dcfce7",color:"#16a34a"}}>✓ Positive</span>}
          {v.outcome==="followup"&&<span className="tag" style={{background:"#fef3c7",color:"#d97706"}}>→ Follow-up</span>}
          {!v.outcome&&<span className="tag" style={{background:"#ede9fe",color:"#7c3aed"}}>Scheduled</span>}
        </div>
        <div style={{fontSize:11,color:"#a8a29e",marginBottom:v.outcome?0:10}}>{v.date} at {v.time} · ₹{prop?.price?.toLocaleString()}/mo</div>
        {!v.outcome&&(
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-out btn-sm" style={{color:"#16a34a",borderColor:"#bbf7d0",fontSize:12}} onClick={()=>markOutcome(v.lead.id,v.vi,"positive")}>✓ Positive</button>
            <button className="btn btn-out btn-sm" style={{fontSize:12}} onClick={()=>markOutcome(v.lead.id,v.vi,"followup")}>Follow-up</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"start"}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:"#1c1917",marginBottom:12}}>Upcoming <span style={{color:"#a8a29e",fontWeight:400}}>({upcoming.length})</span></div>
          {upcoming.length===0?<div className="card" style={{padding:32,textAlign:"center",color:"#d6d3d1",fontSize:13}}>No upcoming visits</div>
            :<div style={{display:"flex",flexDirection:"column",gap:9}}>{upcoming.map((v,i)=><VCard key={i} v={v}/>)}</div>}
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:"#1c1917",marginBottom:12}}>Completed <span style={{color:"#a8a29e",fontWeight:400}}>({past.length})</span></div>
          {past.length===0?<div className="card" style={{padding:32,textAlign:"center",color:"#d6d3d1",fontSize:13}}>No past visits</div>
            :<div style={{display:"flex",flexDirection:"column",gap:9}}>{past.map((v,i)=><VCard key={i} v={v}/>)}</div>}
        </div>
      </div>
      <div className="card" style={{padding:20}}>
        <div style={{fontSize:13,fontWeight:700,color:"#1c1917",marginBottom:12}}>Quick Schedule</div>
        <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
          {leads.filter(l=>!["booked","lost"].includes(l.stage)).slice(0,8).map(l=>(
            <button key={l.id} className="btn btn-out btn-sm" style={{fontSize:12}} onClick={()=>onSchedule(l.id)}>
              <Svg ic="cal" size={12}/>{l.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Agents ────────────────────────────────────────────────────────────────────
function AgentsView({leads}) {
  const rows=AGENTS.map(a=>{
    const al=leads.filter(l=>l.agentId===a.id);
    return{...a,total:al.length,active:al.filter(l=>!["booked","lost"].includes(l.stage)).length,booked:al.filter(l=>l.stage==="booked").length,conv:al.length?Math.round(al.filter(l=>l.stage==="booked").length/al.length*100):0,leads:al};
  }).sort((a,b)=>b.booked-a.booked);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div className="card" style={{overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid #f5f5f4",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:13,fontWeight:700,color:"#1c1917"}}>Leaderboard</span>
          <span style={{fontSize:11,color:"#a8a29e",fontWeight:500}}>sorted by bookings</span>
        </div>
        {rows.map((a,i)=>(
          <div key={a.id} style={{display:"flex",alignItems:"center",gap:16,padding:"16px 20px",borderBottom:i<rows.length-1?"1px solid #f5f5f4":"none"}}>
            <div style={{width:26,height:26,borderRadius:8,background:i===0?"#fef3c7":i===1?"#f3f4f6":"#fef9ec",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:i===0?"#d97706":i===1?"#78716c":"#b45309",flexShrink:0}}>
              {i+1}
            </div>
            <Av name={a.name} hue={a.hue} size={38} showRing/>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:"#1c1917"}}>{a.name}</div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:a.online?"#22c55e":"#d6d3d1"}}/>
                <span style={{fontSize:11,color:a.online?"#16a34a":"#a8a29e"}}>{a.online?"Online":"Offline"}</span>
              </div>
            </div>
            {[{l:"Leads",v:a.total,h:"258"},{l:"Active",v:a.active,h:"199"},{l:"Booked",v:a.booked,h:"158"},{l:"Conv.",v:`${a.conv}%`,h:"40"}].map(m=>(
              <div key={m.l} style={{textAlign:"center",minWidth:60}}>
                <div style={{fontSize:22,fontWeight:800,color:`hsl(${m.h},60%,42%)`,letterSpacing:"-0.03em",fontFamily:"'Instrument Sans',sans-serif"}}>{m.v}</div>
                <div style={{fontSize:10,color:"#a8a29e",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>{m.l}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {rows.map(a=>(
          <div key={a.id} className="card" style={{padding:18}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <Av name={a.name} hue={a.hue} size={32}/>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"#1c1917"}}>{a.name}</div>
                <div style={{fontSize:11,color:"#a8a29e"}}>{a.total} leads</div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {STAGES.map(s=>{
                const cnt=a.leads.filter(l=>l.stage===s.id).length;
                if(!cnt) return null;
                return (
                  <div key={s.id} style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:7,height:7,borderRadius:2,background:s.dot,flexShrink:0}}/>
                    <span style={{fontSize:12,color:"#78716c",flex:1}}>{s.label}</span>
                    <div style={{flex:2,background:"#f5f5f4",borderRadius:3,height:5}}>
                      <div style={{width:`${a.total?cnt/a.total*100:0}%`,height:"100%",background:s.dot,borderRadius:3}}/>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,color:"#44403c",width:16,textAlign:"right"}}>{cnt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Drawer ────────────────────────────────────────────────────────────────────
function Drawer({lead,onClose,moveStage,onVisit,saveNote,markOutcome}) {
  const [note,setNote]=useState(lead.notes||"");
  const [edit,setEdit]=useState(false);
  const ag=AGENTS.find(a=>a.id===lead.agentId);

  return (
    <aside className="si" style={{width:350,background:"#fff",borderLeft:"1px solid #f5f5f4",display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
      {/* Head */}
      <div style={{padding:"16px 20px",borderBottom:"1px solid #f5f5f4",display:"flex",alignItems:"center",gap:12}}>
        <Av name={lead.name} hue={ag?.hue||"258"} size={40} showRing/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:15,fontWeight:700,color:"#1c1917",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lead.name}</div>
          <div style={{fontSize:11,color:"#a8a29e",marginTop:1,fontFamily:"monospace",letterSpacing:"0.03em"}}>{lead.id}</div>
        </div>
        <button className="btn-ghost" onClick={onClose}><Svg ic="x" size={17}/></button>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:18}}>
        {/* Stage */}
        <div>
          <label className="lbl">Pipeline Stage</label>
          <select className="inp" value={lead.stage} onChange={e=>moveStage(lead.id,e.target.value)}>
            {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        {/* Contact */}
        <div>
          <label className="lbl">Contact</label>
          <div style={{background:"#fafaf9",border:"1px solid #f0f0ef",borderRadius:10,padding:14,display:"flex",flexDirection:"column",gap:9}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}><Svg ic="phone" size={13} style={{stroke:"#a8a29e"}}/><span style={{fontSize:13,color:"#44403c"}}>{lead.phone}</span></div>
            {lead.email&&<div style={{display:"flex",alignItems:"center",gap:9}}><Svg ic="mail" size={13} style={{stroke:"#a8a29e"}}/><span style={{fontSize:13,color:"#44403c"}}>{lead.email}</span></div>}
            {lead.budget&&<div style={{fontSize:12,color:"#78716c"}}>Budget: <strong style={{color:"#1c1917"}}>₹{lead.budget}/mo</strong></div>}
            {lead.area&&<div style={{fontSize:12,color:"#78716c"}}>Area: <strong style={{color:"#1c1917"}}>{lead.area}</strong></div>}
          </div>
        </div>

        {/* Agent */}
        <div>
          <label className="lbl">Assigned Agent</label>
          <div style={{display:"flex",alignItems:"center",gap:10,background:"#fafaf9",border:"1px solid #f0f0ef",borderRadius:10,padding:"10px 14px"}}>
            <Av name={ag?.name} hue={ag?.hue||"258"} size={28}/>
            <span style={{fontSize:13,fontWeight:600,color:"#1c1917",flex:1}}>{ag?.name}</span>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:ag?.online?"#22c55e":"#d6d3d1"}}/>
              <span style={{fontSize:11,color:ag?.online?"#16a34a":"#a8a29e"}}>{ag?.online?"Online":"Offline"}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
            <label className="lbl" style={{marginBottom:0}}>Notes</label>
            <button style={{fontSize:12,color:"#7c3aed",fontWeight:600,background:"none",border:"none",cursor:"pointer"}} onClick={()=>setEdit(p=>!p)}>{edit?"Cancel":"Edit"}</button>
          </div>
          {edit?(
            <div>
              <textarea className="inp" rows={3} value={note} onChange={e=>setNote(e.target.value)} style={{resize:"vertical"}} placeholder="Add notes…"/>
              <button className="btn btn-dark btn-sm" style={{marginTop:8,width:"100%",justifyContent:"center"}} onClick={()=>{saveNote(lead.id,note);setEdit(false);}}>Save</button>
            </div>
          ):(
            <div style={{background:"#fafaf9",border:"1px solid #f0f0ef",borderRadius:10,padding:"11px 14px",fontSize:13,color:lead.notes?"#44403c":"#d6d3d1",minHeight:56,lineHeight:1.5}}>
              {lead.notes||"No notes yet."}
            </div>
          )}
        </div>

        {/* Visits */}
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <label className="lbl" style={{marginBottom:0}}>Visits ({lead.visits.length})</label>
            <button className="btn btn-dark btn-sm" onClick={onVisit}><Svg ic="plus" size={12}/>Schedule</button>
          </div>
          {lead.visits.map((v,i)=>{
            const prop=PROPERTIES.find(p=>p.id===v.property);
            return (
              <div key={i} style={{background:"#fafaf9",border:"1px solid #f0f0ef",borderRadius:10,padding:13,marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:600,color:"#1c1917"}}>{prop?.full||v.property}</div>
                <div style={{fontSize:12,color:"#a8a29e",margin:"3px 0 9px"}}>{v.date} at {v.time}</div>
                {v.outcome?(
                  <span className="tag" style={{background:v.outcome==="positive"?"#dcfce7":"#fef3c7",color:v.outcome==="positive"?"#16a34a":"#d97706"}}>
                    {v.outcome==="positive"?"✓ Positive":"→ Follow-up"}
                  </span>
                ):(
                  <div style={{display:"flex",gap:7}}>
                    <button className="btn btn-out btn-sm" style={{color:"#16a34a",borderColor:"#bbf7d0",fontSize:12}} onClick={()=>markOutcome(lead.id,i,"positive")}>Positive</button>
                    <button className="btn btn-out btn-sm" style={{fontSize:12}} onClick={()=>markOutcome(lead.id,i,"followup")}>Follow-up</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div>
          <label className="lbl">Activity</label>
          <div style={{display:"flex",flexDirection:"column"}}>
            {[...lead.tl].reverse().map((t,i,arr)=>(
              <div key={i} style={{display:"flex",gap:12,paddingBottom:12}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:"#a78bfa",flexShrink:0,marginTop:5,border:"2px solid #ede9fe"}}/>
                  {i<arr.length-1&&<div style={{width:1.5,flex:1,background:"#f0f0ef",margin:"3px 0"}}/>}
                </div>
                <div style={{paddingBottom:2}}>
                  <div style={{fontSize:12.5,color:"#44403c",lineHeight:1.4}}>{t.a}</div>
                  <div style={{fontSize:10,color:"#a8a29e",marginTop:2}}>{ago(t.t)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── New Lead Modal ────────────────────────────────────────────────────────────
function NewLeadModal({onClose,onSubmit}) {
  const [f,setF]=useState({name:"",phone:"",email:"",source:"Website Form",budget:"",area:"",notes:""});
  const u=(k,v)=>setF(p=>({...p,[k]:v}));
  const ok=f.name.trim()&&f.phone.trim();
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal fu" onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22}}>
          <div>
            <h2 style={{fontSize:17,fontWeight:800,color:"#1c1917",letterSpacing:"-0.02em"}}>Capture Lead</h2>
            <p style={{fontSize:12,color:"#a8a29e",marginTop:3}}>Auto-assigned via workload balancing</p>
          </div>
          <button className="btn-ghost" onClick={onClose}><Svg ic="x" size={18}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label className="lbl">Full Name *</label><input className="inp" placeholder="Arjun Mehta" value={f.name} onChange={e=>u("name",e.target.value)}/></div>
            <div><label className="lbl">Phone *</label><input className="inp" placeholder="98xxxxxxxx" value={f.phone} onChange={e=>u("phone",e.target.value)}/></div>
          </div>
          <div><label className="lbl">Email</label><input className="inp" type="email" placeholder="email@example.com" value={f.email} onChange={e=>u("email",e.target.value)}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label className="lbl">Lead Source *</label>
              <select className="inp" value={f.source} onChange={e=>u("source",e.target.value)}>{SOURCES.map(s=><option key={s}>{s}</option>)}</select>
            </div>
            <div><label className="lbl">Preferred Area</label><input className="inp" placeholder="Koramangala…" value={f.area} onChange={e=>u("area",e.target.value)}/></div>
          </div>
          <div><label className="lbl">Budget (₹/month)</label><input className="inp" placeholder="7000–9000" value={f.budget} onChange={e=>u("budget",e.target.value)}/></div>
          <div><label className="lbl">Notes</label><textarea className="inp" rows={2} placeholder="Special requirements…" value={f.notes} onChange={e=>u("notes",e.target.value)} style={{resize:"vertical"}}/></div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:4}}>
            <button className="btn btn-out" onClick={onClose}>Cancel</button>
            <button className="btn btn-dark" disabled={!ok} style={{opacity:ok?1:0.4}} onClick={()=>ok&&onSubmit(f)}>Capture Lead</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Visit Modal ───────────────────────────────────────────────────────────────
function VisitModal({lead,onClose,onSubmit}) {
  const [f,setF]=useState({property:"p1",date:new Date(Date.now()+864e5).toISOString().slice(0,10),time:"11:00"});
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal fu" style={{maxWidth:400}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22}}>
          <div>
            <h2 style={{fontSize:17,fontWeight:800,color:"#1c1917",letterSpacing:"-0.02em"}}>Schedule Visit</h2>
            {lead&&<p style={{fontSize:12,color:"#a8a29e",marginTop:3}}>For {lead.name}</p>}
          </div>
          <button className="btn-ghost" onClick={onClose}><Svg ic="x" size={18}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label className="lbl">Property</label>
            <select className="inp" value={f.property} onChange={e=>setF(p=>({...p,property:e.target.value}))}>
              {PROPERTIES.map(p=><option key={p.id} value={p.id}>{p.full} · ₹{p.price.toLocaleString()}/mo</option>)}
            </select>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label className="lbl">Date</label><input className="inp" type="date" value={f.date} min={new Date().toISOString().slice(0,10)} onChange={e=>setF(p=>({...p,date:e.target.value}))}/></div>
            <div><label className="lbl">Time</label>
              <select className="inp" value={f.time} onChange={e=>setF(p=>({...p,time:e.target.value}))}>
                {["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:4}}>
            <button className="btn btn-out" onClick={onClose}>Cancel</button>
            <button className="btn btn-dark" onClick={()=>onSubmit(f)}>Confirm Visit</button>
          </div>
        </div>
      </div>
    </div>
  );
}