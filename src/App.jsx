import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, BadgeCheck, BarChart3, Bell,
  Camera, Check, CheckCircle2, ChevronDown, CircleAlert, ClipboardList,
  Clock3, Filter, Leaf, MapPin, Menu, Plus, Recycle, Search, ShieldCheck,
  Sparkles, Trash2, TrendingUp, UploadCloud, Users, X
} from "lucide-react";

const initialReports = [
  { id: "CL-1048", title: "Overflowing bin near main gate", category: "Overflowing bin", location: "Main Gate, North Entrance", area: "Main Gate", priority: "High", status: "Assigned", created: "12 min ago", description: "Bin is full and waste is spilling onto the walkway.", reporter: "Campus resident", image: "", lat: 12, lng: 18 },
  { id: "CL-1047", title: "Plastic waste beside bus stop", category: "Litter / dumping", location: "East Bus Stop", area: "East Bus Stop", priority: "Medium", status: "Reported", created: "28 min ago", description: "Plastic cups and wrappers around the bus stop.", reporter: "Anonymous", image: "", lat: 70, lng: 25 },
  { id: "CL-1046", title: "Waste pile behind cafeteria", category: "Illegal dumping", location: "Cafeteria Service Lane", area: "Cafeteria", priority: "High", status: "In progress", created: "1 hr ago", description: "Mixed waste pile near the service lane.", reporter: "Campus resident", image: "", lat: 48, lng: 60 },
  { id: "CL-1045", title: "Overflowing bin near main gate", category: "Overflowing bin", location: "Main Gate, North Entrance", area: "Main Gate", priority: "High", status: "Reported", created: "1 hr ago", description: "Another report of the same overflowing bin.", reporter: "Anonymous", image: "", lat: 15, lng: 20 },
  { id: "CL-1044", title: "Mixed waste not segregated", category: "Poor segregation", location: "Hostel Block B", area: "Hostel Block B", priority: "Low", status: "Resolved", created: "Yesterday", description: "Wet and dry waste mixed in the same container.", reporter: "Campus resident", image: "", lat: 76, lng: 68 },
];

const statusOptions = ["Reported", "Verified", "Assigned", "In progress", "Resolved"];
const categoryOptions = ["Overflowing bin", "Litter / dumping", "Illegal dumping", "Poor segregation", "Other"];
const priorityRank = { High: 3, Medium: 2, Low: 1 };

function getInitialReports() {
  try {
    const saved = localStorage.getItem("cleanloop-reports-v1");
    return saved ? JSON.parse(saved) : initialReports;
  } catch { return initialReports; }
}
function isDuplicate(a, b) {
  return a.id !== b.id && a.area.toLowerCase() === b.area.toLowerCase() && a.category === b.category;
}
function priorityFor(category, description) {
  const text = `${category} ${description}`.toLowerCase();
  if (/overflow|dump|drain|sharp|medical|hazard/.test(text)) return "High";
  if (/plastic|litter|mixed|smell/.test(text)) return "Medium";
  return "Low";
}

