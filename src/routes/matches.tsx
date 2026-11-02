import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Matches";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Your matches | Tryout" },
      { name: "description", content: "Your top homes ranked by household fit." },
      { property: "og:title", content: "Your matches | Tryout" },
      { property: "og:description", content: "Your top homes ranked by household fit." },
    ],
  }),
  component: Page,
});
