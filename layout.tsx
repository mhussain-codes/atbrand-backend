import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = { title: "AT BRAND Store API", description: "Secure server API for AT BRAND store operations" };
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) { return <html lang="en"><body style={{fontFamily:"system-ui",margin:0,padding:32,color:"#172033"}}>{children}</body></html>; }
