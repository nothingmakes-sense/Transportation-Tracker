
export default function AboutPage() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-20 text-white">
			<div className="container mx-auto px-6 py-16">
				{/* Hero */}
				<div className="mx-auto max-w-4xl text-center">
					<h1 className="font-extrabold text-6xl tracking-tight">About Peterson Family Care</h1>
					<p className="mt-6 text-2xl text-white/80">
						Family-owned. Student-focused. Safety-first since 2015.
					</p>
				</div>

				{/* Story */}
				<div className="mt-20 grid gap-16 md:grid-cols-2">
					<div>
						<h2 className="font-semibold text-4xl">Our Story</h2>
						<div className="prose prose-invert mt-8 text-lg leading-relaxed">
							<p>
								Peterson Family Care Transportation was founded by the Peterson family in Southwest Florida with one simple goal: give every child the safest, most reliable ride to and from school.
							</p>
							<p>
								What started as a single bus route has grown into a trusted partner for dozens of schools and thousands of families. We still operate with the same family values today — treating every student like our own.
							</p>
						</div>
					</div>
					<div className="rounded-3xl bg-white/10 p-10">
						<div className="grid grid-cols-2 gap-8 text-center">
							<div>
								<div className="text-5xl font-bold text-[#a855f7]">9</div>
								<div className="mt-2 text-white/70">Years Serving Families</div>
							</div>
							<div>
								<div className="text-5xl font-bold text-[#a855f7]">2,400+</div>
								<div className="mt-2 text-white/70">Students Transported Daily</div>
							</div>
							<div>
								<div className="text-5xl font-bold text-[#a855f7]">48</div>
								<div className="mt-2 text-white/70">Modern School Buses</div>
							</div>
							<div>
								<div className="text-5xl font-bold text-[#a855f7]">100%</div>
								<div className="mt-2 text-white/70">GPS-Equipped Fleet</div>
							</div>
						</div>
					</div>
				</div>

				{/* Mission & Values */}
				<div className="mt-24">
					<h2 className="mb-12 text-center font-semibold text-4xl">Our Mission & Values</h2>
					<div className="grid gap-8 md:grid-cols-3">
						<div className="rounded-3xl bg-white/10 p-8">
							<div className="text-6xl">🛡️</div>
							<h3 className="mt-6 font-semibold text-2xl">Safety First</h3>
							<p className="mt-4 text-white/80">
								Every driver is background-checked, drug-tested, and receives ongoing training. Our buses meet or exceed all FMVSS standards.
							</p>
						</div>
						<div className="rounded-3xl bg-white/10 p-8">
							<div className="text-6xl">❤️</div>
							<h3 className="mt-6 font-semibold text-2xl">Family Care</h3>
							<p className="mt-4 text-white/80">
								We treat every child and parent like part of our extended family. Communication is personal and transparent.
							</p>
						</div>
						<div className="rounded-3xl bg-white/10 p-8">
							<div className="text-6xl">🚀</div>
							<h3 className="mt-6 font-semibold text-2xl">Innovation</h3>
							<p className="mt-4 text-white/80">
								Real-time GPS tracking, live parent app, automated pickup confirmation, and electric bus transition.
							</p>
						</div>
					</div>
				</div>

				{/* Closing */}
				<div className="mx-auto mt-24 max-w-2xl text-center">
					<p className="text-xl italic text-white/90">
						“Getting kids to school safely isn’t just our job — it’s our family legacy.”
					</p>
					<p className="mt-4 text-white/70">— The Peterson Family</p>
				</div>
			</div>
		</main>
	);
}
