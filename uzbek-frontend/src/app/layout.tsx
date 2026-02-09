import type { Metadata } from "next";
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
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}
