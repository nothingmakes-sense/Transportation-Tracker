
"use client";

import { useState } from "react";

export default function ContactPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		subject: "",
		message: "",
	});
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// In a real app this would call your API or server action
		console.log("Contact form submitted:", formData);
		setSubmitted(true);

		// Reset form after 3 seconds
		setTimeout(() => {
			setSubmitted(false);
			setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
		}, 3000);
	};

	return (
		<main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-20 text-white">
			<div className="container mx-auto px-6 py-16">
				<div className="mx-auto max-w-2xl text-center">
					<h1 className="font-extrabold text-6xl tracking-tight">Get In Touch</h1>
					<p className="mt-6 text-2xl text-white/80">
						We’d love to hear from you. Let’s talk about safe rides for your family.
					</p>
				</div>

				<div className="mt-16 grid gap-12 md:grid-cols-5">
					{/* Contact Info */}
					<div className="md:col-span-2">
						<div className="rounded-3xl bg-white/10 p-10">
							<h3 className="font-semibold text-2xl">Our Office</h3>
							<div className="mt-8 space-y-8">
								<div>
									<div className="text-white/60">Address</div>
									<div className="mt-1">
										123 Peterson Family Lane<br />
										Fort Myers, FL 33912
									</div>
								</div>
								<div>
									<div className="text-white/60">Phone</div>
									<a href="tel:+12394551234" className="mt-1 block hover:text-[#a855f7]">
										(239) 555-1234
									</a>
								</div>
								<div>
									<div className="text-white/60">Email</div>
									<a href="mailto:info@pfc2.org" className="mt-1 block hover:text-[#a855f7]">
										info@pfc2.org
									</a>
								</div>
								<div>
									<div className="text-white/60">Office Hours</div>
									<div className="mt-1">Monday – Friday 7:00 AM – 5:00 PM</div>
								</div>
							</div>
						</div>
					</div>

					{/* Form */}
					<div className="md:col-span-3">
						<div className="rounded-3xl bg-white/10 p-10">
							{submitted ? (
								<div className="py-12 text-center">
									<div className="mx-auto text-7xl">✅</div>
									<h3 className="mt-6 text-3xl">Thank you!</h3>
									<p className="mt-3 text-white/80">We received your message and will reply within one business day.</p>
								</div>
							) : (
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="grid gap-6 md:grid-cols-2">
										<div>
											<label className="block text-sm text-white/70">Name</label>
											<input
												type="text"
												required
												value={formData.name}
												onChange={(e) => setFormData({ ...formData, name: e.target.value })}
												className="mt-2 w-full rounded-2xl bg-white/10 px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#a855f7]"
											/>
										</div>
										<div>
											<label className="block text-sm text-white/70">Email</label>
											<input
												type="email"
												required
												value={formData.email}
												onChange={(e) => setFormData({ ...formData, email: e.target.value })}
												className="mt-2 w-full rounded-2xl bg-white/10 px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#a855f7]"
											/>
										</div>
									</div>

									<div className="grid gap-6 md:grid-cols-2">
										<div>
											<label className="block text-sm text-white/70">Phone</label>
											<input
												type="tel"
												value={formData.phone}
												onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
												className="mt-2 w-full rounded-2xl bg-white/10 px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#a855f7]"
											/>
										</div>
										<div>
											<label className="block text-sm text-white/70">Subject</label>
											<select
												required
												value={formData.subject}
												onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
												className="mt-2 w-full rounded-2xl bg-white/10 px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#a855f7]"
											>
												<option value="">Select one...</option>
												<option value="Route Inquiry">Route Inquiry</option>
												<option value="Parent Portal">Parent Portal Help</option>
												<option value="Driver Application">Driver Application</option>
												<option value="Other">Other</option>
											</select>
										</div>
									</div>

									<div>
										<label className="block text-sm text-white/70">Message</label>
										<textarea
											required
											rows={6}
											value={formData.message}
											onChange={(e) => setFormData({ ...formData, message: e.target.value })}
											className="mt-2 w-full resize-y rounded-3xl bg-white/10 px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#a855f7]"
										/>
									</div>

									<button
										type="submit"
										className="w-full rounded-full bg-white px-12 py-4 font-semibold text-[#2e026d] transition hover:bg-white/90"
									>
										Send Message
									</button>
								</form>
							)}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}