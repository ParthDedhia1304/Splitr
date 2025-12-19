import { ClerkProvider } from '@clerk/nextjs'; // <--- Import this
import './globals.css';
import { Providers } from './providers';

// ... metadata imports ...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider> {/* <--- Wrap everything here */}
      <html lang="en" suppressHydrationWarning>
        <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}