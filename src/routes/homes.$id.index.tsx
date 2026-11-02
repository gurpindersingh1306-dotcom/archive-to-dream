import { createFileRoute } from "@tanstack/react-router";
import { ListingView } from "@/components/ListingView";

export const Route = createFileRoute("/homes/$id/")({
  head: () => ({
    meta: [
      { title: "Home details | Tryout" },
      { name: "description", content: "See how well this home and its flatmates fit you before you book a trial stay." },
      { property: "og:title", content: "Home details | Tryout" },
      { property: "og:description", content: "See how well this home and its flatmates fit you." },
    ],
  }),
  component: () => <ListingView id={Route.useParams().id} />,
});
