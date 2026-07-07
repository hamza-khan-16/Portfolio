import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client (replace with your project values) ──────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth credentials (env vars – never hard-code in prod) ────────────────────
const ADMIN_USER = import.meta.env.VITE_ADMIN_USERNAME ?? "admin";
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD ?? "changeme123";

// ── Types ────────────────────────────────────────────────────────────────────
type Project = {
  id?: string;
  title: string;
  description: string;
  tags: string;
  live_url: string;
  num: string;
  image_url: string;
};
type SiteImages = {
  hero_image_url: string;
  about_image_url: string;
  resume_url: string;
};

// ── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — Portfolio" }] }),
});

// ────────────────────────────────────────────────────────────────────────────
//  Root component
// ────────────────────────────────────────────────────────────────────────────
function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"projects" | "images">("projects");

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return (
    <Shell tab={tab} setTab={setTab} onLogout={() => setAuthed(false)}>
      {tab === "projects" ? <ProjectsTab /> : <ImagesTab />}
    </Shell>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Login
// ────────────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (u === ADMIN_USER && p === ADMIN_PASS) {
        onLogin();
      } else {
        setErr("Invalid credentials.");
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div style={s.loginWrap}>
      <div style={s.loginCard}>
        <div style={s.loginLogo}>HK.</div>
        <h1 style={s.loginTitle}>Admin Panel</h1>
        <p style={s.loginSub}>Portfolio management console</p>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <label style={s.label}>Username</label>
          <input
            style={s.input}
            value={u}
            onChange={(e) => setU(e.target.value)}
            placeholder="admin"
            autoComplete="username"
          />
          <label style={s.label}>Password</label>
          <input
            type="password"
            style={s.input}
            value={p}
            onChange={(e) => setP(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {err && <div style={s.errMsg}>{err}</div>}
          <button type="submit" style={s.loginBtn} disabled={loading}>
            {loading ? "Verifying…" : "Sign in →"}
          </button>
        </form>
        <p style={{ ...s.loginSub, marginTop: 24, fontSize: 11 }}>
          This panel is only accessible at <code>/admin</code>
        </p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Shell / layout
// ────────────────────────────────────────────────────────────────────────────
function Shell({
  children,
  tab,
  setTab,
  onLogout,
}: {
  children: React.ReactNode;
  tab: "projects" | "images";
  setTab: (t: "projects" | "images") => void;
  onLogout: () => void;
}) {
  return (
    <div style={s.shell}>
      {/* sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>HamzaK.</div>
        <nav style={s.nav}>
          <button
            style={{ ...s.navItem, ...(tab === "projects" ? s.navActive : {}) }}
            onClick={() => setTab("projects")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
            Projects
          </button>
          <button
            style={{ ...s.navItem, ...(tab === "images" ? s.navActive : {}) }}
            onClick={() => setTab("images")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
            Site Images
          </button>
        </nav>
        <button style={s.logoutBtn} onClick={onLogout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          Logout
        </button>
      </aside>

      {/* main */}
      <main style={s.main}>{children}</main>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Projects tab
// ────────────────────────────────────────────────────────────────────────────
function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("num");
    setProjects(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (proj: Project) => {
    if (proj.id) {
      const { id, ...rest } = proj;
      await supabase.from("projects").update(rest).eq("id", id);
      showToast("Project updated ✓");
    } else {
      await supabase.from("projects").insert(proj);
      showToast("Project added ✓");
    }
    setEditing(null);
    setAdding(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    setDeleteId(null);
    showToast("Project deleted");
    load();
  };

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <h2 style={s.pageTitle}>Projects</h2>
          <p style={s.pageSub}>Manage your portfolio projects</p>
        </div>
        <button style={s.primaryBtn} onClick={() => { setAdding(true); setEditing(null); }}>
          + Add project
        </button>
      </div>

      {(adding || editing) && (
        <ProjectForm
          initial={editing ?? undefined}
          onSave={handleSave}
          onCancel={() => { setEditing(null); setAdding(false); }}
        />
      )}

      {loading ? (
        <div style={s.loading}>Loading projects…</div>
      ) : projects.length === 0 ? (
        <div style={s.empty}>No projects yet. Add your first one above.</div>
      ) : (
        <div style={s.projectGrid}>
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={() => { setEditing(p); setAdding(false); }}
              onDelete={() => setDeleteId(p.id!)}
            />
          ))}
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          message="Delete this project? This cannot be undone."
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {toast && <Toast msg={toast} />}
    </div>
  );
}

// ── Project card ─────────────────────────────────────────────────────────────
function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div style={s.card}>
      {project.image_url ? (
        <img src={project.image_url} alt={project.title} style={s.cardThumb} />
      ) : (
        <div style={s.cardThumbPlaceholder}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
        </div>
      )}
      <div style={s.cardBody}>
        <div style={s.cardNum}>{project.num}</div>
        <div style={s.cardTitle}>{project.title}</div>
        <div style={s.cardDesc}>{project.description}</div>
        <div style={s.cardTags}>
          {project.tags.split(",").map((t) => (
            <span key={t} style={s.tag}>{t.trim()}</span>
          ))}
        </div>
      </div>
      <div style={s.cardActions}>
        <button style={s.iconBtn} onClick={onEdit} title="Edit">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>
          Edit
        </button>
        <button style={{ ...s.iconBtn, ...s.iconBtnDanger }} onClick={onDelete} title="Delete">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
          Delete
        </button>
      </div>
    </div>
  );
}

// ── Project form ─────────────────────────────────────────────────────────────
function ProjectForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Project;
  onSave: (p: Project) => void;
  onCancel: () => void;
}) {
  const blank: Project = { title: "", description: "", tags: "", live_url: "", num: "01", image_url: "" };
  const [form, setForm] = useState<Project>(initial ?? blank);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof Project, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const uploadImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `projects/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("portfolio").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
      set("image_url", data.publicUrl);
    }
    setUploading(false);
  };

  return (
    <div style={s.formCard}>
      <h3 style={s.formTitle}>{initial ? "Edit project" : "New project"}</h3>
      <div style={s.formGrid}>
        <div>
          <label style={s.label}>Number (e.g. 01)</label>
          <input style={s.input} value={form.num} onChange={(e) => set("num", e.target.value)} placeholder="01" />
        </div>
        <div>
          <label style={s.label}>Title</label>
          <input style={s.input} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Project name" />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={s.label}>Description</label>
          <textarea style={{ ...s.input, minHeight: 72, resize: "vertical" }} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Short description…" />
        </div>
        <div>
          <label style={s.label}>Tags (comma-separated)</label>
          <input style={s.input} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="React, Node, MongoDB" />
        </div>
        <div>
          <label style={s.label}>Live URL</label>
          <input style={s.input} value={form.live_url} onChange={(e) => set("live_url", e.target.value)} placeholder="https://…" />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={s.label}>Project image</label>
          <div style={s.uploadArea} onClick={() => fileRef.current?.click()}>
            {form.image_url ? (
              <img src={form.image_url} alt="preview" style={s.uploadPreview} />
            ) : (
              <div style={s.uploadPlaceholder}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                <span style={{ fontSize: 13, color: "#888", marginTop: 6 }}>{uploading ? "Uploading…" : "Click to upload image"}</span>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
          </div>
          {form.image_url && (
            <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
              <input style={{ ...s.input, flex: 1, margin: 0 }} value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="Or paste image URL" />
              <button style={s.ghostBtn} onClick={() => { set("image_url", ""); if (fileRef.current) fileRef.current.value = ""; }}>Clear</button>
            </div>
          )}
        </div>
      </div>
      <div style={s.formActions}>
        <button style={s.ghostBtn} onClick={onCancel}>Cancel</button>
        <button style={s.primaryBtn} onClick={() => onSave(form)} disabled={uploading}>
          {uploading ? "Uploading…" : initial ? "Save changes" : "Add project"}
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Site images tab
// ────────────────────────────────────────────────────────────────────────────
function ImagesTab() {
  const [images, setImages] = useState<SiteImages>({ hero_image_url: "", about_image_url: "", resume_url: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const heroRef = useRef<HTMLInputElement>(null);
  const aboutRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("id", "main").single();
      if (data) setImages({ hero_image_url: data.hero_image_url ?? "", about_image_url: data.about_image_url ?? "", resume_url: data.resume_url ?? "" });
      setLoading(false);
    })();
  }, []);

  const uploadImage = async (file: File, key: keyof SiteImages) => {
    const ext = file.name.split(".").pop();
    const path = `site/${key}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("portfolio").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
      setImages((prev) => ({ ...prev, [key]: data.publicUrl }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("site_settings").upsert({ id: "main", ...images });
    setSaving(false);
    showToast("Site images saved ✓");
  };

  if (loading) return <div style={s.loading}>Loading…</div>;

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <h2 style={s.pageTitle}>Site Images</h2>
          <p style={s.pageSub}>Update the hero and about section photos</p>
        </div>
        <button style={s.primaryBtn} onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div style={s.imagesGrid}>
        <ImageUploadBlock
          label="Hero photo"
          hint="Shown in the homepage hero section (portrait)"
          value={images.hero_image_url}
          inputRef={heroRef}
          onChange={(url) => setImages((p) => ({ ...p, hero_image_url: url }))}
          onUpload={(file) => uploadImage(file, "hero_image_url")}
          onClear={() => { setImages((p) => ({ ...p, hero_image_url: "" })); if (heroRef.current) heroRef.current.value = ""; }}
        />
        <ImageUploadBlock
          label="About section photo"
          hint="Shown in the polaroid on the about section"
          value={images.about_image_url}
          inputRef={aboutRef}
          onChange={(url) => setImages((p) => ({ ...p, about_image_url: url }))}
          onUpload={(file) => uploadImage(file, "about_image_url")}
          onClear={() => { setImages((p) => ({ ...p, about_image_url: "" })); if (aboutRef.current) aboutRef.current.value = ""; }}
        />
      </div>

      {/* ── Resume / document upload ── */}
      <ResumeUploadBlock
        value={images.resume_url}
        onChange={(url) => setImages((p) => ({ ...p, resume_url: url }))}
        onUpload={async (file) => {
          const ext = file.name.split(".").pop();
          const path = `site/resume-${Date.now()}.${ext}`;
          const { error } = await supabase.storage.from("portfolio").upload(path, file, { upsert: true });
          if (!error) {
            const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
            setImages((p) => ({ ...p, resume_url: data.publicUrl }));
          }
        }}
        onClear={() => setImages((p) => ({ ...p, resume_url: "" }))}
      />

      <div style={s.infoBox}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B5BFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
        <span>After saving, the portfolio at <code>/</code> will load images from Supabase automatically. Make sure your portfolio's index.tsx reads from the <code>site_settings</code> table.</span>
      </div>

      {toast && <Toast msg={toast} />}
    </div>
  );
}

