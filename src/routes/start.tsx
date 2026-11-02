import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Start";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "Find your fit | LeaseIt" },
      { name: "description", content: "Answer a few lifestyle questions to find homes and flatmates that suit you." },
      { property: "og:title", content: "Find your fit | LeaseIt" },
      { property: "og:description", content: "Answer a few lifestyle questions to find homes and flatmates that suit you." },
    ],
  }),
  component: Page,
});
