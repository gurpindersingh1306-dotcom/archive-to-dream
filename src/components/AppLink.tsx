import { Link, useNavigate } from "@tanstack/react-router";
import type { AnchorHTMLAttributes, ReactNode } from "react";

// Keeps the original href-based linking style on top of TanStack Router.
type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string; children?: ReactNode };

function split(href: string) {
  const [pathAndQuery = "", hash] = href.split("#");
  const [path, query] = pathAndQuery.split("?");
  const search = query ? Object.fromEntries(new URLSearchParams(query)) : undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { to: (path || undefined) as any, ...(hash ? { hash } : {}), ...(search ? { search: search as any } : {}) };
}

export default function AppLink({ href, children, ...rest }: Props) {
  const opts = split(href);
  return (
    <Link {...opts} {...rest}>
      {children}
    </Link>
  );
}

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (href: string) => {
      navigate(split(href));
    },
  };
}
