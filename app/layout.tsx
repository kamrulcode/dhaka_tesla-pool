import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/toast";

export const metadata: Metadata = {
  title: "TeslaPool — Share a Tesla",
  description: "Simple three-seat Tesla pooling app",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-theme="night"><body><ToastProvider>{children}</ToastProvider></body></html>;
}