export default function App() {
  const [reports, setReports] = useState(getInitialReports);
  const [activeTab, setActiveTab] = useState("Overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [showReport, setShowReport] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Overflowing bin", location: "", description: "", image: "" });
  const fileRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem("cleanloop-reports-v1", JSON.stringify(reports)); } catch {}
  }, [reports]);

  const duplicateCount = useMemo(() => {
    let count = 0;
    reports.forEach((r, i) => {
      if (reports.slice(i + 1).some(other => isDuplicate(r, other))) count++;
    });
    return count;
  }, [reports]);

  const stats = useMemo(() => ({
    total: reports.length,
    open: reports.filter(r => r.status !== "Resolved").length,
    resolved: reports.filter(r => r.status === "Resolved").length,
    high: reports.filter(r => r.priority === "High" && r.status !== "Resolved").length,
  }), [reports]);

  const filtered = reports.filter(r => {
    const matchesText = `${r.title} ${r.location} ${r.category} ${r.id}`.toLowerCase().includes(search.toLowerCase());
    return matchesText && (statusFilter === "All statuses" || r.status === statusFilter);
  });

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function updateStatus(id, status) {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    notify(`Report ${id} updated to ${status}.`);
  }

  function handleImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { notify("Please choose an image file."); return; }
    if (file.size > 3 * 1024 * 1024) { notify("Please use an image smaller than 3 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(prev => ({ ...prev, image: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  function submitReport(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.location.trim()) {
      notify("Please add a short title and location.");
      return;
    }
    const priority = priorityFor(form.category, form.description);
    const id = `CL-${Math.max(1000, ...reports.map(r => Number(r.id.replace("CL-", "")) || 0) + 1)}`;
    const area = form.location.trim().split(",")[0].trim();
    const report = {
      id, title: form.title.trim(), category: form.category, location: form.location.trim(),
      area, priority, status: "Reported", created: "Just now",
      description: form.description.trim() || "No additional description provided.",
      reporter: "You", image: form.image, lat: 25 + Math.random() * 48, lng: 15 + Math.random() * 65
    };
    setReports(prev => [report, ...prev]);
    setForm({ title: "", category: "Overflowing bin", location: "", description: "", image: "" });
    setShowReport(false);
    setActiveTab("Reports");
    notify(`Report ${id} created successfully.`);
  }

  function resetDemo() {
    setReports(initialReports);
    try { localStorage.removeItem("cleanloop-reports-v1"); } catch {}
    setSearch("");
    setStatusFilter("All statuses");
    notify("Demo data restored.");
  }

  const navItems = [
    { name: "Overview", icon: BarChart3 },
    { name: "Reports", icon: ClipboardList },
    { name: "Hotspot map", icon: MapPin },
    { name: "Impact", icon: Leaf },
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Recycle size={22} strokeWidth={2.5}/></div>
          <div><div className="brand-name">cleanloop<span>.</span></div><div className="brand-sub">COMMUNITY IMPACT</div></div>
          <button className="icon-button mobile-close" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={19}/></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <button className="workspace-switch"><span className="workspace-avatar">CC</span><span className="workspace-text"><b>Campus Community</b><small>Community workspace</small></span><ChevronDown size={16}/></button>
        <div className="nav-label">MENU</div>
        <nav className="nav-list">
          {navItems.map(({ name, icon: Icon }) => (
            <button key={name} className={`nav-item ${activeTab === name ? "active" : ""}`} onClick={() => { setActiveTab(name); setMobileMenu(false); }}>
              <Icon size={18}/><span>{name}</span>
              {name === "Reports" && <span className="nav-count">{stats.open}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="impact-card">
            <div className="impact-icon"><Leaf size={17}/></div>
            <b>Small actions.<br/>Cleaner communities.</b>
            <p>Every verified report helps your community focus its efforts.</p>
            <div className="impact-progress"><span style={{ width: `${stats.total ? Math.round(stats.resolved / stats.total * 100) : 0}%` }}/></div>
            <small>{stats.total ? Math.round(stats.resolved / stats.total * 100) : 0}% of reports resolved</small>
          </div>
          <button className="nav-item" onClick={resetDemo}><Activity size={18}/><span>Reset demo data</span></button>
          <div className="profile"><div className="profile-avatar">JD</div><div><b>Demo Coordinator</b><small>Community admin</small></div><ChevronDown size={15}/></div>
        </div>
      </aside>

      {mobileMenu && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileMenu(false)}/>}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={20}/></button>
            <div className="breadcrumb">Workspace <span>/</span> <b>{activeTab}</b></div>
          </div>
          <div className="topbar-actions">
            <div className="live-pill"><span/> Demo environment</div>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify("You are all caught up.")}><Bell size={18}/><i/></button>
            <button className="primary-button top-report" onClick={() => setShowReport(true)}><Plus size={17}/> New report</button>
          </div>
        </header>

        <div className="page-wrap">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><Sparkles size={14}/> COMMUNITY CLEANUP INTELLIGENCE</div>
              <h1>{activeTab === "Overview" ? "Cleaner places start here." : activeTab === "Reports" ? "Community reports" : activeTab === "Hotspot map" ? "Waste hotspot map" : "Your community impact"}</h1>
              <p>{activeTab === "Overview" ? "Turn local waste reports into visible, trackable action." : activeTab === "Reports" ? "Review reports, spot repeat issues and track cleanup progress." : activeTab === "Hotspot map" ? "Explore reported locations and recurring waste problems." : "Understand progress with transparent, measurable indicators."}</p>
            </div>
            <button className="secondary-button welcome-button" onClick={() => setShowReport(true)}><Camera size={17}/> Report an issue</button>
          </section>

          {activeTab === "Overview" && <>
            <section className="stats-grid">
              <StatCard label="Total reports" value={stats.total} change="All submitted reports" icon={ClipboardList} tone="green"/>
              <StatCard label="Open issues" value={stats.open} change="Awaiting resolution" icon={Clock3} tone="amber"/>
              <StatCard label="High priority" value={stats.high} change="Needs attention" icon={CircleAlert} tone="red"/>
              <StatCard label="Resolved" value={stats.resolved} change="Marked complete" icon={BadgeCheck} tone="blue"/>
            </section>
            <section className="overview-grid">
              <div className="panel map-panel">
                <div className="panel-header"><div><h2>Community hotspots</h2><p>Illustrative campus map · Demo locations</p></div><button className="text-button" onClick={() => setActiveTab("Hotspot map")}>View map <ArrowUpRight size={15}/></button></div>
                <HotspotMap reports={reports}/>
                <div className="map-legend"><span><i className="dot dot-red"/>High priority</span><span><i className="dot dot-amber"/>Medium priority</span><span><i className="dot dot-green"/>Resolved</span></div>
              </div>
              <div className="panel action-panel">
                <div className="panel-header"><div><h2>Needs attention</h2><p>Suggested next actions</p></div><span className="tiny-badge">{stats.high} high</span></div>
                <div className="action-list">
                  {reports.filter(r => r.status !== "Resolved").sort((a,b) => priorityRank[b.priority]-priorityRank[a.priority]).slice(0,3).map(r => (
                    <div className="action-item" key={r.id}>
                      <div className={`priority-marker ${r.priority.toLowerCase()}`}/><div className="action-copy"><b>{r.title}</b><span><MapPin size={12}/> {r.location}</span><small>{r.id} · {r.created}</small></div><span className={`priority-tag ${r.priority.toLowerCase()}`}>{r.priority}</span>
                    </div>
                  ))}
                  {!stats.open && <div className="empty-state">All reports are resolved. Great work!</div>}
                </div>
                <button className="full-secondary" onClick={() => { setActiveTab("Reports"); setStatusFilter("All statuses"); }}>Review all reports <ArrowDownRight size={15}/></button>
              </div>
            </section>
            <section className="panel reports-panel">
              <div className="panel-header"><div><h2>Recent reports</h2><p>Latest community submissions</p></div><button className="text-button" onClick={() => setActiveTab("Reports")}>All reports <ArrowUpRight size={15}/></button></div>
              <ReportTable reports={reports.slice(0,4)} onStatus={updateStatus}/>
            </section>
            <section className="insight-strip"><div className="insight-icon"><Sparkles size={19}/></div><div><b>Hotspot insight</b><p>{duplicateCount ? `${duplicateCount} report group(s) may describe repeat issues. Review similar locations before assigning separate cleanup tasks.` : "No potential duplicate groups found in the current data."} This is a rule-based suggestion, not a confirmed AI finding.</p></div><button onClick={() => setActiveTab("Hotspot map")}>Explore <ArrowUpRight size={15}/></button></section>
          </>}

          {activeTab === "Reports" && <section className="panel reports-panel full-panel">
            <div className="panel-header reports-tools"><div><h2>All reports <span className="count-bubble">{filtered.length}</span></h2><p>Manage issue status and review submitted details.</p></div><button className="primary-button" onClick={() => setShowReport(true)}><Plus size={16}/> New report</button></div>
            <div className="table-toolbar"><div className="search-box"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports, location or ID..."/></div><div className="filter-box"><Filter size={15}/><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>All statuses</option>{statusOptions.map(s => <option key={s}>{s}</option>)}</select></div></div>
            <ReportTable reports={filtered} onStatus={updateStatus} detailed/>
            {!filtered.length && <div className="empty-state">No reports match your search.</div>}
          </section>}

          {activeTab === "Hotspot map" && <section className="panel full-panel map-page-panel"><div className="panel-header"><div><h2>Reported waste locations</h2><p>Illustrative positions for demo records; not real GPS coordinates.</p></div><span className="tiny-badge">{reports.length} reports</span></div><HotspotMap reports={reports} large/><div className="hotspot-list">{reports.slice(0,6).map(r => <div className="hotspot-row" key={r.id}><span className={`priority-marker ${r.priority.toLowerCase()}`}/><div><b>{r.area}</b><small>{r.category} · {r.id}</small></div><span className={`status-tag ${r.status.toLowerCase().replace(" ","-")}`}>{r.status}</span></div>)}</div></section>}

          {activeTab === "Impact" && <div className="impact-page">
            <section className="stats-grid">
              <StatCard label="Reports received" value={stats.total} change="In current demo dataset" icon={ClipboardList} tone="green"/>
              <StatCard label="Potential duplicates" value={duplicateCount} change="Rule-based suggestions" icon={Users} tone="amber"/>
              <StatCard label="Resolution rate" value={`${stats.total ? Math.round(stats.resolved/stats.total*100) : 0}%`} change="Resolved / all reports" icon={TrendingUp} tone="blue"/>
              <StatCard label="Open hotspots" value={new Set(reports.filter(r => r.status !== "Resolved").map(r => r.area)).size} change="Distinct open locations" icon={MapPin} tone="red"/>
            </section>
            <section className="panel impact-breakdown"><div className="panel-header"><div><h2>Resolution breakdown</h2><p>Based on current local demo data</p></div><ShieldCheck size={20} color="#258466"/></div>
              {statusOptions.map(status => { const count = reports.filter(r => r.status === status).length; return <div className="bar-row" key={status}><div><span>{status}</span><b>{count}</b></div><div className="bar-track"><span style={{width:`${reports.length ? count/reports.length*100 : 0}%`}}/></div></div>; })}
              <div className="note-box"><CircleAlert size={17}/><span>These figures describe application records, not verified reductions in waste or pollution. A real-world pilot is needed to measure environmental outcomes.</span></div>
            </section>
            <section className="panel segregation-panel"><div className="panel-header"><div><h2>Waste segregation guide</h2><p>Follow local collection instructions where they differ.</p></div><Recycle size={20} color="#258466"/></div><div className="segregation-grid"><SegItem color="wet" title="Wet waste" text="Food scraps and other biodegradable kitchen waste."/><SegItem color="dry" title="Dry waste" text="Clean paper, cardboard, metal, glass and recyclable plastics as locally accepted."/><SegItem color="sanitary" title="Sanitary waste" text="Wrap and dispose of sanitary waste according to local collection rules."/><SegItem color="special" title="Special care waste" text="Keep household hazardous or special-care waste separate and follow local guidance."/></div></section>
          </div>}

          <footer className="footer"><span>© 2026 CleanLoop AI · HackFest prototype</span><span><span className="footer-dot"/> Demo mode · Sample data</span></footer>
        </div>
      </main>

      {showReport && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowReport(false); }}>
        <div className="modal">
          <div className="modal-header"><div><div className="eyebrow"><Leaf size={14}/> COMMUNITY REPORT</div><h2>Report a waste issue</h2><p>Help your community identify and resolve a local problem.</p></div><button className="icon-button" onClick={() => setShowReport(false)} aria-label="Close"><X size={20}/></button></div>
          <form onSubmit={submitReport} className="report-form">
            <label>Report title <span>*</span><input value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Overflowing bin near library" maxLength={100} required/></label>
            <div className="form-row"><label>Issue category<select value={form.category} onChange={e => setForm({...form,category:e.target.value})}>{categoryOptions.map(c => <option key={c}>{c}</option>)}</select></label><label>Location <span>*</span><input value={form.location} onChange={e => setForm({...form,location:e.target.value})} placeholder="e.g. Library entrance" maxLength={120} required/></label></div>
            <label>Description<textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Describe what you observed..." rows={3} maxLength={500}/></label>
            <div className="upload-area" onClick={() => fileRef.current?.click()} role="button" tabIndex={0} onKeyDown={e => {if(e.key==="Enter") fileRef.current?.click();}}>
              {form.image ? <img src={form.image} alt="Selected report"/> : <><div className="upload-icon"><UploadCloud size={22}/></div><b>Add a photo (optional)</b><span>Image only · Up to 3 MB · Stored in this browser demo</span></>}
              {form.image && <button type="button" className="remove-image" onClick={e => {e.stopPropagation();setForm({...form,image:""});}}>Remove photo</button>}
            </div>
            <input ref={fileRef} className="hidden-input" type="file" accept="image/*" onChange={handleImage}/>
            <div className="form-note"><ShieldCheck size={15}/> Please do not upload faces, private details or sensitive images.</div>
            <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowReport(false)}>Cancel</button><button className="primary-button" type="submit"><Plus size={16}/> Submit report</button></div>
          </form>
        </div>
      </div>}

      {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
    </div>
  );
}

