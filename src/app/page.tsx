import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LatestPost } from "~/app/_components/post";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
	const hello = await api.post.hello({ text: "from tRPC" });
	const session = await getSession();

	if (session) {
		void api.post.getLatest.prefetch();
	}

	return (
		<HydrateClient>
			<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
					<h1 className="text-center font-extrabold text-5xl tracking-tight sm:text-[5rem]">
						PFC Transportation
					</h1>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
						<Link
							className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
							href="/parent"
						>
							<h3 className="font-bold text-2xl">Parent Portal →</h3>
							<div className="text-lg">
								Manage your child's transportation, view bus routes, and receive
								updates from the palm of your hand.
							</div>
						</Link>
						<Link
							className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
							href="/about"
							
						>
							<h3 className="font-bold text-2xl">Join Us →</h3>
							<div className="text-lg">
								Learn more about Peterson Family Care and how we're
								revolutionizing school transportation. Contact us to get
								involved!
							</div>
						</Link>
					</div>
					{/* <div className="flex flex-col items-center gap-2">
						<p className="text-2xl text-white">
							{hello ? hello.greeting : "Loading tRPC query..."}
						</p>

						<div className="flex flex-col items-center justify-center gap-4">
							<p className="text-center text-2xl text-white">
								{session && <span>Logged in as {session.user?.name}</span>}
							</p>
							{!session ? (
								<form>
									<button
										className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
										formAction={async () => {
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
										}}
									>
										Sign in with Github
									</button>
								</form>
							) : (
								<form>
									<button
										className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
										formAction={async () => {
											"use server";
											await auth.api.signOut({
												headers: await headers(),
											});
											redirect("/");
										}}
									>
										Sign out
									</button>
								</form>
							)}
						</div>
					</div> */}

					{/* {session?.user && <LatestPost />} */}
				</div>
			</main>
		</HydrateClient>
	);
}
