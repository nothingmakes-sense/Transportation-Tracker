// app/admin/parents/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { PrismaClient } from "~/../generated/prisma";
import { getSession } from "~/server/better-auth/server";
import AddChildForm from "./AddChildForm";

const prisma = new PrismaClient();

export default async function AdminParents({
	searchParams,
}: {
	searchParams: Promise<{ search?: string }>; // ← Changed to Promise
}) {
	const session = await getSession();
	if (!session?.user || session.user.role !== "admin") redirect("/");

	const { search } = await searchParams; // ← Awaited here
	const searchTerm = search?.trim() || "";

	const parents = await prisma.user.findMany({
		where: {
			role: "parent",
			OR: searchTerm
				? [
						{ name: { contains: searchTerm, mode: "insensitive" } },
						{ email: { contains: searchTerm, mode: "insensitive" } },
						{ phone: { contains: searchTerm, mode: "insensitive" } },
						{ address: { contains: searchTerm, mode: "insensitive" } },
					]
				: undefined,
		},
		include: {
			children: {
				include: { busRoute: { select: { busNumber: true } } },
			},
		},
		orderBy: { name: "asc" },
	});

	const totalChildren = parents.reduce((sum, p) => sum + p.children.length, 0);

	const routes = await prisma.busRoute.findMany({
		select: { id: true, busNumber: true },
	});

	// Server Actions
	const createChild = async (formData: FormData) => {
		"use server";
		const name = formData.get("name") as string;
		const address = formData.get("address") as string;
		const parentId = formData.get("parentId") as string;
		const busRouteId = (formData.get("busRouteId") as string) || undefined;

		await prisma.child.create({
			data: { name, address, parentId, busRouteId },
		});
		redirect("/admin/parents");
	};

	const removeChild = async (formData: FormData) => {
		"use server";
		const childId = formData.get("childId") as string;
		await prisma.child.delete({ where: { id: childId } });
		redirect("/admin/parents");
	};

	const deleteParent = async (formData: FormData) => {
		"use server";
		const parentId = formData.get("parentId") as string;
		await prisma.user.delete({ where: { id: parentId } });
		redirect("/admin/parents");
	};

	return (
		<main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-20 text-white">
			<div className="container mx-auto max-w-6xl px-6 py-12">
				<div className="mb-12 flex items-center justify-between">
					<div>
						<h1 className="font-bold text-5xl tracking-tight">
							Parents &amp; Children
						</h1>
						<p className="mt-2 text-white/60">
							Manage families and their bus assignments
						</p>
					</div>
					<Link
						className="flex items-center gap-2 text-white/70 hover:text-white"
						href="/admin"
					>
						← Dashboard
					</Link>
				</div>

				{/* Stats */}
				<div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
					<div className="rounded-3xl bg-white/10 p-8 text-center">
						<div className="font-bold text-5xl text-[hsl(280,100%,70%)]">
							{parents.length}
						</div>
						<div className="mt-2 text-sm text-white/60">PARENTS</div>
					</div>
					<div className="rounded-3xl bg-white/10 p-8 text-center">
						<div className="font-bold text-5xl text-[hsl(280,100%,70%)]">
							{totalChildren}
						</div>
						<div className="mt-2 text-sm text-white/60">CHILDREN</div>
					</div>
					<div className="rounded-3xl bg-white/10 p-8 text-center">
						<div className="font-bold text-5xl text-[hsl(280,100%,70%)]">
							{parents.filter((p: any) => p.children.length > 0).length}
						</div>
						<div className="mt-2 text-sm text-white/60">ACTIVE FAMILIES</div>
					</div>
				</div>

				{/* Add New Child Form with Auto-fill */}
				<div className="mb-16 rounded-3xl bg-white/10 p-10">
					<h2 className="mb-8 flex items-center gap-3 font-semibold text-3xl">
						➕ Add New Child
					</h2>
					<AddChildForm
						createChild={createChild}
						parents={parents}
						routes={routes}
					/>
				</div>

				{/* Search */}
				<div className="mb-8">
					<form className="flex gap-4">
						<input
							className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-lg placeholder:text-white/50"
							defaultValue={searchTerm}
							name="search"
							placeholder="Search parents by name, email, phone or address..."
						/>
						<button
							className="rounded-2xl bg-white/10 px-10 font-medium transition hover:bg-white/20"
							type="submit"
						>
							Search
						</button>
						{searchTerm && (
							<Link
								className="px-6 py-4 text-white/70 hover:text-white"
								href="/admin/parents"
							>
								Clear
							</Link>
						)}
					</form>
				</div>

				{/* Parent Cards */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
					{parents.length === 0 ? (
						<div className="col-span-full py-20 text-center text-white/50">
							No parents found.
						</div>
					) : (
						parents.map((parent: any) => (
							<div
								className="group rounded-3xl border border-white/10 bg-white/10 p-8 transition-all hover:border-white/30 hover:bg-white/15"
								key={parent.id}
							>
								<div className="mb-6 flex items-start justify-between">
									<div className="flex items-center gap-4">
										<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-4xl">
											👨‍👩‍👧
										</div>
										<div>
											<div className="font-semibold text-2xl">
												{parent.name}
											</div>
											<div className="text-sm text-white/60">
												{parent.email}
											</div>
										</div>
									</div>
									<div className="text-right">
										<div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm">
											<span className="text-emerald-400">●</span>
											{parent.children.length} child
											{parent.children.length !== 1 ? "ren" : ""}
										</div>
									</div>
								</div>

								<div className="mb-8 space-y-1 text-sm text-white/70">
									{parent.phone && <div>📞 {parent.phone}</div>}
									{parent.address && <div>📍 {parent.address}</div>}
								</div>

								<div className="mb-8">
									<div className="mb-3 text-white/50 text-xs uppercase tracking-widest">
										CHILDREN
									</div>
									{parent.children.length > 0 ? (
										<div className="space-y-3">
											{parent.children.map((child: any) => (
												<div
													className="flex items-center justify-between rounded-2xl bg-white/5 px-5 py-4"
													key={child.id}
												>
													<div>
														<div className="font-medium">{child.name}</div>
														<div className="text-white/60 text-xs">
															{child.address}
														</div>
													</div>
													<div className="flex items-center gap-4">
														{child.busRoute && (
															<span className="rounded-full bg-white/10 px-3 py-1 text-xs">
																Bus {child.busRoute.busNumber}
															</span>
														)}
														<form action={removeChild}>
															<input
																name="childId"
																type="hidden"
																value={child.id}
															/>
															<button
																className="font-medium text-red-400 text-sm transition hover:text-red-500"
																type="submit"
															>
																Remove
															</button>
														</form>
													</div>
												</div>
											))}
										</div>
									) : (
										<p className="text-white/50 italic">No children yet</p>
									)}
								</div>

								<form action={deleteParent}>
									<input name="parentId" type="hidden" value={parent.id} />
									<button
										className="w-full rounded-2xl border border-red-400/30 bg-red-500/10 py-4 font-medium text-red-400 transition hover:border-red-400 hover:bg-red-500/20"
										type="submit"
									>
										Delete Parent
									</button>
								</form>
							</div>
						))
					)}
				</div>
			</div>
		</main>
	);
}
