# Portfolio Admin Panel — Setup Guide

The admin panel lives at `/admin` and is completely hidden from the public portfolio.

---

## Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Give it any name (e.g. `aditya-portfolio`)
3. Set a strong database password and choose a region close to you
4. Wait ~2 minutes for the project to spin up

---

## Step 2 — Run the SQL setup

1. In your Supabase dashboard → **SQL Editor** → **New query**
2. Paste the entire contents of `supabase/setup.sql`
3. Click **Run** — this creates:
   - `projects` table
   - `site_settings` table (with a default `main` row)
   - A public `portfolio` storage bucket
   - All RLS policies to allow the anon key to read/write

---

## Step 3 — Create your `.env` file

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Then open `.env` and replace the placeholders:

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
| `VITE_ADMIN_USERNAME` | Any username you want |
| `VITE_ADMIN_PASSWORD` | Any strong password you want |

---

## Step 4 — Install and run

```bash
bun install        # installs @supabase/supabase-js and all deps
bun run dev        # starts dev server
```

Then open **http://localhost:5173/admin** — you'll see the login screen.

---

## What the admin panel can do

### Projects tab
- **Add** a new project with title, description, tags, live URL, and number
- **Upload** a project image from your local files (stored in Supabase Storage)
- **Edit** any existing project
- **Delete** a project (with confirmation)

### Site Images tab
- **Replace the hero photo** (the portrait in the homepage hero section)
- **Replace the about photo** (the polaroid in the About section)
- Upload from file or paste any public image URL

---

## Step 5 — Connect images to the live portfolio

The admin saves image URLs to Supabase. To make the portfolio actually use them, open `src/routes/portfolio-html.ts` and near the top of the JS `<script>` block add:

```js
// Fetch dynamic content from Supabase
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY';

async function loadDynamicContent() {
  // Load site images
  const settingsRes = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?id=eq.main&select=*`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  const [settings] = await settingsRes.json();
  if (settings?.hero_image_url) {
    document.querySelectorAll('#dev-photo').forEach(img => img.src = settings.hero_image_url);
  }
  if (settings?.about_image_url) {
    document.querySelectorAll('.polaroid img').forEach(img => img.src = settings.about_image_url);
  }

  // Load projects
  const projRes = await fetch(`${SUPABASE_URL}/rest/v1/projects?select=*&order=num`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  const projects = await projRes.json();
  if (projects?.length) {
    const grid = document.querySelector('.projects-bento');
    grid.innerHTML = projects.map(p => `
      <div class="project-card tilt-card reveal">
        <div class="project-thumb">
          ${p.image_url ? `<img src="${p.image_url}" alt="${p.title}" loading="lazy"/>` : ''}
        </div>
        <div class="project-body">
          <div class="num">${p.num}</div>
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          <div class="tags">${p.tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('')}</div>
          ${p.live_url ? `<a href="${p.live_url}" target="_blank" class="live-demo interactive">Live Demo →</a>` : ''}
        </div>
      </div>
    `).join('');
  }
}

loadDynamicContent();
```

---

## Deployment

When deploying (e.g. to Vercel, Netlify, Cloudflare):
- Add the four `VITE_*` environment variables in your host's dashboard
- The `/admin` route is only accessible if you know it exists — it has no links from the public site
