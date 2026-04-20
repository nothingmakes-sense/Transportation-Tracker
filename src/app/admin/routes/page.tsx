// app/admin/routes/page.tsx
import { redirect } from "next/navigation";
import { PrismaClient } from "~/../generated/prisma";
import { getSession } from "~/server/better-auth/server";
import AssignableChildrenTable from "./AssignableChildrenTable";

const prisma = new PrismaClient();

export default async function AdminRoutes({
	searchParams,
}: {
	searchParams: Promise<{ search?: string }>;
}) {
	const session = await getSession();
	if (!session?.user || session.user.role !== "admin") redirect("/");

	const { search } = await searchParams;
	const searchTerm = search?.trim().toLowerCase() || "";

	const routes = await prisma.busRoute.findMany({
		include: {
			driver: { select: { id: true, name: true } },
			children: { include: { parent: { select: { name: true } } } },
		},
		orderBy: { busNumber: "asc" },
	});

	const drivers = await prisma.user.findMany({
		where: { role: "driver" },
		select: { id: true, name: true },
	});

	const unassignedChildren = await prisma.child.findMany({
		where: { busRouteId: null },
		include: { parent: { select: { name: true } } },
	});

	// Filter by Bus Number or Driver Name
	const filteredRoutes = routes.filter(
		(route) =>
			!searchTerm ||
			route.busNumber.toLowerCase().includes(searchTerm) ||
			route.driver.name.toLowerCase().includes(searchTerm),
	);

	// Server Actions
	const createRoute = async (formData: FormData) => {
		"use server";
		const busNumber = formData.get("busNumber") as string;
		const driverId = formData.get("driverId") as string;
		await prisma.busRoute.create({ data: { busNumber, driverId } });
		redirect("/admin/routes");
	};

	const removeChild = async (formData: FormData) => {
		"use server";
		const childId = formData.get("childId") as string;
		await prisma.child.update({
			where: { id: childId },
			data: { busRouteId: null },
		});
		redirect("/admin/routes");
	};

	const deleteRoute = async (formData: FormData) => {
		"use server";
		const routeId = formData.get("routeId") as string;
		await prisma.child.updateMany({
			where: { busRouteId: routeId },
			data: { busRouteId: null },
		});
		await prisma.busRoute.delete({ where: { id: routeId } });
		redirect("/admin/routes");
	};

	const assignMultiple = async (routeId: string, childIds: string[]) => {
		"use server";
		for (const childId of childIds) {
			await prisma.child.update({
				where: { id: childId },
				data: { busRouteId: routeId },
			});
		}
		redirect("/admin/routes");
	};

	return (
		<main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-20 text-white">
			<div className="container mx-auto max-w-6xl px-6 py-12">
				<div className="mb-12 flex items-center justify-between">
					<h1 className="font-bold text-5xl">Routes &amp; Children</h1>
					<a className="text-white/70 hover:text-white" href="/admin">
						← Dashboard
					</a>
				</div>

				{/* Create New Route */}
				<div className="mb-16 rounded-3xl bg-white/10 p-10">
					<h2 className="mb-8 font-semibold text-3xl">Create New Route</h2>
					<form
						action={createRoute}
						className="flex flex-col gap-6 md:flex-row"
					>
						<input
							className="flex-1 rounded-2xl border border-white/20 bg-[#2e026d] px-8 py-5 text-white placeholder:text-white/50 focus:border-[hsl(280,100%,70%)] focus:outline-none"
							name="busNumber"
							placeholder="Bus Number (e.g. BUS-42)"
							required
						/>
						<select
							className="appearance-none rounded-2xl border border-white/20 bg-[#2e026d] px-8 py-5 text-white focus:border-[hsl(280,100%,70%)] focus:outline-none"
							name="driverId"
							required
						>
							<option className="bg-[#2e026d] text-white" value="">
								Select Driver
							</option>
							{drivers.map((d) => (
								<option
									className="bg-[#2e026d] text-white"
									key={d.id}
									value={d.id}
								>
									{d.name}
								</option>
							))}
						</select>
						<button
							className="rounded-2xl bg-[hsl(280,100%,70%)] px-12 py-5 font-semibold"
							type="submit"
						>
							Create Route
						</button>
					</form>
				</div>
				{/* Search Bar */}
				<form className="mb-10 flex gap-4">
					<input
						className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-lg placeholder:text-white/50 focus:border-[hsl(280,100%,70%)] focus:outline-none"
						defaultValue={search}
						name="search"
						placeholder="Search by bus number or driver name..."
					/>
					<button
						className="rounded-2xl bg-[hsl(280,100%,70%)] px-10 font-medium"
						type="submit"
					>
						Search
					</button>
					{search && (
						<a
							className="px-6 py-4 text-white/70 hover:text-white"
							href="/admin/routes"
						>
							Clear
						</a>
					)}
				</form>
				{filteredRoutes.length === 0 ? (
					<p className="py-20 text-center text-white/50">
						No routes match your search.
					</p>
				) : (
					filteredRoutes.map((route) => (
						<div className="mb-12 rounded-3xl bg-white/10 p-10" key={route.id}>
							<div className="mb-10 flex justify-between">
								<div>
									<h3 className="font-bold text-4xl">Bus {route.busNumber}</h3>
									<p className="text-white/70 text-xl">
										Driver: {route.driver.name}
									</p>
								</div>
								<form action={deleteRoute}>
									<input name="routeId" type="hidden" value={route.id} />
									<button
										className="text-red-400 hover:text-red-500"
										type="submit"
									>
										Delete Route
									</button>
								</form>
							</div>

							{/* Assigned Children Table */}
							{route.children.length > 0 ? (
								<table className="mb-10 w-full">
									<thead>
										<tr className="border-white/20 border-b">
											<th className="pb-5 text-left">Child</th>
											<th className="pb-5 text-left">Address</th>
											<th className="pb-5 text-left">Parent</th>
											<th className="w-32 pb-5">Action</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-white/10">
										{route.children.map((child) => (
											<tr key={child.id}>
												<td className="py-6 font-medium">{child.name}</td>
												<td className="py-6 text-white/70">{child.address}</td>
												<td className="py-6 text-white/70">
													{child.parent.name}
												</td>
												<td className="py-6">
													<form action={removeChild}>
														<input
															name="childId"
															type="hidden"
															value={child.id}
														/>
														<button
															className="text-red-400 hover:underline"
															type="submit"
														>
															Remove
														</button>
													</form>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							) : (
								<p className="mb-10 text-white/50">No children assigned yet.</p>
							)}

							{/* Assign Children */}
							<div className="mt-12">
								<h4 className="mb-6 font-semibold text-2xl">
									Add Children to Bus {route.busNumber}
								</h4>
								<AssignableChildrenTable
									assignAction={assignMultiple}
									routeId={route.id}
									unassigned={unassignedChildren}
								/>
							</div>
						</div>
					))
				)}
			</div>
		</main>
	);
}
