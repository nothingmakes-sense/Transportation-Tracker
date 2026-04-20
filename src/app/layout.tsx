import "~/styles/globals.css";
import "leaflet/dist/leaflet.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import Navbar from "./_components/navbar"; // ← NEW

export const metadata: Metadata = {
	title: "Patient Pickup",
	description: "School bus pickup management",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html className={`${geist.variable}`} lang="en">
			<body>
				<Navbar /> {/* ← Global navbar with sign-in / avatar dropdown */}
				<TRPCReactProvider>{children}</TRPCReactProvider>
			</body>
		</html>
	);
}
