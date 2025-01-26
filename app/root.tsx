import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
  { rel: "icon", type: "image/png", href: "/favicon.png" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
];

export const meta: MetaFunction = () => {
  return [
    { title: "Radius Impact - Strategic Grid Game" },
    { name: "description", content: "Challenge yourself in this addictive grid-based number game! Reveal values, combine them within radius, and aim for the highest score. Every move counts in this strategic puzzle adventure. Play now!" },
    { property: "og:title", content: "Radius Impact - Strategic Grid Game" },
    { property: "og:description", content: "Challenge yourself in this addictive grid-based number game! Reveal values, combine them within radius, and aim for the highest score. Every move counts in this strategic puzzle adventure. Play now!" },
    { property: "og:image", content: "https://radius-game.onrender.com/images/preview.png" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
