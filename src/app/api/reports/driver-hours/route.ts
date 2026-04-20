// app/api/reports/driver-hours/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "~/../generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const search = searchParams.get("search")?.trim().toLowerCase() || "";

	const shifts = await prisma.driverShift.findMany({
		where: search
			? {
					driver: {
						name: { contains: search, mode: "insensitive" },
					},
				}
			: {},
		include: {
			driver: true,
		},
		orderBy: [{ date: "desc" }, { clockIn: "desc" }],
	});

	const formatted = shifts.map((shift) => {
		let hours = 0;
		if (shift.clockIn && shift.clockOut) {
			hours =
				(shift.clockOut.getTime() - shift.clockIn.getTime()) / (1000 * 60 * 60);
		}

		return {
			id: shift.id,
			driver: shift.driver.name,
			date: shift.date.toISOString().split("T")[0],
			clockIn: shift.clockIn
				? shift.clockIn.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})
				: null,
			clockOut: shift.clockOut
				? shift.clockOut.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})
				: null,
			hours: Math.round(hours * 100) / 100, // 2 decimal places
		};
	});

	return NextResponse.json(formatted);
}
