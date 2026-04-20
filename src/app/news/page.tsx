
export default function NewsPage() {
	const posts = [
		{
			title: "New Electric Bus Fleet Arrives",
			date: "February 20, 2026",
			excerpt:
				"Twelve brand-new electric school buses join our fleet this month, reducing emissions by over 85% on daily routes.",
			category: "Fleet",
		},
		{
			title: "Driver of the Month: Maria Rodriguez",
			date: "February 12, 2026",
			excerpt:
				"Congratulations to Maria for 5 years of perfect safety record and going above and beyond for her students every single day.",
			category: "Team",
		},
		{
			title: "Parent App 2.0 Now Live",
			date: "January 28, 2026",
			excerpt:
				"New features include live estimated arrival times, photo pickup verification, and instant delay notifications.",
			category: "Technology",
		},
		{
			title: "5 Years Accident-Free Milestone",
			date: "January 15, 2026",
			excerpt:
				"We are proud to celebrate five consecutive years with zero preventable accidents — thank you to our incredible drivers and maintenance team.",
			category: "Safety",
		},
	];

	return (
		<main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-20 text-white">
			<div className="container mx-auto px-6 py-16">
				<div className="mx-auto max-w-3xl text-center">
					<h1 className="font-extrabold text-6xl tracking-tight">News & Updates</h1>
					<p className="mt-6 text-2xl text-white/80">
						The latest from Peterson Family Care Transportation
					</p>
				</div>

				<div className="mt-16 grid gap-8 lg:grid-cols-2">
					{posts.map((post, i) => (
						<div
							key={i}
							className="rounded-3xl bg-white/10 p-8 transition hover:bg-white/20"
						>
							<div className="flex items-center justify-between text-sm uppercase tracking-widest text-white/60">
								<span>{post.category}</span>
								<span>{post.date}</span>
							</div>
							<h3 className="mt-6 font-semibold text-2xl leading-tight">{post.title}</h3>
							<p className="mt-4 text-white/80">{post.excerpt}</p>
							<button className="mt-6 text-[#a855f7] hover:underline">
								Read full story →
							</button>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
