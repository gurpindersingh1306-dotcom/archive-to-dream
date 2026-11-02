import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Locality";

export const Route = createFileRoute("/locality")({
  validateSearch: (s: Record<string, unknown>) => ({ area: typeof s.area === "string" ? s.area : undefined }),
  head: () => ({
    meta: [
      { title: "Locality intelligence | Tryout" },
      { name: "description", content: "Hospitals, police, transit, drainage, lighting and flooding mapped around Bengaluru homes." },
      { property: "og:title", content: "Locality intelligence | Tryout" },
      { property: "og:description", content: "Know the street before you sign: civic and safety data around every home." },
    ],
  }),
  component: LocalityRoute,
});

function LocalityRoute() {
  const { area } = Route.useSearch();
  return <Page initialArea={area} />;
}
