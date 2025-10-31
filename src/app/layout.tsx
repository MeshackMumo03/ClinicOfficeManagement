// Import necessary types and components from Next.js and local files.
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';

// Metadata for the application, including title and description.
export const metadata: Metadata = {
  title: 'ClinicOffice Manager',
  description: 'A secure, cloud-based Doctor Office Management System',
};

/**
 * RootLayout component that serves as the main layout for all pages.
 * It includes the Firebase provider, toaster for notifications, and global styles.
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts for performance. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Import custom fonts from Google Fonts. */}
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {/* Wrap the application with the FirebaseClientProvider to make Firebase services available. */}
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        {/* Toaster component to display notifications. */}
        <Toaster />
      </body>
    </html>
  );
}
