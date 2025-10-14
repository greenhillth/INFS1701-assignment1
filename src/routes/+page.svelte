<script lang="ts">
	import { LANDING } from '$lib/styles/components/landing';
</script>

<svelte:head>
	<title>INFS1701 Networking &amp; Cybersecurity Hub</title>
	<meta
		name="description"
		content="Explore INFS1701 networking and cybersecurity resources, including the interactive network topology diagram and future project showcases."
	/>
</svelte:head>

<div class={LANDING.root}>
	<div class={LANDING.hero}>
		<p class={LANDING.tagline}>Greenhill Institute of Technology</p>
		<h1 class={LANDING.title}>INFS1701 Networking &amp; Cybersecurity Hub</h1>
		<p class={LANDING.lead}>
			Your starting point for INFS1701 projects. Launch the interactive network topology to explore
			the Greenhill campus design, or keep an eye on the placeholders below as new cybersecurity
			artefacts come online.
		</p>

		<div class={LANDING.ctaRow}>
			<a class={LANDING.ctaPrimary} href="/flowchart">View the network topology</a>
			<a class={LANDING.ctaLink} href="/flowchart" target="_blank" rel="noreferrer">
				Open topology in a new tab
			</a>
		</div>
	</div>

	<div class={LANDING.tipCard}>
		<p class={LANDING.tipCopy}>
			Tip: Once on the flowchart page you can export a PNG snapshot or copy a direct link for
			embedding in documentation and coursework.
		</p>
	</div>

	<div class={LANDING.projectsSection} aria-labelledby="projects-heading">
		<div class={LANDING.projectsIntro}>
			<h2 id="projects-heading" class={LANDING.projectsHeading}>Upcoming INFS1701 Projects</h2>
			<p class={LANDING.projectsCopy}>
				These placeholders reserve space for future networking and cybersecurity resources such as
				configuration labs, incident response drills, and vulnerability reports. Swap the titles and
				descriptions when each artefact is ready to publish.
			</p>
		</div>
		<div class={LANDING.projectGrid}>
			<article class={LANDING.projectCard} aria-label="Placeholder for Security Operations Playbook">
				<h3 class={LANDING.projectTitle}>Security Operations Playbook</h3>
				<p class={LANDING.projectCopy}>
					Coming soon: a guide for monitoring the simulated campus SOC with incident response
					checklists and escalation paths.
				</p>
				<span class={LANDING.placeholder}>Placeholder</span>
			</article>
			<article class={LANDING.projectCard} aria-label="Placeholder for Network Lab Guides">
				<h3 class={LANDING.projectTitle}>Network Lab Guides</h3>
				<p class={LANDING.projectCopy}>
					Reserve this tile for step-by-step switch and router configuration exercises that
					complement the topology.
				</p>
				<span class={LANDING.placeholder}>Placeholder</span>
			</article>
			<article class={LANDING.projectCard} aria-label="Placeholder for Cybersecurity Case Study">
				<h3 class={LANDING.projectTitle}>Cybersecurity Case Study</h3>
				<p class={LANDING.projectCopy}>
					Allocate this space to a threat modelling or penetration testing case study to highlight
					defensive strategies.
				</p>
				<span class={LANDING.placeholder}>Placeholder</span>
			</article>
		</div>
	</div>
</div>
