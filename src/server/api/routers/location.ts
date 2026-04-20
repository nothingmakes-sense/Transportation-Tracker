import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const locationRouter = createTRPCRouter({
	// Driver sends live GPS
	updateLocation: protectedProcedure
		.input(
			z.object({
				lat: z.number(),
				lng: z.number(),
				accuracy: z.number().optional(),
				busNumber: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await prisma.driverLocation.upsert({
				where: { driverId: ctx.session.user.id },
				update: {
					lat: input.lat,
					lng: input.lng,
					accuracy: input.accuracy,
					busNumber: input.busNumber,
				},
				create: {
					driverId: ctx.session.user.id,
					lat: input.lat,
					lng: input.lng,
					accuracy: input.accuracy,
					busNumber: input.busNumber,
				},
			});
			return { success: true };
		}),

	// Everyone (admin/parent) gets latest locations
	getLiveLocations: protectedProcedure.query(async () => {
		return await prisma.driverLocation.findMany({
			select: {
				driverId: true,
				lat: true,
				lng: true,
				accuracy: true,
				busNumber: true,
				updatedAt: true,
			},
		});
	}),
});
