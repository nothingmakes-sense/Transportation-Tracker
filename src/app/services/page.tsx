
export default function ServicesPage() {
	const services = [
		{
			icon: "🚌",
			title: "Daily School Routes",
			desc: "Reliable home-to-school and school-to-home transportation for all grade levels.",
		},
		{
			icon: "♿",
			title: "Special Needs Transportation",
			desc: "Trained aides, wheelchair-accessible vehicles, and individualized routing.",
		},
		{
			icon: "🏈",
			title: "Field Trips & Athletics",
			desc: "Charter service for sports teams, band, clubs, and educational excursions.",
		},
		{
			icon: "🏕️",
			title: "Summer & Holiday Programs",
			desc: "Transportation for summer camps, VPK, and extended school-year services.",
		},
		{
			icon: "📍",
			title: "Live GPS Tracking",
			desc: "Parents see the exact bus location in real time through our mobile app.",
		},
		{
			icon: "📲",
			title: "Parent Portal & App",
			desc: "Pickup confirmation, absence notices, delay alerts, and direct driver messaging.",
		},
	];

	return (
		<main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-20 text-white">
			<div className="container mx-auto px-6 py-16">
				<div className="mx-auto max-w-3xl text-center">
					<h1 className="font-extrabold text-6xl tracking-tight">Our Services</h1>
					<p className="mt-6 text-2xl text-white/80">
						Safe, modern, and family-friendly student transportation solutions.
					</p>
				</div>

				<div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{services.map((service, i) => (
						<div
							key={i}
							className="group rounded-3xl bg-white/10 p-10 transition hover:bg-white/20"
						>
							<div className="text-7xl transition group-hover:scale-110">{service.icon}</div>
							<h3 className="mt-8 font-semibold text-3xl">{service.title}</h3>
							<p className="mt-4 text-lg text-white/80">{service.desc}</p>
						</div>
					))}
				</div>

				<div className="mx-auto mt-20 max-w-xl text-center">
					<div className="rounded-3xl bg-white/10 p-12">
						<p className="text-2xl">Ready to get started?</p>
						<a
							href="/contact"
							className="mt-6 inline-block rounded-full bg-white px-10 py-4 font-semibold text-[#2e026d] transition hover:bg-white/90"
						>
							Contact Us Today
						</a>
					</div>
				</div>
			</div>
		</main>
	);
}
