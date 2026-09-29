import "./globals.css"; import {ReactNode} from "react";
export const metadata={title:"SHSB Student",description:"A simpler interface for school information."};
export default function RootLayout({children}:{children:ReactNode}){return <html lang="en"><body>{children}</body></html>}