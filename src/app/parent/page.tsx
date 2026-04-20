// app/parent/page.tsx
import { redirect } from "next/navigation";
import { PrismaClient } from "~/../generated/prisma";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";

const prisma = new PrismaClient();

export default async function ParentPage() {
	const session = await getSession();
	if (!session?.user || session.user.role !== "parent") redirect("/");

	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(0, 0, 0, 0);

	const children = await prisma.child.findMany({
		where: { parentId: session.user.id },
		include: {
			busRoute: true,
			absenceNotices: { where: { date: tomorrow } },
		},
	});

	const toggleNotice = async (formData: FormData) => {
		"use server";
		const childId = formData.get("childId") as string;
		const willPickup = formData.get("willPickup") === "true";
		const sess = await getSession();
		if (!sess) redirect("/login");

		const tmr = new Date();
		tmr.setDate(tmr.getDate() + 1);
		tmr.setHours(0, 0, 0, 0);

		await prisma.absenceNotice.upsert({
			where: { childId_date: { childId, date: tmr } },
			update: { willPickup },
			create: { childId, date: tmr, willPickup },
		});
		redirect("/parent");
	};

	const updateParentInfo = async (formData: FormData) => {
		"use server";
		const address = formData.get("address") as string;
		const phone = formData.get("phone") as string;

		await prisma.user.update({
			where: { id: session.user.id },
			data: { address, phone },
		});
		redirect("/parent?success=Profile updated");
	};

	const changePassword = async (formData: FormData) => {
		"use server";
		const currentPassword = formData.get("currentPassword") as string;
		const newPassword = formData.get("newPassword") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		if (newPassword !== confirmPassword) {
			redirect("/parent?error=Passwords do not match");
		}

		try {
			await auth.api.changePassword({
				body: { currentPassword, newPassword },
			});
			redirect("/parent?success=Password changed successfully");
		} catch (err) {
			redirect("/parent?error=Current password is incorrect");
		}
	};

	const addChild = async (formData: FormData) => {
		"use server";
		const name = formData.get("name") as string;
		const address = formData.get("address") as string;

		await prisma.child.create({
			data: { name, address, parentId: session.user.id },
		});
		redirect("/parent?success=Child added");
	};

	const updateChildAddress = async (formData: FormData) => {
		"use server";
		const childId = formData.get("childId") as string;
		const address = formData.get("address") as string;

		await prisma.child.update({
			where: { id: childId },
			data: { address },
		});
		redirect("/parent?success=Child address updated");
	};

	const removeChild = async (formData: FormData) => {
		"use server";
		const childId = formData.get("childId") as string;
		await prisma.child.delete({ where: { id: childId } });
		redirect("/parent?success=Child removed");
	};

	return (
		<main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-20 text-white">
			<div className="container mx-auto px-6 py-12">
				<h1 className="mb-4 font-bold text-5xl">Parent Dashboard</h1>
				<p className="mb-10 text-white/70 text-xl">
					24-hour notice for tomorrow ({tomorrow.toLocaleDateString()})
				</p>

				{children.length === 0 && <p>You have no children registered yet.</p>}

				{/* ==================== LIVE DRIVER LOCATIONS FOR PARENT (NEW) ==================== */}
				<div>
					{" "}
					<LiveParentLocations children={children} />
				</div>

				<div className="space-y-8">
					{children.map((child) => {
						const notice = child.absenceNotices[0];
						const willPickup = notice ? notice.willPickup : true;

						return (
							<div className="rounded-3xl bg-white/10 p-8" key={child.id}>
								<div className="flex items-start justify-between">
									<div>
										<div className="font-semibold text-2xl">{child.name}</div>
										<div className="text-white/70">{child.address}</div>
										{child.busRoute && (
											<div className="mt-2 text-sm">
												Bus {child.busRoute.busNumber}
											</div>
										)}
									</div>

									<form action={toggleNotice}>
										<input name="childId" type="hidden" value={child.id} />
										<input
											name="willPickup"
											type="hidden"
											value={(!willPickup).toString()}
										/>
										<button
											className={`rounded-2xl px-8 py-4 font-semibold text-lg transition ${
												willPickup
													? "bg-red-500 hover:bg-red-600"
													: "bg-green-500 hover:bg-green-600"
											}`}
											type="submit"
										>
											{willPickup
												? "Give notice – NOT picking up tomorrow"
												: "Will be picked up tomorrow"}
										</button>
									</form>
								</div>

								{!willPickup && (
									<p className="mt-6 text-sm text-yellow-400">
										✓ Child will be greyed out for the driver tomorrow
									</p>
								)}
							</div>
						);
					})}
				</div>

				{/* ==================== PARENT PROFILE & CHILD MANAGEMENT ==================== */}
				<div className="mt-16 mb-12 rounded-3xl bg-white/10 p-10">
					<h2 className="mb-8 font-semibold text-3xl">My Information</h2>

					<form
						action={updateParentInfo}
						className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2"
					>
						<input
							className="rounded-2xl border border-white/20 bg-[#2e026d] px-6 py-5 text-white placeholder:text-white/50 focus:border-[hsl(280,100%,70%)] focus:outline-none"
							defaultValue={session.user.phone || ""}
							name="phone"
							placeholder="Phone Number"
						/>
						<input
							className="rounded-2xl border border-white/20 bg-[#2e026d] px-6 py-5 text-white placeholder:text-white/50 focus:border-[hsl(280,100%,70%)] focus:outline-none"
							defaultValue={session.user.address || ""}
							name="address"
							placeholder="Your Home Address"
						/>
						<button
							className="rounded-2xl bg-[hsl(280,100%,70%)] py-5 font-semibold text-lg transition hover:bg-[hsl(280,100%,80%)] md:col-span-2"
							type="submit"
						>
							Update My Information
						</button>
					</form>

					{/* Change Password */}
					<h3 className="mb-6 font-semibold text-xl">Change Password</h3>
					<form
						action={changePassword}
						className="grid grid-cols-1 gap-6 md:grid-cols-3"
					>
						<input
							className="rounded-2xl border border-white/20 bg-[#2e026d] px-6 py-5 text-white placeholder:text-white/50 focus:border-[hsl(280,100%,70%)] focus:outline-none"
							name="currentPassword"
							placeholder="Current Password"
							required
							type="password"
						/>
						<input
							className="rounded-2xl border border-white/20 bg-[#2e026d] px-6 py-5 text-white placeholder:text-white/50 focus:border-[hsl(280,100%,70%)] focus:outline-none"
							name="newPassword"
							placeholder="New Password"
							required
							type="password"
						/>
						<input
							className="rounded-2xl border border-white/20 bg-[#2e026d] px-6 py-5 text-white placeholder:text-white/50 focus:border-[hsl(280,100%,70%)] focus:outline-none"
							name="confirmPassword"
							placeholder="Confirm New Password"
							required
							type="password"
						/>
						<button
							className="rounded-2xl bg-white/10 py-5 font-semibold hover:bg-white/20 md:col-span-3"
							type="submit"
						>
							Change Password
						</button>
					</form>
				</div>

				{/* ==================== MY CHILDREN ==================== */}
				<div className="rounded-3xl bg-white/10 p-10">
					<h2 className="mb-8 font-semibold text-3xl">My Children</h2>

					{/* Add New Child */}
					<div className="mb-12 rounded-2xl bg-white/5 p-8">
						<h3 className="mb-6 text-xl">Add New Child</h3>
						<form
							action={addChild}
							className="grid grid-cols-1 gap-6 md:grid-cols-12"
						>
							<input
								className="rounded-2xl border border-white/20 bg-[#2e026d] px-6 py-5 text-white placeholder:text-white/50 focus:border-[hsl(280,100%,70%)] focus:outline-none md:col-span-5"
								name="name"
								placeholder="Child's Full Name"
								required
							/>
							<input
								className="rounded-2xl border border-white/20 bg-[#2e026d] px-6 py-5 text-white placeholder:text-white/50 focus:border-[hsl(280,100%,70%)] focus:outline-none md:col-span-5"
								name="address"
								placeholder="Pickup Address"
								required
							/>
							<button
								className="rounded-2xl bg-green-600 py-5 font-semibold hover:bg-green-700 md:col-span-2"
								type="submit"
							>
								Add Child
							</button>
						</form>
					</div>

					{/* Children List */}
					{children.length === 0 ? (
						<p className="py-12 text-center text-lg text-white/60">
							You have no children registered yet.
						</p>
					) : (
						<div className="space-y-8">
							{children.map((child) => (
								<div
									className="flex flex-col gap-8 rounded-3xl bg-white/5 p-8 lg:flex-row"
									key={child.id}
								>
									<div className="flex-1">
										<div className="font-semibold text-2xl">{child.name}</div>
										<div className="mt-2 text-white/70">{child.address}</div>
										{child.busRoute && (
											<div className="mt-3 text-sm text-white/60">
												Bus {child.busRoute.busNumber}
											</div>
										)}
									</div>

									{/* Edit Child Address */}
									<form action={updateChildAddress} className="flex-1">
										<input name="childId" type="hidden" value={child.id} />
										<input
											className="w-full rounded-2xl border border-white/20 bg-[#2e026d] px-6 py-5 text-white placeholder:text-white/50 focus:border-[hsl(280,100%,70%)] focus:outline-none"
											defaultValue={child.address}
											name="address"
											placeholder="Update pickup address"
										/>
										<button
											className="mt-4 w-full rounded-2xl bg-white/10 py-4 font-medium hover:bg-white/20"
											type="submit"
										>
											Update Address
										</button>
									</form>

									{/* Remove Child */}
									<form action={removeChild} className="lg:w-48">
										<button
											className="w-full rounded-2xl border border-red-400 bg-red-500/10 py-4 font-medium text-red-400 transition hover:bg-red-500/20"
											type="submit"
										>
											Remove Child
										</button>
									</form>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</main>
	);
}

import LiveParentLocations from "~/app/_components/LiveParentLocations"; // <-- Import the live parent locations component
