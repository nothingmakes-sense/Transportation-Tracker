// app/api/reports/pickups/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "~/../generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const dateStr = searchParams.get("date"); // e.g. "2025-02-25"
	const search = searchParams.get("search")?.trim().toLowerCase() || "";

	if (!dateStr) {
		return NextResponse.json(
			{ error: "Date parameter is required" },
			{ status: 400 },
		);
	}

	// Parse as UTC midnight to match how we save in Driver page
	const startOfDay = new Date(dateStr + "T00:00:00Z");
	const endOfDay = new Date(startOfDay);
	endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

	const records = await prisma.pickupRecord.findMany({
		where: {
			date: {
				gte: startOfDay,
				lt: endOfDay,
			},
			...(search && {
				OR: [
					{ child: { name: { contains: search, mode: "insensitive" } } },
					{
						child: {
							busRoute: {
								busNumber: { contains: search, mode: "insensitive" },
							},
						},
					},
				],
			}),
		},
		include: {
			child: {
				include: {
					busRoute: true,
				},
			},
		},
		orderBy: [
			{ child: { busRoute: { busNumber: "asc" } } },
			{ child: { name: "asc" } },
		],
	});

	const formatted = records.map((r) => ({
		id: r.id,
		date: dateStr, // Always show the date the user selected
		busNumber: r.child.busRoute?.busNumber || "Unassigned",
		childName: r.child.name,
		address: r.child.address,
		pickedUp: r.pickedUp,
		pickedAt: r.pickedAt
			? r.pickedAt.toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				})
			: null,
	}));

	return NextResponse.json(formatted);
}