function StatCard({ label, value, change, icon: Icon, tone }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon size={18}/></span></div><div className="stat-value">{value}</div><div className="stat-change"><span className={`mini-indicator ${tone}`}/>{change}</div></div>;
}

function HotspotMap({ reports, large = false }) {
  const spots = [
    { x: 18, y: 24, name: "Main Gate" }, { x: 70, y: 32, name: "East Bus Stop" },
    { x: 49, y: 60, name: "Cafeteria" }, { x: 76, y: 73, name: "Hostel Block B" },
    { x: 30, y: 78, name: "Library" }, { x: 55, y: 22, name: "Sports Ground" }
  ];
  return <div className={`map-illustration ${large ? "map-large" : ""}`}>
    <div className="map-grid-lines"/>
    <div className="map-road road-one"/><div className="map-road road-two"/><div className="map-road road-three"/>
    <div className="map-park park-one"/><div className="map-park park-two"/><div className="map-park park-three"/>
    <div className="map-building building-one"/><div className="map-building building-two"/><div className="map-building building-three"/><div className="map-building building-four"/>
    {spots.map(s => {
      const matching = reports.filter(r => r.area.toLowerCase().includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(r.area.toLowerCase()));
      if (!matching.length) return null;
      const high = matching.some(r => r.priority === "High" && r.status !== "Resolved");
      const resolved = matching.every(r => r.status === "Resolved");
      return <div className={`map-pin ${resolved ? "resolved" : high ? "high" : "medium"}`} style={{left:`${s.x}%`,top:`${s.y}%`}} key={s.name} title={`${s.name}: ${matching.length} report(s)`}><MapPin size={large ? 19 : 16} fill="currentColor"/><span>{s.name}</span></div>;
    })}
    <div className="map-label map-label-one">CAMPUS NORTH</div><div className="map-label map-label-two">GREEN ZONE</div><div className="map-scale">Illustrative map · Not to scale</div>
  </div>;
}
function ReportTable({ reports, onStatus, detailed = false }) {
  if (!reports.length) return <div className="empty-state">No reports yet. Create a report to get started.</div>;
  return <div className="table-scroll"><table className="report-table"><thead><tr><th>Issue</th><th>Location</th><th>Priority</th><th>Status</th>{detailed && <th>Update status</th>}</tr></thead><tbody>{reports.map(r => <tr key={r.id}><td><div className="issue-cell">{r.image ? <img src={r.image} alt=""/> : <div className={`issue-icon ${r.category === "Poor segregation" ? "blue" : r.priority.toLowerCase()}`}><Trash2 size={16}/></div>}<div><b>{r.title}</b><small>{r.id} · {r.created}</small></div></div></td><td><div className="location-cell"><MapPin size={13}/>{r.location}</div></td><td><span className={`priority-tag ${r.priority.toLowerCase()}`}><i/>{r.priority}</span></td><td><span className={`status-tag ${r.status.toLowerCase().replace(" ","-")}`}><i/>{r.status}</span></td>{detailed && <td><select className="status-select" aria-label={`Update status for ${r.id}`} value={r.status} onChange={e => onStatus(r.id,e.target.value)}>{statusOptions.map(s => <option key={s}>{s}</option>)}</select></td>}</tr>)}</tbody></table></div>;
}
function SegItem({ color, title, text }) {
  return <div className="seg-item"><span className={`seg-color ${color}`}/><div><b>{title}</b><p>{text}</p></div></div>;
}