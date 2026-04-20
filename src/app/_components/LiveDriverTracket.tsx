"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";

// Dynamic Leaflet imports (prevents window is not defined)
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
	driverId: string;
	isClockedIn: boolean;
	busNumber: string;
}

export default function LiveDriverTracker({
	driverId,
	isClockedIn,
	busNumber,
}: Props) {
	const [currentLocation, setCurrentLocation] = useState<{
		lat: number;
		lng: number;
		accuracy: number;
	} | null>(null);
	const watchIdRef = useRef<number | null>(null);
	const lastSentRef = useRef<number>(0);
	const [isClient, setIsClient] = useState(false);
	
	const updateMutation = api.location.updateLocation.useMutation();
	// Leaflet icon fix + mark as client-side only
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

	useEffect(() => {
		console.log(isClockedIn)
		if (!isClockedIn) {
			if (watchIdRef.current)
				navigator.geolocation.clearWatch(watchIdRef.current);
			setCurrentLocation(null);
			return;
		}

		watchIdRef.current = navigator.geolocation.watchPosition(
			(position) => {
				const { latitude: lat, longitude: lng, accuracy } = position.coords;
				setCurrentLocation({ lat, lng, accuracy });

				const now = Date.now();
				if (now - lastSentRef.current > 3000) {
					lastSentRef.current = now;
					updateMutation.mutate({ lat, lng, accuracy, busNumber });
				}
			},
			(err) => console.error("Geolocation error:", err),
			{ enableHighAccuracy: true, maximumAge: 0, timeout: 5000 },
		);

		return () => {
			if (watchIdRef.current)
				navigator.geolocation.clearWatch(watchIdRef.current);
		};
	}, [isClockedIn, busNumber, updateMutation]);

	const position = currentLocation
		? ([currentLocation.lat, currentLocation.lng] as [number, number])
		: null;

	if (!isClient) {
		return (
			<div className="mb-12 flex h-[500px] items-center justify-center rounded-3xl bg-white/10 p-8 text-white/50">
				Loading live map...
			</div>
		);
	}

	return (
		<div className="mb-12 rounded-3xl bg-white/10 p-8">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<div className="font-semibold text-2xl">Live GPS Tracking</div>
					<div className="text-white/70">
						tRPC • High-accuracy • Real-time map
					</div>
				</div>
				<div
					className={`rounded-full px-6 py-2 font-medium text-sm ${isClockedIn ? "bg-green-500" : "bg-red-500/50"}`}
				>
					{isClockedIn ? "🟢 LIVE" : "🔴 Clock in to start"}
				</div>
			</div>

			{currentLocation && (
				<div className="mb-6 rounded-2xl bg-black/30 p-4 font-mono text-sm">
					📍 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}{" "}
					<span className="text-white/50">
						(±{currentLocation.accuracy.toFixed(0)} m)
					</span>
				</div>
			)}

			<div className="h-[500px] overflow-hidden rounded-3xl border border-white/10">
				<DynamicMapContainer
					center={position || [26.5, -81.8]}
					style={{ height: "100%", width: "100%" }}
					zoom={position ? 18 : 4}
				>
					<DynamicTileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>

					{position && (
						<DynamicMarker position={position}>
							<DynamicPopup>
								Bus <strong>{busNumber}</strong>
								<br />
								Your current location
								<br />
								Accuracy:{" "}
								{currentLocation?.accuracy
									? `±${currentLocation.accuracy.toFixed(0)}m`
									: "unknown"}
							</DynamicPopup>
						</DynamicMarker>
					)}
				</DynamicMapContainer>
			</div>
		</div>
	);
}
