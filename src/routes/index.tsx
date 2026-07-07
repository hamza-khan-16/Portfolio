import { createFileRoute } from "@tanstack/react-router";
import { portfolioHtml } from "./portfolio-html";

export const Route = createFileRoute("/")(  {
  component: Portfolio,
  head: () => ({
    meta: [
      { title: "Hamza K. — Full-stack Developer" },
      {
        name: "description",
        content:
          "Portfolio of Hamza — full-stack developer building playful, hand-crafted web experiences.",
      },
    ],
  }),
});

// Inject env vars into the HTML at render time
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL       ?? "";
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY  ?? "";
const adminEmail   = import.meta.env.VITE_ADMIN_EMAIL         ?? "Hamza@dev.com";
const adminPhone   = import.meta.env.VITE_ADMIN_PHONE         ?? "+91 00000 00000";

const hydratedHtml = portfolioHtml
  .replace(/%%SUPABASE_URL%%/g,      supabaseUrl)
  .replace(/%%SUPABASE_ANON_KEY%%/g, supabaseKey)
  .replace(/%%ADMIN_EMAIL%%/g,       adminEmail)
  .replace(/%%ADMIN_PHONE%%/g,       adminPhone);

function Portfolio() {
  return (
    <iframe
      title="Hamza K. Portfolio"
      srcDoc={hydratedHtml}
      style={{
        border: 0,
        width: "100vw",
        height: "100vh",
        display: "block",
        margin: 0,
      }}
    />
  );
}
