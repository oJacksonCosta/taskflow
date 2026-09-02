import { Metadata } from "next";
import { Montserrat, Quicksand } from "next/font/google";

// Libraries
import { Toaster } from "react-hot-toast";

// Contexts
import { AuthProvider } from "@/context/auth-contex";
import { ThemeProvider } from "@/context/theme-context";

// Styles
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
});

const quicksand = Quicksand({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bem-vindo ao TaskFlow!",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body
        className={`${quicksand.className} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
