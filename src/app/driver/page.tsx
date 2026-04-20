// app/driver/page.tsx
import { redirect } from "next/navigation";
import { PrismaClient } from "~/../generated/prisma";
import LiveDriverTracker from "~/app/_components/LiveDriverTracket"; // <-- Import the live tracker component
import { getSession } from "~/server/better-auth/server";

const prisma = new PrismaClient();

export default async function DriverPage() {
	const session = await getSession();
	if (!session?.user || session.user.role !== "driver") redirect("/");

	// Reliable UTC today
	const todayStart = new Date(
		Date.UTC(
			new Date().getUTCFullYear(),
			new Date().getUTCMonth(),
			new Date().getUTCDate(),
		),
	);
	// shown on dash
	const shownDate = new Date(
		Date.UTC(
			new Date().getUTCFullYear(),
			new Date().getUTCMonth(),
			new Date().getUTCDate() + 1,
		),
	);

	const todayEnd = new Date(todayStart);
	todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

	const route = await prisma.busRoute.findUnique({
		where: { driverId: session.user.id },
		include: {
			children: {
				include: {
					absenceNotices: {
						where: {
							date: {
								gte: todayStart,
								lt: todayEnd,
							},
						},
					},
					pickupRecords: {
						where: {
							date: {
								gte: todayStart,
								lt: todayEnd,
							},
						},
					},
				},
			},
		},
	});

	if (!route) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-20 text-white">
				<div className="text-center text-2xl">
					No route assigned yet. Contact admin.
				</div>
			</main>
		);
	}

	// Mark Picked Up
	const markPickedUp = async (formData: FormData) => {
		"use server";
		const childId = formData.get("childId") as string;
		const sess = await getSession();
		if (!sess?.user) redirect("/login");

		const todayDate = new Date();
		todayDate.setHours(0, 0, 0, 0);

		await prisma.pickupRecord.upsert({
			where: { childId_date: { childId, date: todayDate } },
			update: {
				pickedUp: true,
				pickedAt: new Date(),
				pickedById: sess.user.id,
			},
			create: {
				childId,
				date: todayDate,
				pickedUp: true,
				pickedAt: new Date(),
				pickedById: sess.user.id,
			},
		});
		redirect("/driver");
	};

	// Undo Pick Up
	const undoPickup = async (formData: FormData) => {
		"use server";
		const childId = formData.get("childId") as string;

		const todayDate = new Date();
		todayDate.setHours(0, 0, 0, 0);

		await prisma.pickupRecord.update({
			where: { childId_date: { childId, date: todayDate } },
			data: { pickedUp: false, pickedAt: null, pickedById: null },
		});
		redirect("/driver");
	};

	// Get today's shift
	const shift = await prisma.driverShift.findUnique({
		where: {
			driverId_date: {
				driverId: session.user.id,
				date: todayStart,
			},
		},
	});

