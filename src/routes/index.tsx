import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tryout: try the home, then sign" },
      { name: "description", content: "Stay for a week or a month. If the home and the people fit, turn it into a protected lease." },
      { property: "og:title", content: "Tryout: try the home, then sign" },
      { property: "og:description", content: "Stay for a week or a month. If the home and the people fit, turn it into a protected lease." },
    ],
  }),
  component: Page,
});
