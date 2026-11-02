import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/HostNew";

export const Route = createFileRoute("/host/new")({
  head: () => ({
    meta: [
      { title: "List a home | Tryout" },
      { name: "description", content: "List your home step by step with a live preview." },
      { property: "og:title", content: "List a home | Tryout" },
      { property: "og:description", content: "List your home step by step with a live preview." },
    ],
  }),
  component: Page,
});
