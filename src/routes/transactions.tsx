import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Transactions";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions & invoices | Tryout" },
      { name: "description", content: "Rent, deposits, refunds, bills and invoices for tenants and landlords in one place." },
      { property: "og:title", content: "Transactions & invoices | Tryout" },
      { property: "og:description", content: "Rent, deposits, refunds, bills and invoices for tenants and landlords." },
    ],
  }),
  component: Page,
});
