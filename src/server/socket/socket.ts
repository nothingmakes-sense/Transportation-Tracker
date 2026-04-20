import { Server } from "socket.io";

export let io: Server;

export function initSocket(server: any) {
	io = new Server(server, {
		cors: { origin: "*" },
		path: "/socket.io",
	});

	io.on("connection", (socket) => {
		console.log("Client connected:", socket.id);

		socket.on("driver-location-update", (data) => {
			// Optional: persist to Prisma if you want history
			// await prisma.driverLocation.create({ data: { ...data, driverId: data.driverId } });
			io.emit("location-update", data); // broadcast to ALL clients (admin + parents)
		});

		socket.on("disconnect", () => console.log("Client disconnected"));
	});
}
