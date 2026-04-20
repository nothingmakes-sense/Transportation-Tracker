// app/admin/reports/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ReportsPage() {
	const [activeTab, setActiveTab] = useState<"pickups" | "hours">("pickups");
	const [search, setSearch] = useState("");

	// Use UTC date string to avoid timezone shift
	const todayUTC = new Date().toISOString().split("T")[0];
	const [selectedDate, setSelectedDate] = useState(todayUTC);

	const [pickupData, setPickupData] = useState<any[]>([]);
	const [hoursData, setHoursData] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchPickups = async () => {
		setLoading(true);
		const res = await fetch(
			`/api/reports/pickups?date=${selectedDate}&search=${encodeURIComponent(search)}`,
		);
		const data = await res.json();
		setPickupData(data);
		setLoading(false);
	};

	const fetchHours = async () => {
		setLoading(true);
		const res = await fetch(
			`/api/reports/driver-hours?search=${encodeURIComponent(search)}`,
		);
		const data = await res.json();
		setHoursData(data);
		setLoading(false);
	};

	useEffect(() => {
		if (activeTab === "pickups") fetchPickups();
		else fetchHours();
	}, [activeTab, selectedDate, search]);

	// Download CSV
	const downloadCSV = (data: any[], filename: string) => {
		if (data.length === 0) return alert("No data to export");

		let csv = "";
		if (activeTab === "pickups") {
			csv = "Date,Bus Number,Child Name,Address,Picked Up,Picked At\n";
			data.forEach((row) => {
				csv += `${row.date},${row.busNumber},${row.childName},${row.address},${row.pickedUp ? "Yes" : "No"},${row.pickedAt || ""}\n`;
			});
		} else {
			csv = "Driver,Date,Clock In,Clock Out,Hours\n";
			data.forEach((row) => {
				csv += `${row.driver},${row.date},${row.clockIn || ""},${row.clockOut || ""},${row.hours.toFixed(2)}\n`;
			});
		}

		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-20 text-white">
			<div className="container mx-auto max-w-7xl px-6 py-12">
				<div className="mb-12 flex items-center justify-between">
					<h1 className="font-bold text-5xl">Reports &amp; Analytics</h1>
					<Link className="text-white/70 hover:text-white" href="/admin">
						← Dashboard
					</Link>
				</div>

				{/* Tabs */}
				<div className="mb-10 flex border-white/20 border-b">
					<button
						className={`border-b-4 px-8 py-4 font-medium text-lg transition ${
							activeTab === "pickups"
								? "border-[hsl(280,100%,70%)] text-white"
								: "border-transparent text-white/60 hover:text-white"
						}`}
						onClick={() => setActiveTab("pickups")}
					>
						Completed Routes &amp; Pickups
					</button>
					<button
						className={`border-b-4 px-8 py-4 font-medium text-lg transition ${
							activeTab === "hours"
								? "border-[hsl(280,100%,70%)] text-white"
								: "border-transparent text-white/60 hover:text-white"
						}`}
						onClick={() => setActiveTab("hours")}
					>
						Driver Hours
					</button>
				</div>

				{activeTab === "pickups" && (
					<>
						<div className="mb-8 flex flex-col gap-4 md:flex-row">
							<input
								className="rounded-2xl border border-white/20 bg-[#2e026d] px-6 py-4 text-white"
								onChange={(e) => setSelectedDate(e.target.value)}
								type="date"
								value={selectedDate}
							/>
							<input
								className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-lg placeholder:text-white/50"
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search child or bus..."
								type="text"
								value={search}
							/>
							<button
								className="rounded-2xl bg-[hsl(280,100%,70%)] px-10 font-medium disabled:opacity-50"
								disabled={loading}
								onClick={fetchPickups}
							>
								{loading ? "Loading..." : "Refresh"}
							</button>
							<button
								className="rounded-2xl bg-green-600 px-8 font-medium transition hover:bg-green-700"
								disabled={pickupData.length === 0}
								onClick={() =>
									downloadCSV(pickupData, `pickups_${selectedDate}.csv`)
								}
							>
								Download CSV
							</button>
						</div>

						<div className="overflow-hidden rounded-3xl bg-white/10">
							<table className="w-full">
								<thead className="bg-white/5">
									<tr>
										<th className="p-6 text-left">Date</th>
										<th className="p-6 text-left">Bus</th>
										<th className="p-6 text-left">Child</th>
										<th className="p-6 text-left">Address</th>
										<th className="p-6 text-left">Status</th>
										<th className="p-6 text-left">Picked At</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-white/10">
									{loading ? (
										<tr>
											<td
												className="p-12 text-center text-white/50"
												colSpan={6}
											>
												Loading records...
											</td>
										</tr>
									) : pickupData.length === 0 ? (
										<tr>
											<td
												className="p-12 text-center text-white/50"
												colSpan={6}
											>
												No pickup records found for this date.
											</td>
										</tr>
									) : (
										pickupData.map((row: any) => (
											<tr className="hover:bg-white/5" key={row.id}>
												<td className="p-6">{row.date}</td>
												<td className="p-6 font-medium">Bus {row.busNumber}</td>
												<td className="p-6">{row.childName}</td>
												<td className="p-6 text-white/70">{row.address}</td>
												<td className="p-6">
													<span
														className={`rounded-full px-4 py-1 text-sm ${row.pickedUp ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
													>
														{row.pickedUp ? "Picked Up" : "Not Picked Up"}
													</span>
												</td>
												<td className="p-6 text-white/70">
													{row.pickedAt || "—"}
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</>
				)}

				{activeTab === "hours" && (
					<>
						<div className="mb-8 flex gap-4">
							<input
								className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-lg placeholder:text-white/50"
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search driver name..."
								type="text"
								value={search}
							/>
							<button
								className="rounded-2xl bg-[hsl(280,100%,70%)] px-10 font-medium"
								onClick={fetchHours}
							>
								Refresh
							</button>
							<button
								className="rounded-2xl bg-green-600 px-8 font-medium transition hover:bg-green-700"
								onClick={() => downloadCSV(hoursData, "driver_hours.csv")}
							>
								Download CSV
							</button>
						</div>

						<div className="overflow-hidden rounded-3xl bg-white/10">
							<table className="w-full">
								<thead className="bg-white/5">
									<tr>
										<th className="p-6 text-left">Driver</th>
										<th className="p-6 text-left">Date</th>
										<th className="p-6 text-left">Clock In</th>
										<th className="p-6 text-left">Clock Out</th>
										<th className="p-6 text-left">Hours</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-white/10">
									{hoursData.length === 0 ? (
										<tr>
											<td
												className="p-12 text-center text-white/50"
												colSpan={5}
											>
												No hours recorded yet
											</td>
										</tr>
									) : (
										hoursData.map((row: any) => (
											<tr className="hover:bg-white/5" key={row.id}>
												<td className="p-6 font-medium">{row.driver}</td>
												<td className="p-6">{row.date}</td>
												<td className="p-6 text-white/70">
													{row.clockIn || "—"}
												</td>
												<td className="p-6 text-white/70">
													{row.clockOut || "—"}
												</td>
												<td className="p-6 font-semibold text-[hsl(280,100%,70%)]">
													{row.hours.toFixed(2)} hrs
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</>
				)}
			</div>
		</main>
	);
}
