// app/admin/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "~/server/better-auth/server";

export default async function AdminDashboard() {
	const session = await getSession();
	if (!session?.user || session.user.role !== "admin") redirect("/");

	return (
		<main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-20 text-white">
			<div className="container mx-auto max-w-5xl px-6 py-16">
				<h1 className="mb-4 text-center font-extrabold text-7xl tracking-tighter">
					Admin <span className="text-[hsl(280,100%,70%)]">Dashboard</span>
				</h1>

				<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
					<Link
						className="rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-center"
						href="/admin/users"
					>
						Users & Roles
					</Link>
					<Link
						className="group rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-center hover:bg-white/20"
						href="/admin/routes"
					>
						Routes + Children
					</Link>
					<Link
						className="group rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-center hover:bg-white/20"
						href="/admin/parents"
					>
						Parents & Children
					</Link>
					<Link
						className="group rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-center hover:bg-white/20"
						href="/admin/reports"
					>
						Drivers & Completed Routes
					</Link>
				</div>

				{/* ==================== LIVE FLEET TRACKING (NEW) ==================== */}
				<LiveAdminDashboard />
			</div>
		</main>
	);
}

import LiveAdminDashboard from "~/app/_components/LiveAdminDashboard"; // <-- Import the live admin dashboard component
