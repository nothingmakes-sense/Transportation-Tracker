// app/admin/routes/AssignableChildrenTable.tsx
"use client";

import { useState } from "react";

type Props = {
	unassigned: any[];
	routeId: string;
	assignAction: (routeId: string, childIds: string[]) => Promise<void>;
};

export default function AssignableChildrenTable({
	unassigned,
	routeId,
	assignAction,
}: Props) {
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<string[]>([]);
	const [isAssigning, setIsAssigning] = useState(false);

	const filtered = unassigned.filter(
		(c) =>
			c.name.toLowerCase().includes(search.toLowerCase()) ||
			c.parent.name.toLowerCase().includes(search.toLowerCase()),
	);

	const toggle = (id: string) => {
		setSelected((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		);
	};

	const handleAssign = async () => {
		if (selected.length === 0) return;
		setIsAssigning(true);
		await assignAction(routeId, selected);
		setSelected([]);
		setIsAssigning(false);
	};

	return (
		<div>
			<input
				className="mb-6 w-full rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-white placeholder:text-white/50"
				onChange={(e) => setSearch(e.target.value)}
				placeholder="Search children or parents..."
				type="text"
				value={search}
			/>

			<div className="max-h-96 overflow-auto rounded-2xl border border-white/10 bg-white/5 p-4">
				{filtered.length === 0 ? (
					<p className="py-8 text-center text-white/50">No matches found.</p>
				) : (
					<table className="w-full">
						<thead>
							<tr className="border-white/20 border-b">
								<th className="w-12 py-3 text-left"></th>
								<th className="py-3 text-left">Child</th>
								<th className="py-3 text-left">Parent</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((c) => (
								<tr
									className="border-white/10 border-b last:border-0 hover:bg-white/10"
									key={c.id}
								>
									<td className="py-4">
										<input
											checked={selected.includes(c.id)}
											className="h-5 w-5 accent-[hsl(280,100%,70%)]"
											onChange={() => toggle(c.id)}
											type="checkbox"
										/>
									</td>
									<td className="py-4 font-medium">{c.name}</td>
									<td className="py-4 text-white/70">{c.parent.name}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			<button
				className="mt-6 w-full rounded-2xl bg-green-600 py-5 font-semibold transition hover:bg-green-700 disabled:bg-white/20 disabled:text-white/50"
				disabled={selected.length === 0 || isAssigning}
				onClick={handleAssign}
			>
				{isAssigning
					? "Assigning..."
					: `Assign ${selected.length} selected children`}
			</button>
		</div>
	);
}
