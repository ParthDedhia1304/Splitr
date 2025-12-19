import type { Metadata } from "next";
import "./globals.css";

// We are removing the Google Fonts (Geist) because your network is blocking them.
// The app will now use the default system fonts (Arial, Helvetica, etc.)

export const metadata: Metadata = {
  title: "Splitr",
  description: "Expense sharing made easy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}