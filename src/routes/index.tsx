import { createFileRoute } from "@tanstack/react-router";
import { portfolioHtml } from "./portfolio-html";

export const Route = createFileRoute("/")({
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

function Portfolio() {
  return (
    <iframe
      title="Hamza K. Portfolio"
      srcDoc={portfolioHtml}
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