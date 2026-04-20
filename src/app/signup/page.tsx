// app/signup/page.tsx
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";

export default async function SignupPage({
	searchParams,
}: {
	// ← THIS IS THE FIX (Next.js now requires Promise)
	searchParams: Promise<{ error?: string }>;
}) {
	const { error } = await searchParams; // ← already correct

	const session = await getSession();
	if (session) {
		redirect("/");
	}

	const signInWithGitHub = async () => {
		"use server";
		const res = await auth.api.signInSocial({
			body: {
				provider: "github",
				callbackURL: "/",
			},
		});
		if (!res.url) {
			throw new Error("No URL returned from signInSocial");
		}
		redirect(res.url);
	};

	const signUpWithCredentials = async (formData: FormData) => {
		"use server";

		const email = (formData.get("email") as string)?.trim().toLowerCase();
		const password = formData.get("password") as string;
		const name = formData.get("name") as string;

		if (!email || !password || !name) {
			redirect("/signup?error=Missing fields");
		}

		try {
			await auth.api.signUpEmail({
				body: {
					email,
					password,
					name,
					callbackURL: "/login",
				},
			});
		} catch (err) {
			console.error("Sign-up error:", err);
			redirect("/signup?error=Invalid email or password");
		}
		redirect("/login");
	};

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
			<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
				<h1 className="font-extrabold text-5xl tracking-tight sm:text-[5rem]">
					Patient <span className="text-[hsl(280,100%,70%)]">Pickup</span>
				</h1>

				<div className="flex w-full max-w-md flex-col gap-8">
					{error && (
						<div className="rounded-xl bg-red-500/20 p-4 text-center text-red-300">
							{error === "Invalid email or password"
								? "Invalid email or password. Please try again."
								: error}
						</div>
					)}

					{/* GitHub OAuth */}
					<form>
						<button
							className="flex w-full items-center justify-center gap-3 rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
							formAction={signInWithGitHub}
						>
							<svg
								fill="currentColor"
								height="20"
								viewBox="0 0 24 24"
								width="20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577 0-.285-.01-1.044-.015-2.049-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.652 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.604-.015 2.896-.015 3.286 0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
							</svg>
							Continue with GitHub
						</button>
					</form>

					<div className="flex items-center gap-4">
						<div className="h-px flex-1 bg-white/20" />
						<span className="text-white/50 text-xs uppercase tracking-widest">
							or
						</span>
						<div className="h-px flex-1 bg-white/20" />
					</div>

					{/* Email + Password Signup */}
					<form action={signUpWithCredentials} className="flex flex-col gap-4">
						<input
							className="w-full rounded-xl bg-white/10 px-5 py-4 text-lg placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
							name="email"
							placeholder="you@email.com"
							required
							type="email"
						/>
						<input
							className="w-full rounded-xl bg-white/10 px-5 py-4 text-lg placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
							minLength={12}
							name="password"
							placeholder="••••••••"
							required
							type="password"
						/>
						<input
							className="w-full rounded-xl bg-white/10 px-5 py-4 text-lg placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
							name="name"
							placeholder="Your Name"
							required
							type="text"
						/>

						<button
							className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
							type="submit"
						>
							Signup
						</button>
					</form>
				</div>

				<Link
					className="mt-8 text-sm text-white/50 transition hover:text-white"
					href="/"
				>
					← Back to home
				</Link>
			</div>
		</main>
	);
}
