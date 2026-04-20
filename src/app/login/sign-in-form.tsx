"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "~/server/better-auth/client"; // adjust path if your alias is different

export function SignInForm() {
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (formData: FormData) => {
		setLoading(true);
		setError("");

		const email = (formData.get("email") as string)?.trim().toLowerCase() ?? "";
		const password = formData.get("password") as string;

		if (!email || !password) {
			setError("Missing email or password");
			setLoading(false);
			return;
		}

		const { error: signInError } = await authClient.signIn.email({
			email,
			password,
			callbackURL: "/post-login", // role-based magic happens here
		});

		if (signInError) {
			setError(signInError.message ?? "Invalid email or password");
		}
		// No else needed — Better Auth automatically redirects on success
		setLoading(false);
	};

	return (
		<form action={handleSubmit} className="flex flex-col gap-4">
			<input
				className="w-full rounded-xl bg-white/10 px-5 py-4 text-lg placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
				disabled={loading}
				name="email"
				placeholder="you@email.com"
				required
				type="email"
			/>
			<input
				className="w-full rounded-xl bg-white/10 px-5 py-4 text-lg placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
				disabled={loading}
				name="password"
				placeholder="••••••••"
				required
				type="password"
			/>

			{error && <p className="text-center text-red-300 text-sm">{error}</p>}

			<button
				className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20 disabled:opacity-50"
				disabled={loading}
				type="submit"
			>
				{loading ? "Signing in..." : "Sign in with Email"}
			</button>
			<Link href={"/signup"} className="text-sm text-white/50 text-center hover:text-white">
				Don't have an account? Sign up here
			</Link>
		</form>
		
	);
}
