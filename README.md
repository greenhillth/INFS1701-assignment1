# University Network Topology (SvelteKit + Tailwind)

This project is a **static SvelteKit web app** that visualises a sample university network topology.  
It uses **TailwindCSS** for styling and supports **two icon sets** (Affinity SVG and Crayon PNG), stored in `static/icons/`.  
Users can toggle between icon sets at runtime.

---

## 🚀 Features

- Built with **SvelteKit** and **TailwindCSS**
- **Trust-zone layout**: Low, DMZ, Medium, High
- **Reusable components** (`Icon.svelte`, `NodeCard.svelte`)
- **Store-driven icon toggle** (`affinity` ↔ `crayon`)
- Icons served directly from `/static/icons/`
- Ready to extend with your own SVG/PNG library (Cisco, custom Visio exports, etc.)

---

## 🛠️ Getting Started

### 1. Prerequisites

- **Node.js 18.13+** or **20+**  
  (Check: `node -v`)  
- **npm** (Check: `npm -v`)  
- **nvm** is recommended for switching Node versions.

### 2. Clone & install

```bash
git clone <your-repo-url>
cd my-sveltekit-app   # or your project dir
npm install
