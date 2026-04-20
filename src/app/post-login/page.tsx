import { redirect } from "next/navigation";
import { getSession } from "~/server/better-auth/server";

export default async function PostLoginPage() {
	const session = await getSession();

	if (!session?.user) {
		redirect("/login");
	}

	// Role-based routing
	if (session.user.role === "admin") redirect("/admin");
	if (session.user.role === "driver") redirect("/driver");
	if (session.user.role === "parent") redirect("/parent");

	redirect("/"); // fallback for regular "user"
}
