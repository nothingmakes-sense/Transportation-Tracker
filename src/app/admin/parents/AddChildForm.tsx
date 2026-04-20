// app/admin/parents/AddChildForm.tsx
"use client";

import { useState } from "react";

type Props = {
	parents: any[];
	routes: any[];
	createChild: (formData: FormData) => Promise<void>;
};

export default function AddChildForm({ parents, routes, createChild }: Props) {
	const [selectedParentId, setSelectedParentId] = useState("");
	const [childAddress, setChildAddress] = useState("");

	const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const pid = e.target.value;
		setSelectedParentId(pid);

		const parent = parents.find((p) => p.id === pid);
		setChildAddress(parent?.address || "");
	};

	return (
		<form
			action={createChild}
			className="grid grid-cols-1 gap-6 md:grid-cols-12"
		>
			<div className="md:col-span-3">
				<select
					className="w-full rounded-2xl border border-white/20 bg-white/5 px-6 py-5 text-white"
					name="parentId"
					onChange={handleParentChange}
					required
					value={selectedParentId}
				>
					<option className="bg-[#2e026d] text-white" value="">
						Select Parent
					</option>
					{parents.map((p) => (
						<option className="bg-[#2e026d] text-white" key={p.id} value={p.id}>
							{p.name}
						</option>
					))}
				</select>
			</div>

			<div className="md:col-span-3">
				<input
					className="w-full rounded-2xl border border-white/20 bg-white/5 px-6 py-5"
					name="name"
					placeholder="Child Full Name"
					required
				/>
			</div>

			<div className="md:col-span-4">
				<input
					className="w-full rounded-2xl border border-white/20 bg-white/5 px-6 py-5"
					name="address"
					onChange={(e) => setChildAddress(e.target.value)}
					placeholder="Pickup Address (auto-filled from parent)"
					required
					value={childAddress}
				/>
			</div>

			<div className="md:col-span-2">
				<select
					className="w-full rounded-2xl border border-white/20 bg-white/5 px-6 py-5"
					name="busRouteId"
				>
					<option className="bg-[#2e026d] text-white" value="">
						No route yet
					</option>
					{routes.map((r) => (
						<option className="bg-[#2e026d] text-white" key={r.id} value={r.id}>
							Bus {r.busNumber}
						</option>
					))}
				</select>
			</div>

			<button
				className="rounded-2xl bg-[hsl(280,100%,70%)] py-5 font-semibold text-lg transition hover:bg-[hsl(280,100%,80%)] md:col-span-12"
				type="submit"
			>
				Add Child to Parent
			</button>
		</form>
	);
}
