"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";

// Dynamic Leaflet imports (fixes window is not defined)
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

function AutoFitMarkers({ locations }: { locations: any[] }) {
	const map = (require("react-leaflet") as any).useMap();

	useEffect(() => {
		if (locations.length === 0) return;

		const L = require("leaflet") as any;
		const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]));

		if (bounds.isValid()) {
			map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
		}
	}, [locations, map]);

	return null;
}

export default function LiveAdminFleet() {
	const { data: liveLocations = [] } = api.location.getLiveLocations.useQuery(
		undefined,
		{
			refetchInterval: 2000,
		},
	);

	const [isClient, setIsClient] = useState(false);

	// Leaflet icon fix (client-only)
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
			<div className="mt-20 flex h-[620px] items-center justify-center rounded-3xl bg-white/10 p-8 text-white/50">
				Loading fleet map...
			</div>
		);
	}

	return (
		<div className="mt-20">
			<div className="mb-8 flex items-end justify-between">
				<div>
					<h2 className="font-bold text-5xl tracking-tight">
						Fleet Live Tracking
					</h2>
					<p className="text-white/70 text-xl">
						All drivers • auto-refresh every 2s
					</p>
				</div>
				<div className="text-right">
					<div className="font-bold font-mono text-6xl text-green-400">
						{liveLocations.length}
					</div>
					<div className="-mt-2 text-sm text-white/60">ACTIVE DRIVERS</div>
				</div>
			</div>

			<div className="rounded-3xl bg-white/10 p-8">
				<div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
					{liveLocations.length > 0 ? (
						liveLocations.map((loc: any) => (
							<div className="rounded-2xl bg-white/5 p-6" key={loc.driverId}>
								<div className="flex justify-between">
									<div>
										<div className="font-semibold text-lg">
											Driver {loc.driverId.slice(0, 8)}...
										</div>
										{loc.busNumber && (
											<div className="text-white/70">Bus {loc.busNumber}</div>
										)}
									</div>
									<div className="font-medium text-green-400 text-sm">
										🟢 LIVE
									</div>
								</div>
								<div className="mt-6 font-mono text-xl">
									📍 {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
								</div>
								<div className="mt-1 text-white/50 text-xs">
									Updated {new Date(loc.updatedAt).toLocaleTimeString()}
								</div>
							</div>
						))
					) : (
						<div className="col-span-2 py-20 text-center text-white/60 text-xl">
							No drivers broadcasting yet.
						</div>
					)}
				</div>

				<div className="h-[620px] overflow-hidden rounded-3xl border border-white/10">
					<DynamicMapContainer
						center={[25.0, -80.0]}
						style={{ height: "100%", width: "100%" }}
						zoom={3}
					>
						<DynamicTileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>

						<AutoFitMarkers locations={liveLocations} />

						{liveLocations.map((loc: any) => (
							<DynamicMarker key={loc.driverId} position={[loc.lat, loc.lng]}>
								<DynamicPopup>
									<strong>Bus {loc.busNumber || "Unknown"}</strong> <br />
									Driver ID: {loc.driverId.slice(0, 8)}... <br />
									Accuracy:{" "}
									{loc.accuracy ? `±${loc.accuracy.toFixed(0)} m` : "—"} <br />
									Last update: {new Date(loc.updatedAt).toLocaleString()}
								</DynamicPopup>
							</DynamicMarker>
						))}
					</DynamicMapContainer>
				</div>
			</div>
		</div>
	);
}
