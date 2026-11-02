import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Host";

export const Route = createFileRoute("/host/")({
  head: () => ({
    meta: [
      { title: "Your listings | Tryout" },
      { name: "description", content: "Manage the homes you have listed on Tryout." },
      { property: "og:title", content: "Your listings | Tryout" },
      { property: "og:description", content: "Manage the homes you have listed on Tryout." },
    ],
  }),
  component: Page,
});
