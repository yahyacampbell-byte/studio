
import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { ActivityProvider } from '@/context/ActivityContext';
import { AuthProvider } from '@/context/AuthContext';
import { APP_NAME } from '@/lib/constants';

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: `${APP_NAME} by Firebase Studio`,
  description: `Unlock your cognitive potential with ${APP_NAME}.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          <ActivityProvider>
            {children}
          </ActivityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
