<svelte:head>
        <title>INFS1701 Networking &amp; Cybersecurity Hub</title>
        <meta
                name="description"
                content="Explore INFS1701 networking and cybersecurity resources, including the interactive network topology diagram and future project showcases."
        />
</svelte:head>

<div class="landing">
        <div class="landing__content">
                <p class="landing__eyebrow">Greenhill Institute of Technology</p>
                <h1 class="landing__title">INFS1701 Networking &amp; Cybersecurity Hub</h1>
                <p class="landing__lead">
                        Your starting point for INFS1701 projects. Launch the interactive network topology to
                        explore the Greenhill campus design, or keep an eye on the placeholders below as new
                        cybersecurity artefacts come online.
                </p>

                <div class="landing__actions">
                        <a class="landing__button" href="/flowchart">View the network topology</a>
                        <a class="landing__link" href="/flowchart" target="_blank" rel="noreferrer">
                                Open topology in a new tab
                        </a>
                </div>
        </div>

        <div class="landing__note">
                <p>
                        Tip: Once on the flowchart page you can export a PNG snapshot or copy a direct link for
                        embedding in documentation and coursework.
                </p>
        </div>

        <div class="landing__grid" aria-labelledby="projects-heading">
                <div class="landing__grid-header">
                        <h2 id="projects-heading">Upcoming INFS1701 Projects</h2>
                        <p>
                                These placeholders reserve space for future networking and cybersecurity resources
                                such as configuration labs, incident response drills, and vulnerability reports.
                                Swap the titles and descriptions when each artefact is ready to publish.
                        </p>
                </div>
                <div class="landing__grid-items">
                        <article class="landing__card" aria-label="Placeholder for Security Operations Playbook">
                                <h3>Security Operations Playbook</h3>
                                <p>
                                        Coming soon: a guide for monitoring the simulated campus SOC with incident
                                        response checklists and escalation paths.
                                </p>
                                <span class="landing__badge">Placeholder</span>
                        </article>
                        <article class="landing__card" aria-label="Placeholder for Network Lab Guides">
                                <h3>Network Lab Guides</h3>
                                <p>
                                        Reserve this tile for step-by-step switch and router configuration exercises
                                        that complement the topology.
                                </p>
                                <span class="landing__badge">Placeholder</span>
                        </article>
                        <article class="landing__card" aria-label="Placeholder for Cybersecurity Case Study">
                                <h3>Cybersecurity Case Study</h3>
                                <p>
                                        Allocate this space to a threat modelling or penetration testing case study
                                        to highlight defensive strategies.
                                </p>
                                <span class="landing__badge">Placeholder</span>
                        </article>
                </div>
        </div>
</div>

<style>
        .landing {
                min-height: 100vh;
                display: grid;
                gap: 2.5rem;
                align-items: center;
                justify-items: center;
                padding: clamp(3rem, 4vw, 5rem) clamp(1.5rem, 4vw, 5rem);
                background: radial-gradient(circle at top right, rgba(56, 189, 248, 0.1), transparent 45%),
                        radial-gradient(circle at bottom left, rgba(34, 197, 94, 0.12), transparent 50%), #020617;
                color: #e2e8f0;
        }

        .landing__content {
                max-width: 48rem;
                text-align: center;
                display: grid;
                gap: 1.5rem;
        }

        .landing__eyebrow {
                font-size: 0.9rem;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                font-weight: 600;
                color: rgba(148, 163, 184, 0.85);
                margin-bottom: 1rem;
        }

        .landing__title {
                font-size: clamp(2rem, 5vw, 3.25rem);
                font-weight: 700;
                color: #f8fafc;
                margin-bottom: 1rem;
        }

        .landing__lead {
                font-size: 1.1rem;
                line-height: 1.7;
                margin: 0 auto;
                color: rgba(226, 232, 240, 0.88);
        }

        .landing__actions {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                align-items: center;
        }

        @media (min-width: 640px) {
                .landing__actions {
                        flex-direction: row;
                }
        }

        .landing__button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                padding: 0.85rem 1.85rem;
                border-radius: 999px;
                background: linear-gradient(135deg, #38bdf8, #4ade80);
                color: #0f172a;
                font-weight: 600;
                text-decoration: none;
                box-shadow: 0 12px 30px rgba(56, 189, 248, 0.35);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .landing__button:hover,
        .landing__button:focus-visible {
                transform: translateY(-2px);
                box-shadow: 0 18px 36px rgba(74, 222, 128, 0.35);
        }

        .landing__link {
                color: rgba(148, 163, 184, 0.95);
                font-weight: 500;
                text-decoration: none;
                border-bottom: 1px solid rgba(148, 163, 184, 0.4);
                padding-bottom: 0.2rem;
        }

        .landing__link:hover,
        .landing__link:focus-visible {
                color: #f8fafc;
                border-bottom-color: #f8fafc;
        }

        .landing__note {
                max-width: 40rem;
                background: rgba(15, 23, 42, 0.75);
                padding: 1.25rem 1.5rem;
                border-radius: 1rem;
                border: 1px solid rgba(148, 163, 184, 0.25);
                text-align: center;
                line-height: 1.6;
                color: rgba(226, 232, 240, 0.9);
        }

        .landing__grid {
                width: min(1080px, 100%);
                display: grid;
                gap: 2rem;
        }

        .landing__grid-header {
                display: grid;
                gap: 0.75rem;
                text-align: center;
        }

        .landing__grid-header h2 {
                font-size: clamp(1.5rem, 3vw, 2.2rem);
                color: #f8fafc;
        }

        .landing__grid-header p {
                margin: 0 auto;
                max-width: 52ch;
                color: rgba(226, 232, 240, 0.8);
                line-height: 1.6;
        }

        .landing__grid-items {
                display: grid;
                gap: 1.5rem;
        }

        @media (min-width: 768px) {
                .landing__grid-items {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                }
        }

        .landing__card {
                background: rgba(15, 23, 42, 0.65);
                border: 1px solid rgba(148, 163, 184, 0.22);
                border-radius: 1.25rem;
                padding: 1.5rem;
                display: grid;
                gap: 0.75rem;
                text-align: left;
                position: relative;
                min-height: 220px;
        }

        .landing__card h3 {
                margin: 0;
                font-size: 1.2rem;
                color: #f1f5f9;
        }

        .landing__card p {
                margin: 0;
                line-height: 1.6;
                color: rgba(226, 232, 240, 0.85);
        }

        .landing__badge {
                justify-self: start;
                padding: 0.25rem 0.75rem;
                border-radius: 999px;
                background: rgba(74, 222, 128, 0.18);
                color: #4ade80;
                font-weight: 600;
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.08em;
        }
</style>
