import "./globals.css";
import { Inter } from "next/font/google";
import { RootLayoutWrapper } from "@/components/LayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Idara Maheria Ghafooria - Fund Management System",
  description: "Idara Maheria Ghafooria Fund Management System - Islamic Charity Management",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RootLayoutWrapper>
          {children}
        </RootLayoutWrapper>
      </body>
    </html>
  );
}