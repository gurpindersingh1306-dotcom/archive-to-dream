import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Host";

export const Route = createFileRoute("/_authenticated/host/")({
  head: () => ({
    meta: [
      { title: "Your listings | LeaseIt" },
      { name: "description", content: "Manage the homes you have listed on LeaseIt." },
      { property: "og:title", content: "Your listings | LeaseIt" },
      { property: "og:description", content: "Manage the homes you have listed on LeaseIt." },
    ],
  }),
  component: Page,
});
