// seed-users.ts

import { PrismaClient } from "./generated/prisma";
import { auth } from "./src/server/better-auth"; // ← adjust only if your path is different

const prisma = new PrismaClient();

const accounts = [
	{
		name: "Admin User",
		email: "admin@patientpickup.dev",
		password: "admin123",
		role: "admin" as const,
	},
	{
		name: "Driver One",
		email: "driver@patientpickup.dev",
		password: "driver123",
		role: "driver" as const,
	},
	{
		name: "Parent One",
		email: "parent@patientpickup.dev",
		password: "parent123",
		role: "parent" as const,
	},
];

async function main() {
	console.log("🚀 Seeding admin, driver & parent accounts...\n");

	for (const acc of accounts) {
		try {
			// 1. Create via Better Auth (handles password hashing + Account record)
			await auth.api.signUpEmail({
				body: {
					name: acc.name,
					email: acc.email,
					password: acc.password,
				},
			});
			console.log(`✅ Created new user: ${acc.email}`);
		} catch (err: any) {
			// User probably already exists → that's fine for re-running the script
			if (
				err.message?.includes("already") ||
				err.status === 409 ||
				err.code === "USER_ALREADY_EXISTS"
			) {
				console.log(`⚠️  User already exists: ${acc.email}`);
			} else {
				console.error(`❌ Error creating ${acc.email}:`, err.message || err);
			}
		}

		// 2. Always ensure correct role + verified email (idempotent)
		try {
			await prisma.user.update({
				where: { email: acc.email },
				data: {
					role: acc.role,
					emailVerified: true,
				},
			});
			console.log(`   → Role set to "${acc.role}" | Email verified\n`);
		} catch (err: any) {
			if (err.code === "P2025") {
				console.error(`   ❌ User not found after signup: ${acc.email}`);
			} else {
				console.error(`   ❌ Update error for ${acc.email}:`, err.message);
			}
		}
	}

	console.log("🎉 Seeding finished!");
	await prisma.$disconnect();
}

main().catch((e) => {
	console.error("❌ Seed failed:", e);
	prisma.$disconnect();
	process.exit(1);
});
