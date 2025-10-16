"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"    // Dùng class để đổi theme qua Tailwind
      enableSystem={false} // Không theo hệ thống, chỉ theo defaultTheme
      defaultTheme="light"
    >
      {children}
    </ThemeProvider>
  );
}