// ==================== FIXED ====================
	const isClockedIn = !!shift?.clockIn && !shift?.clockOut; // ← Now correctly becomes false after clock-out
	const isCompleted = !!shift?.clockOut;
	// ===============================================

	// Clock In Action
	const clockIn = async () => {
		"use server";
		const sess = await getSession();
		if (!sess?.user) redirect("/login");

		const todayDate = new Date(
			Date.UTC(
				new Date().getUTCFullYear(),
				new Date().getUTCMonth(),
				new Date().getUTCDate(),
			),
		);

		await prisma.driverShift.upsert({
			where: { driverId_date: { driverId: sess.user.id, date: todayDate } },
			update: { clockIn: new Date() },
			create: {
				driverId: sess.user.id,
				date: todayDate,
				clockIn: new Date(),
				routeId: route?.id,
			},
		});
		redirect("/driver");
	};

	// Clock Out Action
	const clockOut = async () => {
		"use server";
		const sess = await getSession();
		if (!sess?.user) redirect("/login");

		const todayDate = new Date(
			Date.UTC(
				new Date().getUTCFullYear(),
				new Date().getUTCMonth(),
				new Date().getUTCDate(),
			),
		);

		await prisma.driverShift.update({
			where: { driverId_date: { driverId: sess.user.id, date: todayDate } },
			data: { clockOut: new Date(), completed: true },
		});
		redirect("/driver");
	};

	return (
		<main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-20 text-white">
			<div className="container mx-auto px-6 py-12">
				<h1 className="mb-4 font-bold text-5xl">
					Bus {route.busNumber} – Today
				</h1>
				<p className="mb-10 text-white/70 text-xl">
					{shownDate.toLocaleDateString("en-US", {
						weekday: "long",
						month: "long",
						day: "numeric",
						year: "numeric",
					})}
				</p>

				{/* ==================== CLOCK IN / OUT SECTION ==================== */}
				<div className="mb-12 flex flex-col items-center justify-between gap-6 rounded-3xl bg-white/10 p-8 md:flex-row">
					<div>
						<div className="font-semibold text-2xl">Driver Shift</div>
						<div className="mt-1 text-white/70">
							{isCompleted
								? "✅ Shift Completed"
								: isClockedIn
									? "⏳ Clocked In – Working"
									: "Not started yet"}
						</div>
					</div>

					<div className="flex gap-4">
						{!isClockedIn && (
							<form action={clockIn}>
								<button
									className="rounded-2xl bg-green-600 px-12 py-4 font-semibold text-lg transition hover:bg-green-700"
									type="submit"
								>
									Clock In Now
								</button>
							</form>
						)}

						{isClockedIn && !isCompleted && (
							<form action={clockOut}>
								<button
									className="rounded-2xl bg-red-600 px-12 py-4 font-semibold text-lg transition hover:bg-red-700"
									type="submit"
								>
									Clock Out
								</button>
							</form>
						)}

						{isCompleted && shift?.clockOut && (
							<div className="font-medium text-green-400">
								Finished at{" "}
								{shift.clockOut.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
						)}
					</div>
				</div>

				{/* ==================== LIVE LOCATION TRACKING (NEW) ==================== */}
				<LiveDriverTracker
					busNumber={route.busNumber}
					driverId={session.user.id}
					isClockedIn={isClockedIn}
				/>

				{/* ==================== CHILDREN LIST ==================== */}
				<div className="space-y-6">
					{route.children.length === 0 ? (
						<div className="py-20 text-center text-white/60 text-xl">
							No children assigned to this route yet.
						</div>
					) : (
						route.children.map((child) => {
							const absence = child.absenceNotices[0];
							const willPickup = absence ? absence.willPickup : true;
							const pickup = child.pickupRecords[0];
							const pickedUp = pickup?.pickedUp ?? false;

							return (
								<div
									className={`flex flex-col justify-between gap-6 rounded-3xl bg-white/10 p-8 transition-all md:flex-row md:items-center ${
										!willPickup ? "opacity-50" : ""
									}`}
									key={child.id}
								>
									<div className="flex-1">
										<div className="mb-1 font-semibold text-2xl">
											{child.name}
										</div>

										<a
											className="flex items-center gap-2 text-blue-400 text-lg hover:text-blue-300 hover:underline"
											href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(child.address)}`}
											rel="noopener noreferrer"
											target="_blank"
										>
											📍 {child.address}
										</a>

										{!willPickup && (
											<div className="mt-3 text-red-400">
												24-hour notice – Not expected today
											</div>
										)}
										{pickedUp && pickup?.pickedAt && (
											<div className="mt-3 flex items-center gap-2 text-green-400">
												✓ Picked up at{" "}
												{pickup.pickedAt.toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</div>
										)}
									</div>

									<div className="flex flex-col gap-3 sm:flex-row">
										{willPickup && !pickedUp && (
											<form action={markPickedUp}>
												<input name="childId" type="hidden" value={child.id} />
												<button
													className="whitespace-nowrap rounded-2xl bg-green-500 px-10 py-4 font-semibold text-lg transition hover:bg-green-600"
													type="submit"
												>
													Mark Picked Up
												</button>
											</form>
										)}

										{pickedUp && (
											<form action={undoPickup}>
												<input name="childId" type="hidden" value={child.id} />
												<button
													className="whitespace-nowrap rounded-2xl border border-red-400/50 bg-red-500/10 px-8 py-4 font-semibold text-red-400 transition hover:border-red-400 hover:bg-red-500/20"
													type="submit"
												>
													Undo Check-In
												</button>
											</form>
										)}
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>
		</main>
	);
}
