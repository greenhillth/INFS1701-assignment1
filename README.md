# University Network Topology (SvelteKit + Tailwind)

This project is a **static SvelteKit web app** that visualises a sample university network topology.
It uses **TailwindCSS** for styling and supports **two icon sets** (Affinity SVG and Crayon PNG), stored in `static/icons/`.
Users can toggle between icon sets at runtime.

---

## 🚀 Features

- Built with **SvelteKit** and **TailwindCSS**
- Interactive landing page that links to the live topology canvas
- **Trust-zone layout** spanning edge, core, data centre, administration and labs
- **Reusable components** (`Icon.svelte`, `NodeCard.svelte`)
- **Store-driven icon toggle** (`affinity` ↔ `crayon`)
- Icons served directly from `/static/icons/`
- Ready to extend with your own SVG/PNG library (Cisco, custom Visio exports, etc.)

---

## 🛠️ Getting Started

### 1. Prerequisites

- **Node.js 18.13+** or **20+** (check with `node -v`)
- **npm** (check with `npm -v`)
- **nvm** is recommended for switching Node versions

### 2. Clone & install

```bash
git clone <your-repo-url>
cd INFS1701-assignment1
npm install
```

### 3. Run locally

```bash
npm run dev
# open http://localhost:5173
```

The root route (`/`) shows the landing page, while `/flowchart` renders the interactive network topology.

---

## 🌐 Deploying to GitHub Pages (with infs1701.greenhill.net.au)

The project is pre-configured with `@sveltejs/adapter-static` so it builds into a static `build/` directory that GitHub Pages can serve. A `static/CNAME` file is also included so GitHub automatically applies the `infs1701.greenhill.net.au` custom domain at publish time.

### 1. Prepare the static build

1. Build the site locally and verify the output:

   ```bash
   npm run build
   npm run preview  # optional sanity check
   ```

2. Commit the generated assets only when deploying (GitHub Pages will build them for you if you use Actions).

### 2. Publish via GitHub Actions

1. Push the repository to GitHub (e.g. `github.com/<username>/infs1701-assignment1`).
2. Create `.github/workflows/pages.yml` with the following workflow:

   ```yaml
   name: Deploy static site

   on:
     push:
       branches: [main]
     workflow_dispatch:

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: "pages"
     cancel-in-progress: false

   jobs:
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest

       steps:
         - name: Check out repository
           uses: actions/checkout@v4

         - name: Set up Node
           uses: actions/setup-node@v4
           with:
             node-version: 20

         - name: Install dependencies
           run: npm ci

         - name: Build static site
           run: npm run build

         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: ./build

         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

3. In your repository settings, enable **GitHub Pages** and choose the **GitHub Actions** source.
4. Trigger the workflow (push to `main` or run it manually). Pages will host the `build/` output at `https://<username>.github.io/<repo>/`.

### 3. Wire up `infs1701.greenhill.net.au`

1. In your DNS provider for `greenhill.net.au`, create a **CNAME record**:
   - **Host/Name:** `infs1701`
   - **Value:** `<username>.github.io`
   - **TTL:** 1 hour (or your preferred value)
2. Wait for DNS propagation (verify with `dig infs1701.greenhill.net.au +short`).
3. In the GitHub repository **Settings → Pages**, set the **Custom domain** to `infs1701.greenhill.net.au`. GitHub will detect the committed `CNAME` file and provision TLS automatically.
4. Future deployments keep the custom domain because the `static/CNAME` file is bundled into every build.

### 4. Share & embed the flowchart

- Visit `https://infs1701.greenhill.net.au/flowchart` for the full diagram.
- Use the **Copy share link** button in the Flowchart header to copy the canonical URL to your clipboard for embedding in other flowcharts or LMS materials.
- The landing page lives at `https://infs1701.greenhill.net.au/` and provides a call-to-action button for students.

---

## 📐 Layout tuning reference (`src/lib/topology/layouts/university.ts`)

### Layout settings

