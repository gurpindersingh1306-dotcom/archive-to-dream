import { createFileRoute } from "@tanstack/react-router";
import { TrialView } from "@/views/TrialView";

export const Route = createFileRoute("/homes/$id/trial")({
  head: () => ({
    meta: [
      { title: "Book a trial stay | Tryout" },
      { name: "description", content: "Book a trial stay before you sign a lease." },
      { property: "og:title", content: "Book a trial stay | Tryout" },
      { property: "og:description", content: "Book a trial stay before you sign a lease." },
    ],
  }),
  component: () => <TrialView id={Route.useParams().id} />,
});