function ImageUploadBlock({
  label, hint, value, inputRef, onChange, onUpload, onClear,
}: {
  label: string; hint: string; value: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (url: string) => void;
  onUpload: (f: File) => Promise<void>;
  onClear: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handle = async (file: File) => {
    setUploading(true);
    await onUpload(file);
    setUploading(false);
  };

  return (
    <div style={s.imageBlock}>
      <div style={s.imageBlockLabel}>{label}</div>
      <div style={s.imageBlockHint}>{hint}</div>
      <div style={{ ...s.uploadArea, height: 220 }} onClick={() => inputRef.current?.click()}>
        {value ? (
          <img src={value} alt="preview" style={{ ...s.uploadPreview, height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={s.uploadPlaceholder}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            <span style={{ fontSize: 13, color: "#aaa", marginTop: 8 }}>{uploading ? "Uploading…" : "Click to upload"}</span>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
        <input style={{ ...s.input, flex: 1, margin: 0, fontSize: 12 }} value={value}
          onChange={(e) => onChange(e.target.value)} placeholder="Or paste image URL…" />
        {value && <button style={s.ghostBtn} onClick={onClear}>Clear</button>}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Shared tiny components
// ────────────────────────────────────────────────────────────────────────────
function Toast({ msg }: { msg: string }) {
  return <div style={s.toast}>{msg}</div>;
}

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={s.modalOverlay}>
      <div style={s.modal}>
        <p style={{ marginBottom: 20, fontSize: 15 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button style={s.ghostBtn} onClick={onCancel}>Cancel</button>
          <button style={{ ...s.primaryBtn, background: "#ef4444" }} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Resume upload block ───────────────────────────────────────────────────────
function ResumeUploadBlock({
  value, onChange, onUpload, onClear,
}: {
  value: string;
  onChange: (url: string) => void;
  onUpload: (f: File) => Promise<void>;
  onClear: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handle = async (file: File) => {
    setUploading(true);
    await onUpload(file);
    setUploading(false);
  };

  const getFileName = (url: string) => {
    try { return decodeURIComponent(url.split("/").pop()?.split("?")[0] ?? url); }
    catch { return url; }
  };

  return (
    <div style={{ ...s.imageBlock, marginBottom: 24 }}>
      <div style={s.imageBlockLabel}>Resume / CV</div>
      <div style={s.imageBlockHint}>Upload your CV so the "Download Resume" button works. Accepts PDF, DOCX, or any document.</div>

      <div
        style={{ ...s.uploadArea, height: "auto", minHeight: 100, flexDirection: "column", gap: 8, padding: 24 }}
        onClick={() => !value && fileRef.current?.click()}
      >
        {value ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "4px 0" }}>
            <div style={{ width: 44, height: 52, background: "#EEF1FF", border: "1.5px solid #C7D0FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B5BFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
                <path d="M14 2v6h6"/><path d="M9 15h6"/><path d="M9 11h3"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#181410", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {getFileName(value)}
              </div>
              <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#3B5BFF", textDecoration: "none" }}>
                Preview →
              </a>
            </div>
            <button style={s.ghostBtn} onClick={(e) => { e.stopPropagation(); onClear(); }}>Remove</button>
          </div>
        ) : (
          <>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span style={{ fontSize: 13, color: "#aaa" }}>{uploading ? "Uploading…" : "Click to upload PDF, DOCX, etc."}</span>
          </>
        )}
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,application/*" style={{ display: "none" }}
          onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
        <input style={{ ...s.input, flex: 1, margin: 0, fontSize: 12 }} value={value}
          onChange={(e) => onChange(e.target.value)} placeholder="Or paste a public document URL…" />
        <button style={s.ghostBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? "…" : "Replace"}
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Styles (plain JS objects — no Tailwind/emotion required)
// ────────────────────────────────────────────────────────────────────────────
const BLUE = "#3B5BFF";
const INK = "#181410";
const PAPER = "#FAFAF7";
const LINE = "#E8E5DD";

const s: Record<string, React.CSSProperties> = {
  // login
  loginWrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: PAPER, fontFamily: "'Inter', sans-serif" },
  loginCard: { background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 20, padding: "48px 44px", width: "100%", maxWidth: 400, boxShadow: "0 8px 40px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", alignItems: "center" },
  loginLogo: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 32, color: INK, marginBottom: 12 },
  loginTitle: { fontSize: 22, fontWeight: 700, color: INK, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4 },
  loginSub: { fontSize: 13, color: "#888", marginBottom: 28, textAlign: "center" as const },
  loginBtn: { width: "100%", background: INK, color: "#fff", border: "none", borderRadius: 30, padding: "14px 0", fontWeight: 600, fontSize: 15, cursor: "pointer", marginTop: 8, fontFamily: "'Inter', sans-serif", transition: "opacity .2s" },
  // shell
  shell: { display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", background: "#F5F3EE" },
  sidebar: { width: 220, background: INK, display: "flex", flexDirection: "column", padding: "28px 0", flexShrink: 0 },
  sidebarLogo: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: "#fff", padding: "0 24px 28px" },
  nav: { flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: "0 12px" },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, border: "none", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 500, cursor: "pointer", textAlign: "left" as const, transition: "all .2s", fontFamily: "'Inter', sans-serif" },
  navActive: { background: "rgba(255,255,255,0.12)", color: "#fff" },
  logoutBtn: { margin: "20px 12px 0", display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: "none", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  main: { flex: 1, padding: "40px 48px", maxWidth: 980, overflowY: "auto" as const },
  // page
  pageHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16 },
  pageTitle: { fontSize: 24, fontWeight: 700, color: INK, fontFamily: "'Space Grotesk', sans-serif", margin: 0 },
  pageSub: { fontSize: 13, color: "#888", marginTop: 4 },
  // form
  formCard: { background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 16, padding: "28px 32px", marginBottom: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" },
  formTitle: { fontSize: 16, fontWeight: 700, color: INK, marginBottom: 20, fontFamily: "'Space Grotesk', sans-serif" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" },
  formActions: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 },
  // inputs
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 5, letterSpacing: "0.03em", textTransform: "uppercase" as const },
  input: { display: "block", width: "100%", border: `1.5px solid ${LINE}`, borderRadius: 10, padding: "10px 14px", fontSize: 14, color: INK, background: PAPER, outline: "none", boxSizing: "border-box" as const, fontFamily: "'Inter', sans-serif", marginBottom: 0 },
  errMsg: { fontSize: 13, color: "#ef4444", marginTop: 4, marginBottom: 8 },
  // buttons
  primaryBtn: { background: INK, color: "#fff", border: "none", borderRadius: 30, padding: "11px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" as const },
  ghostBtn: { background: "transparent", color: INK, border: `1.5px solid ${LINE}`, borderRadius: 30, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" as const },
  iconBtn: { display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1.5px solid ${LINE}`, borderRadius: 8, padding: "7px 12px", fontSize: 13, color: "#555", cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  iconBtnDanger: { color: "#ef4444", borderColor: "#fecaca" },
  // project grid / card
  projectGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 },
  card: { background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  cardThumb: { width: "100%", height: 160, objectFit: "cover" as const, display: "block" },
  cardThumbPlaceholder: { width: "100%", height: 160, background: "#F2EFE7", display: "flex", alignItems: "center", justifyContent: "center" },
  cardBody: { padding: "16px 18px 12px" },
  cardNum: { fontSize: 12, color: "#8B5CF6", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: 2 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: INK, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4 },
  cardDesc: { fontSize: 13, color: "#666", lineHeight: 1.5, marginBottom: 10 },
  cardTags: { display: "flex", flexWrap: "wrap" as const, gap: 6 },
  tag: { fontSize: 11, border: `1px solid ${LINE}`, borderRadius: 20, padding: "3px 10px", color: "#888", fontFamily: "'Space Grotesk', sans-serif" },
  cardActions: { display: "flex", gap: 8, padding: "10px 18px 14px" },
  // upload
  uploadArea: { border: `2px dashed ${LINE}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 130, position: "relative" as const },
  uploadPreview: { width: "100%", objectFit: "cover" as const, display: "block" },
  uploadPlaceholder: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 },
  // images tab
  imagesGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 },
  imageBlock: { background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 16, padding: "24px 24px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  imageBlockLabel: { fontSize: 15, fontWeight: 700, color: INK, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4 },
  imageBlockHint: { fontSize: 12, color: "#888", marginBottom: 14 },
  // info box
  infoBox: { background: "#EEF1FF", border: "1.5px solid #C7D0FF", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#444", lineHeight: 1.55 },
  // misc
  loading: { padding: "40px 0", color: "#888", fontSize: 15 },
  empty: { padding: "60px 0", color: "#aaa", fontSize: 14, textAlign: "center" as const },
  toast: { position: "fixed" as const, bottom: 28, right: 28, background: INK, color: "#fff", borderRadius: 12, padding: "14px 22px", fontSize: 14, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,0.18)", zIndex: 9999, animation: "fadeIn .25s ease" },
  modalOverlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9998 },
  modal: { background: "#fff", borderRadius: 16, padding: "32px 36px", maxWidth: 380, width: "90%", boxShadow: "0 16px 48px rgba(0,0,0,0.15)" },
};
