"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "~/server/better-auth/client";

// Extend the session user type locally (Best quick + clean fix)
type ExtendedSessionUser = {
	id: string;
	name: string | null;
	email: string;
	image?: string | null;
	role: "admin" | "driver" | "parent" | "user"; // ← your roles
};

type ExtendedSession = {
	user: ExtendedSessionUser;
	session: any; // or import the real session type if you want
};

export default function Navbar() {
	const { data: rawSession, isPending } = authClient.useSession();

	// Cast once for full type safety across the component
	const session = rawSession as ExtendedSession | null;

	const router = useRouter();
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/");
		setDropdownOpen(false);
	};

	const dashboardLink = () => {
		if (!session?.user) return "/";

		switch (session.user.role) {
			case "admin":
				return "/admin";
			case "driver":
				return "/driver";
			case "parent":
				return "/parent";
			default:
				return "/";
		}
	};

	return (
		<nav className="sticky top-0 z-50 flex items-center justify-between border-white/10 border-b bg-[#15162c] px-6 py-4">
			<div className="flex items-center gap-3">
				<Link className="font-bold text-1xl text-[hsl(280,100%,70%)]" href="/">
					Peterson Family Care
				</Link>
				<Link className="hidden text-sm text-white/60 sm:block" href="/">
					Home
				</Link>
				<Link className="hidden text-sm text-white/60 sm:block" href="/about">
					About Us
				</Link>
				<Link
					className="hidden text-sm text-white/60 sm:block"
					href="/services"
				>
					Services
				</Link>
				<Link className="hidden text-sm text-white/60 sm:block" href="/news">
					News & Updates
				</Link>
				<Link className="hidden text-sm text-white/60 sm:block" href="/contact">
					Contact Us
				</Link>
			</div>

			<div className="flex items-center gap-6">
				{isPending ? (
					<div className="text-white/50">Loading...</div>
				) : !session ? (
					<Link
						className="rounded-full bg-white/10 px-6 py-2.5 font-semibold transition hover:bg-white/20"
						href="/login"
					>
						Sign In
					</Link>
				) : (
					<div className="relative">
						<button
							className="flex items-center gap-3 transition-all hover:opacity-80"
							onClick={() => setDropdownOpen(!dropdownOpen)}
						>
							{session.user.image ? (
								<Image
									alt={session.user.name ?? ""}
									className="rounded-full ring-2 ring-white/30"
									height={36}
									src={session.user.image}
									width={36}
								/>
							) : (
								<div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 font-semibold text-xl">
									{session.user.name?.[0]?.toUpperCase() ?? "U"}
								</div>
							)}
							<div className="hidden text-left md:block">
								<div className="font-medium text-white">
									{session.user.name}
								</div>
								<div className="text-white/50 text-xs capitalize">
									{session.user.role}
								</div>
							</div>
							<span className="text-white/60">▼</span>
						</button>

						{dropdownOpen && (
							<div className="absolute right-0 z-50 mt-3 w-64 rounded-2xl border border-white/10 bg-[#2e026d] py-2 shadow-2xl">
								<div className="border-white/10 border-b px-4 py-3">
									<p className="font-semibold">{session.user.name}</p>
									<p className="text-sm text-white/60">{session.user.email}</p>
								</div>
								<Link
									className="block px-4 py-3 transition hover:bg-white/10"
									href={dashboardLink()}
									onClick={() => setDropdownOpen(false)}
								>
									Dashboard
								</Link>
								<button
									className="w-full px-4 py-3 text-left text-red-400 transition hover:bg-white/10"
									onClick={handleSignOut}
								>
									Sign Out
								</button>
							</div>
						)}
					</div>
				)}
				<button
					className="sm:hidden text-white/60 text-3xl"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
				>
					☰
				</button>
			</div>

			{mobileMenuOpen && (
				<div className="absolute top-full left-0 w-full bg-[#15162c] border-b border-white/10 sm:hidden">
					<div className="flex flex-col px-6 py-4">
						<Link
							className="py-2 text-white/80"
							href="/"
							onClick={() => setMobileMenuOpen(false)}
						>
							Home
						</Link>
						<Link
							className="py-2 text-white/80"
							href="/about"
							onClick={() => setMobileMenuOpen(false)}
						>
							About Us
						</Link>
						<Link
							className="py-2 text-white/80"
							href="/services"
							onClick={() => setMobileMenuOpen(false)}
						>
							Services
						</Link>
						<Link
							className="py-2 text-white/80"
							href="/news"
							onClick={() => setMobileMenuOpen(false)}
						>
							News & Updates
						</Link>
						<Link
							className="py-2 text-white/80"
							href="/contact"
							onClick={() => setMobileMenuOpen(false)}
						>
							Contact Us
						</Link>
					</div>
				</div>
			)}
		</nav>
	);
}