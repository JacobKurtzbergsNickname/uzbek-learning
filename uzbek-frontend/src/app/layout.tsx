import type { Metadata } from "next";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uzbek Learning App",
  description: "A web application for learning Uzbek language",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/uzbekistan-flag.svg" type="image/svg+xml" />
      </head>
      <body>
        <Auth0Provider>
          <Navbar />
          <div id="root">{children}</div>
        </Auth0Provider>
      </body>
    </html>
  );
}
