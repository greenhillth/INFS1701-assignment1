<svelte:head>
	<title>INFS1701 Networking &amp; Cybersecurity Hub</title>
	<meta
		name="description"
		content="Explore INFS1701 networking and cybersecurity resources, including the interactive network topology diagram and future project showcases."
	/>
</svelte:head>

<div
	class="min-h-screen grid place-items-center gap-10 px-6 py-12 sm:py-16 md:py-20 lg:py-24 sm:px-10 lg:px-20 text-slate-200 bg-[#020617] [background-image:radial-gradient(circle_at_top_right,rgba(56,189,248,0.1),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_50%)]"
>
	<div class="max-w-3xl text-center space-y-6">
		<p class="text-sm uppercase tracking-[0.12em] font-semibold text-slate-400/85">
			Greenhill Institute of Technology
		</p>
		<h1 class="text-4xl sm:text-5xl font-bold text-slate-50">
			INFS1701 Networking &amp; Cybersecurity Hub
		</h1>
		<p class="text-lg leading-relaxed text-slate-200/90">
			Your starting point for INFS1701 projects. Launch the interactive network topology to explore
			the Greenhill campus design, or keep an eye on the placeholders below as new cybersecurity
			artefacts come online.
		</p>

		<div class="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
			<a
				class="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-8 py-3 font-semibold text-slate-900 shadow-[0_12px_30px_rgba(56,189,248,0.35)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(74,222,128,0.35)] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
				href="/flowchart"
			>
				View the network topology
			</a>
			<a
				class="text-sm font-medium text-slate-400/95 border-b border-slate-400/40 pb-1 hover:text-slate-100 hover:border-slate-100 focus-visible:text-slate-100 focus-visible:border-slate-100 focus-visible:outline-none"
				href="/flowchart"
				target="_blank"
				rel="noreferrer"
			>
				Open topology in a new tab
			</a>
		</div>
	</div>

	<div
		class="max-w-2xl rounded-2xl border border-slate-500/25 bg-slate-900/75 p-6 text-center leading-relaxed text-slate-200/90 shadow-[0_18px_32px_rgba(15,23,42,0.35)]"
	>
		<p class="text-base">
			Tip: Once on the flowchart page you can export a PNG snapshot or copy a direct link for
			embedding in documentation and coursework.
		</p>
	</div>

	<div class="grid w-full max-w-[1080px] gap-8" aria-labelledby="projects-heading">
		<div class="grid gap-3 text-center">
			<h2 id="projects-heading" class="text-3xl font-semibold text-slate-50 sm:text-4xl">
				Upcoming INFS1701 Projects
			</h2>
			<p class="mx-auto max-w-[52ch] text-base leading-relaxed text-slate-200/80">
				These placeholders reserve space for future networking and cybersecurity resources such as
				configuration labs, incident response drills, and vulnerability reports. Swap the titles and
				descriptions when each artefact is ready to publish.
			</p>
		</div>
		<div class="grid gap-6 md:grid-cols-3">
			<article
				class="grid min-h-[220px] gap-3 rounded-2xl border border-slate-500/25 bg-slate-900/65 p-6 text-left shadow-[0_18px_32px_rgba(15,23,42,0.35)]"
				aria-label="Placeholder for Security Operations Playbook"
			>
				<h3 class="text-xl font-semibold text-slate-100">Security Operations Playbook</h3>
				<p class="leading-relaxed text-slate-200/85">
					Coming soon: a guide for monitoring the simulated campus SOC with incident response
					checklists and escalation paths.
				</p>
				<span
					class="inline-flex w-fit items-center rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-400"
				>
					Placeholder
				</span>
			</article>
			<article
				class="grid min-h-[220px] gap-3 rounded-2xl border border-slate-500/25 bg-slate-900/65 p-6 text-left shadow-[0_18px_32px_rgba(15,23,42,0.35)]"
				aria-label="Placeholder for Network Lab Guides"
			>
				<h3 class="text-xl font-semibold text-slate-100">Network Lab Guides</h3>
				<p class="leading-relaxed text-slate-200/85">
					Reserve this tile for step-by-step switch and router configuration exercises that
					complement the topology.
				</p>
				<span
					class="inline-flex w-fit items-center rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-400"
				>
					Placeholder
				</span>
			</article>
			<article
				class="grid min-h-[220px] gap-3 rounded-2xl border border-slate-500/25 bg-slate-900/65 p-6 text-left shadow-[0_18px_32px_rgba(15,23,42,0.35)]"
				aria-label="Placeholder for Cybersecurity Case Study"
			>
				<h3 class="text-xl font-semibold text-slate-100">Cybersecurity Case Study</h3>
				<p class="leading-relaxed text-slate-200/85">
					Allocate this space to a threat modelling or penetration testing case study to highlight
					defensive strategies.
				</p>
				<span
					class="inline-flex w-fit items-center rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-400"
				>
					Placeholder
				</span>
			</article>
		</div>
	</div>
</div>
