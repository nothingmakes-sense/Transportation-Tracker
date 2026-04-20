"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";

// Dynamic imports (SSR disabled - this is the key fix)
const DynamicMapContainer = dynamic(
	() => import("react-leaflet").then((mod) => ({ default: mod.MapContainer })),
	{ ssr: false },
);
const DynamicTileLayer = dynamic(
	() => import("react-leaflet").then((mod) => ({ default: mod.TileLayer })),
	{ ssr: false },
);
const DynamicMarker = dynamic(
	() => import("react-leaflet").then((mod) => ({ default: mod.Marker })),
	{ ssr: false },
);
const DynamicPopup = dynamic(
	() => import("react-leaflet").then((mod) => ({ default: mod.Popup })),
	{ ssr: false },
);

interface Props {
	children: any[];
}

export default function LiveParentLocations({ children }: Props) {
	const { data: liveLocations = [] } = api.location.getLiveLocations.useQuery(
		undefined,
		{
			refetchInterval: 2000,
			refetchOnWindowFocus: true,
		},
	);

	const locationMap = liveLocations.reduce((acc: any, loc: any) => {
		acc[loc.driverId] = loc;
		return acc;
	}, {});

	const [isClient, setIsClient] = useState(false);

	// Leaflet icon fix + client check (runs only in browser)
	useEffect(() => {
		setIsClient(true);

		import("leaflet").then((L) => {
			delete (L.Icon.Default.prototype as any)._getIconUrl;
			L.Icon.Default.mergeOptions({
				iconRetinaUrl:
					"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
				iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
				shadowUrl:
					"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
			});
		});
	}, []);

	if (!isClient) {
		return (
			<div className="mb-12 flex h-[420px] items-center justify-center rounded-3xl bg-white/10 p-8 text-white/50">
				Loading live bus maps...
			</div>
		);
	}

	return (
		<div className="mb-12 rounded-3xl bg-white/10 p-8">
			<h2 className="mb-6 flex items-center gap-3 font-semibold text-3xl">
				🚍 Live Driver Locations
			</h2>

			<div className="space-y-6">
				{children.map((child) => {
					const driverId = child.busRoute?.driverId;
					const loc = driverId ? locationMap[driverId] : null;

					// Auto-center on the specific bus marker when it exists
					const center = loc ? [loc.lat, loc.lng] : [25.0, -80.0];
					const zoom = loc ? 18 : 4;

					return (
						<div className="rounded-2xl bg-white/5 p-6" key={child.id}>
							<div className="mb-4 flex items-start justify-between">
								<div>
									<div className="font-semibold text-lg">
										Driver for {child.name} • Bus {child.busRoute?.busNumber}
									</div>
									{loc ? (
										<div className="mt-3 font-mono text-green-400">
											📍 {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
											<span className="ml-2 text-white/50 text-xs">
												(updated {new Date(loc.updatedAt).toLocaleTimeString()})
											</span>
										</div>
									) : (
										<div className="mt-3 text-white/50">
											Driver not broadcasting yet
										</div>
									)}
								</div>
								<div
									className={`rounded-full px-4 py-1 text-sm ${loc ? "bg-green-500" : "bg-white/10"}`}
								>
									{loc ? "🟢 LIVE" : "⚪"}
								</div>
							</div>

							<div className="h-80 overflow-hidden rounded-2xl border border-white/10">
								<DynamicMapContainer
									center={center as [number, number]}
									style={{ height: "100%", width: "100%" }}
									zoom={zoom}
								>
									<DynamicTileLayer
										attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
										url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
									/>

									{loc && (
										<DynamicMarker position={[loc.lat, loc.lng]}>
											<DynamicPopup>
												Bus <strong>{child.busRoute?.busNumber}</strong> <br />
												For: {child.name} <br />
												Last update: {new Date(loc.updatedAt).toLocaleString()}
											</DynamicPopup>
										</DynamicMarker>
									)}
								</DynamicMapContainer>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
