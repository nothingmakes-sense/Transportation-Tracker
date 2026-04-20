// app/admin/users/page.tsx
import { redirect } from "next/navigation";
import { PrismaClient } from "~/../generated/prisma";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";

const prisma = new PrismaClient();

export default async function AdminUsers({
	searchParams,
}: {
	searchParams: Promise<{ search?: string; error?: string }>;
}) {
	const session = await getSession();
	if (!session?.user || session.user.role !== "admin") redirect("/");

	const { search, error } = await searchParams;
	const searchTerm = search?.trim() || "";

	const users = await prisma.user.findMany({
		where: searchTerm
			? {
					OR: [
						{ name: { contains: searchTerm, mode: "insensitive" } },
						{ email: { contains: searchTerm, mode: "insensitive" } },
						{ phone: { contains: searchTerm, mode: "insensitive" } },
						{ address: { contains: searchTerm, mode: "insensitive" } },
					],
				}
			: {},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			phone: true,
			address: true,
			image: true,
		},
		orderBy: { name: "asc" },
	});

	const createUser = async (formData: FormData) => {
		"use server";
		const name = formData.get("name") as string;
		const email = (formData.get("email") as string).toLowerCase().trim();
		const password = formData.get("password") as string;
		const role = formData.get("role") as string;
		const phone = (formData.get("phone") as string) || null;
		const address = (formData.get("address") as string) || null;

		if (password.length < 12) {
			redirect(
				"/admin/users?error=Password must be at least 12 characters long",
			);
		}

		try {
			await auth.api.signUpEmail({ body: { name, email, password } });
			await prisma.user.update({
				where: { email },
				data: { role, phone, address, emailVerified: true },
			});
			redirect("/admin/users");
		} catch (err: any) {
			if (err.digest?.includes("NEXT_REDIRECT")) throw err;

			const msg =
				err.message?.toLowerCase().includes("already") ||
				err.status === 409 ||
				err.code === "USER_ALREADY_EXISTS" ||
				err.message?.includes("duplicate")
					? "Email already exists"
					: "Failed to create user. Please try again.";

			redirect(`/admin/users?error=${encodeURIComponent(msg)}`);
		}
	};

	const deleteUser = async (formData: FormData) => {
		"use server";
		const id = formData.get("id") as string;

		if (id === session.user.id) {
			redirect("/admin/users?error=You cannot delete yourself");
		}

		// Prevent deleting a driver who still has a route
		const user = await prisma.user.findUnique({
			where: { id },
			select: { role: true, driverRoute: true },
		});

		if (user?.role === "driver" && user.driverRoute) {
			redirect(
				"/admin/users?error=Cannot delete this driver - they are assigned to a bus route. Delete the route first.",
			);
		}

		await prisma.user.delete({ where: { id } });
		redirect("/admin/users");
	};

	const updateRole = async (formData: FormData) => {
		"use server";
		const userId = formData.get("userId") as string;
		const role = formData.get("role") as string;
		await prisma.user.update({ where: { id: userId }, data: { role } });
		redirect("/admin/users");
	};

	return (
		<main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-20 text-white">
			<div className="container mx-auto max-w-6xl px-6 py-12">
				<div className="mb-12 flex justify-between">
					<h1 className="font-bold text-5xl">Users</h1>
					<a className="text-white/70 hover:text-white" href="/admin">
						← Dashboard
					</a>
				</div>

				{/* Error Banner */}
				{error && (
					<div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/20 p-4 text-center text-red-300">
						{error}
					</div>
				)}

				{/* Create User Form */}
				<div className="mb-12 rounded-3xl bg-white/10 p-10">
					<h2 className="mb-8 font-semibold text-3xl">Add New User</h2>
					<form
						action={createUser}
						className="grid grid-cols-1 gap-6 md:grid-cols-3"
					>
						<input
							className="rounded-2xl border border-white/20 bg-[#2e026d] px-6 py-5 text-white placeholder:text-white/50 focus:border-[hsl(280,100%,70%)] focus:outline-none"
							name="name"
							placeholder="Full Name"
							required
						/>
						<input
							className="rounded-2xl border border-white/20 bg-[#2e026d] px-6 py-5 text-white placeholder:text-white/50 focus:border-[hsl(280,100%,70%)] focus:outline-none"
							name="email"
							placeholder="email@domain.com"
							required
							type="email"
						/>
						<input
							className="rounded-2xl border border-white/20 bg-[#2e026d] px-6 py-5 text-white placeholder:text-white/50 focus:border-[hsl(280,100%,70%)] focus:outline-none"
							minLength={12}
							name="password"
							placeholder="Password"
							required
							type="password"
						/>

						<select
							className="appearance-none rounded-2xl border border-white/20 bg-[#2e026d] px-6 py-5 text-white focus:border-[hsl(280,100%,70%)] focus:outline-none"
							name="role"
							required
						>
							<option className="bg-[#2e026d] text-white" value="">
								Select Role
							</option>
							<option className="bg-[#2e026d] text-white" value="parent">
								Parent
							</option>
							<option className="bg-[#2e026d] text-white" value="driver">
								Driver
							</option>
							<option className="bg-[#2e026d] text-white" value="admin">
								Admin
							</option>
						</select>

						<input
							className="rounded-2xl border border-white/20 bg-[#2e026d] px-6 py-5 text-white placeholder:text-white/50 focus:border-[hsl(280,100%,70%)] focus:outline-none"
							name="phone"
							placeholder="Phone (555) 123-4567"
						/>
						<input
							className="rounded-2xl border border-white/20 bg-[#2e026d] px-6 py-5 text-white placeholder:text-white/50 focus:border-[hsl(280,100%,70%)] focus:outline-none md:col-span-2"
							name="address"
							placeholder="Address"
						/>

						<button
							className="rounded-2xl bg-[hsl(280,100%,70%)] py-5 font-semibold text-lg transition hover:bg-[hsl(280,100%,80%)] md:col-span-3"
							type="submit"
						>
							Create User
						</button>
					</form>
				</div>

				{/* Search */}
				<form className="mb-8 flex gap-4">
					<input
						className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-lg placeholder:text-white/50"
						defaultValue={searchTerm}
						name="search"
						placeholder="Search name, email, phone, or address..."
					/>
					<button
						className="rounded-2xl bg-[hsl(280,100%,70%)] px-10"
						type="submit"
					>
						Search
					</button>
					{searchTerm && (
						<a className="px-6 py-4 text-white/70" href="/admin/users">
							Clear
						</a>
					)}
				</form>

				{/* Users Table */}
				<div className="overflow-hidden rounded-3xl bg-white/10">
					<table className="w-full">
						<thead className="bg-white/5">
							<tr>
								<th className="p-6 text-left">User</th>
								<th className="p-6 text-left">Contact</th>
								<th className="p-6 text-left">Role</th>
								<th className="w-56 p-6">Actions</th>
							</tr>
						</thead>
						<tbody>
							{users.map((u: any) => (
								<tr
									className="border-white/10 border-b last:border-0 hover:bg-white/5"
									key={u.id}
								>
									<td className="p-6">{u.name}</td>
									<td className="p-6 text-white/70">
										{u.email}
										<br />
										{u.phone && <span className="text-sm">📞 {u.phone}</span>}
										<br />
										{u.address && (
											<span className="text-sm">📍 {u.address}</span>
										)}
									</td>
									<td className="p-6">
										<form action={updateRole}>
											<input name="userId" type="hidden" value={u.id} />
											<select
												className="rounded-2xl border border-white/20 bg-[#2e026d] px-5 py-2 text-white focus:border-[hsl(280,100%,70%)] focus:outline-none"
												defaultValue={u.role}
												name="role"
											>
												<option
													className="bg-[#2e026d] text-white"
													value="parent"
												>
													Parent
												</option>
												<option
													className="bg-[#2e026d] text-white"
													value="driver"
												>
													Driver
												</option>
												<option
													className="bg-[#2e026d] text-white"
													value="admin"
												>
													Admin
												</option>
											</select>
											<button className="ml-3 text-xs underline" type="submit">
												Update
											</button>
										</form>
									</td>
									<td className="p-6">
										<form action={deleteUser}>
											<input name="id" type="hidden" value={u.id} />
											<button
												className="text-red-400 hover:text-red-500"
												type="submit"
											>
												Delete
											</button>
										</form>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</main>
	);
}
