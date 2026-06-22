import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PageClient } from "@/app/PageClient";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "@/app/globals.css";
import "./fonts.css";

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <StrictMode>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <PageClient />
        <Toaster />
      </ThemeProvider>
    </StrictMode>,
  );
}