| Parameter | Effect |
| --- | --- |
| `settings.canvas.padding` | Sets extra whitespace around the diagram canvas (top/right/bottom/left in grid units). |
| `settings.canvas.maxWidth` | Constrains the maximum width of the rendered layout before scaling occurs. |
| `settings.canvas.render.width` / `padding` / `margin` | Optional defaults for `FlowCanvas` rendering. Accepts `'full-screen'`, fixed dimensions, and container spacing overrides. |
| `settings.zoneSpacing` | Controls horizontal/vertical spacing between zone containers. |
| `settings.nodeSpacing` | Default gap between nodes placed by `stackDevices`. |
| `settings.minNodeSize` / `maxNodeSize` | Clamp automatic scaling of node cards. |
| `settings.minNodeScale` | Minimum scale factor applied when space is tight. |
| `settings.linkStyle.stroke` | Colour of solid wired links. |
| `settings.linkStyle.dashedStroke` | Colour of dashed wireless links. |
| `settings.linkStyle.width` | Base stroke width of links. |
| `settings.linkStyle.dashArray` | Pattern used for dashed lines. |
| `settings.linkStyle.opacity` | Alpha applied to standard link strokes. |
| `settings.linkStyle.glowColor` / `glowBlur` | Colour and blur radius for the outer glow behind links. |
| `settings.routeStyle.gradientStops` | Colours used when animating highlighted traffic routes. |
| `settings.routeStyle.animationDistance` | How far animated highlights travel along a route (in grid units). |
| `settings.routeStyle.animationDuration` | Duration (seconds) for highlight animation loops. |
| `settings.routeStyle.highlightWidthMultiplier` | Multiplier that thickens highlighted paths relative to the base width. |
| `settings.routeStyle.solidDashArray` / `dashedDashArray` | Stroke patterns for animated overlays on wired vs wireless paths. |
| `settings.routeStyle.glowColor` / `glowBlur` | Visual emphasis colour and blur for animated routes. |
| `settings.routeStyle.fadeOutDelay` / `fadeOutDuration` | Timing controls for how quickly highlights dissipate. |
| `nodeGap` | Derived from `nodeSpacing` and passed to stacking helpers for horizontal spacing. |
| `rowGap` | Derived from `nodeGap` (≈1.4×) to create vertical spacing between rows. |

### Zones

| Zone ID | Label | Effect |
| --- | --- | --- |
| `edge` | Edge & Perimeter | Defines the perimeter segment and positions ISP/firewall stack near origin. |
| `core` | Core Network & Security | Houses core routing, switching and wireless control services. |
| `dc` | Data Centre / DMZ | Hosts distribution, DMZ switches, server clusters and storage. |
| `admin` | Administration Building | Aggregates admin distribution, access, staff clients and printers. |
| `labs` | Engineering Labs | Represents specialist lab distribution, access and research endpoints. |

Adjust each zone’s `origin`, `padding`, `minWidth` and `minHeight` to reposition or resize its container.

### Network profiles

Each profile supplies tooltip/network metadata for a node. Update the IP, subnet, MAC address or notes to match your scenario.

| Profile key | Device summary |
| --- | --- |
| `isp` | Carrier uplink gateway. |
| `edge-modem` | Demarcation modem handing off transit to the firewall. |
| `perimeter-fw` | Perimeter firewall northbound interface. |
| `core-router` | Campus core router advertising interior routes. |
| `core-switch` | Collapsed core switch providing high-speed uplinks. |
| `wlc` | Wireless LAN controller for AP policy management. |
| `dc-distribution` | Data centre aggregation layer. |
| `dmz-switch` | Segregated DMZ switching for public services. |
| `web-servers` | Public-facing web tier VIP. |
| `app-servers` | Application middleware servers. |
| `student-db` | Student information database cluster. |
| `backup-storage` | Backup storage array for snapshots. |
| `admin-distribution` | Administration distribution switch. |
| `admin-access` | Wired access switch for admin offices. |
| `admin-ap` | Staff wireless access point. |
| `admin-clients` | Representative admin staff endpoints. |
| `admin-printers` | Secure badge-release printer fleet. |
| `labs-distribution` | Engineering labs distribution switch. |
| `labs-access` | Access switch for engineering bench ports. |
| `labs-ap` | Labs wireless access point. |
| `labs-workstations` | High-performance research workstations. |
| `labs-iot` | IoT and prototyping devices. |

### Node placement helpers

| Helper | Effect |
| --- | --- |
| `stackDevices(direction, nodes, options)` | Quickly arranges related nodes in a row (`horizontal`) or column (`vertical`) inside a zone, spaced using `nodeGap` or `rowGap`. |
| `placeDevice(template, config)` | Places a single device at an absolute offset or relative to another node. Adjust `position` offsets to fine-tune placement. |

### Links

Each entry connects two nodes and can optionally set routing instructions:

- `routing: 'straight'` draws a direct line between nodes.
- `routing: 'orthogonal'` with `orientation` controls L-shaped bends.
- `dashed: true` renders the wireless association style defined in `linkStyle.dashedStroke`.

Update the `links` array to reflect new dependencies, redundant paths or wireless associations in your own topology.

---

## 📄 Licensing

This project is provided for educational purposes. Adapt the topology and deployment instructions to meet your institution’s policies.
