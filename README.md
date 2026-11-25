# Harivansh — Data Science & ML Engineering Portfolio

A fast, zero-build, responsive personal portfolio designed for a **Data Scientist / Machine Learning Engineer**. Built with semantic **HTML5**, modular **CSS3** (glassmorphism, CSS custom properties, dark/light themes, print stylesheet), and clean **Vanilla JavaScript** with real client-side Data Science demos.

---

## 1. Folder Structure & Architecture

```text
Protfolio/
├── index.html      # Semantic layout, SEO/OG tags, section containers & modal shells
├── style.css       # Design tokens, dark/light analogous section palette & print CSS
├── data.js         # Editable personal profile, KPI placeholders, skills, timeline & certs
├── projects.js     # 100% data-driven projects catalog + copy-paste template for new projects
├── script.js       # Interactive controller (canvas, skill highlights, modals, demos & palette)
└── README.md       # Customization checklist & free deployment steps
```

### How the Modules Connect
1. **`data.js`** exposes `window.PORTFOLIO_DATA` (profile info, KPI counters, skills matrix, timeline, certifications).
2. **`projects.js`** exposes `window.PROJECTS_DATA` (all project metadata, pipeline stages, results, and `miniPreviewType`).
3. **`script.js`** reads both global datasets on `DOMContentLoaded`, dynamically renders sections, wires interactive card widgets and the 4-tab Case Study Modal, and manages Dark/Light theme + `Ctrl+K` / `Cmd+K` Command Palette.

---

## 2. Customization Checklist

### A. Update Personal Details, Email, Photo & Resume (`data.js`)
Open `data.js` and edit `window.PORTFOLIO_DATA.profile`:
- **`email`**: Replace `harivansh.datascience@example.com` with your real email address.
- **`location`**, **`bio`**, **`roles`**, **`primaryStack`**, **`focusAreas`**: Customize with your exact background.
- **Profile Photo**:
  1. Create an `assets/` folder and add `assets/harivansh.jpg`.
  2. Set `avatarUrl: "assets/harivansh.jpg"` in `data.js`. (Leaving it `""` displays the built-in crisp SVG monogram placeholder.)
- **Hosted PDF Resume**:
  1. Place your PDF at `assets/Harivansh_Resume.pdf`.
  2. Set `resumePdfUrl: "assets/Harivansh_Resume.pdf"` in `data.js`. (Even without a static PDF, clicking **Save / Print PDF** inside the Resume Preview Modal generates a clean 1-page printable PDF via `@media print`.)
- **KPI Counters (`kpis`)**: Replace the editable placeholder numbers (`14+`, `6`, `45M+`) with your verified metrics, and remove or customize the `* Editable placeholder metrics` caption in `index.html` once finalized.

### B. Add Experience or Education Entries (`data.js`)
Copy the commented template inside `PORTFOLIO_DATA.timeline` and paste a new object with `kind: "work"` or `kind: "education"`. The timeline, filter pills (`All` / `Experience` / `Education`), and Resume Preview Modal update automatically.

### C. Add a New Project in 30 Seconds (`projects.js`)
1. Copy the template block at the top of `projects.js`.
2. Paste it into `window.PROJECTS_DATA`.
3. Pick any supported `miniPreviewType` for automatic live card + modal interactivity:
   - `"churn"` — Churn risk slider + SHAP-style attribution simulator
   - `"forecast"` — Multi-horizon SVG forecast chart + CI band toggle
   - `"sentiment"` — Live NLP sentiment & intent classifier
   - `"threshold"` — Precision/Recall fraud cutoff simulator
   - `"vision"` — Optical PCB defect inspector & confidence cutoff
   - `"abtest"` — Two-proportion Z-test significance calculator

### D. Connect the Contact Form (`index.html`)
- **Option 1 — Formspree (works on GitHub Pages, Vercel, or Netlify):**
  1. Create a free form at [formspree.io](https://formspree.io/).
  2. In `index.html`, set `data-formspree-url="https://formspree.io/f/YOUR_FORM_ID"` on `<form id="contact-form">`.
- **Option 2 — Netlify Forms:**
  1. `data-netlify="true"` and `<input type="hidden" name="form-name" value="portfolio-contact" />` are already included in `index.html`.
  2. Remove `e.preventDefault()` or handle AJAX POST to `/` once deployed on Netlify.

### E. Update SEO & Open Graph Tags (`index.html`)
Update `og:url`, `og:image`, and the `<script type="application/ld+json">` URL after deploying to your domain.

---

## 3. Running Locally

Because this site uses zero build tools, you can preview it immediately with any local static server:

```bash
# Python 3
python -m http.server 8000
# Open http://localhost:8000
```

Or with Node.js:
```bash
npx serve .
```

---

## 4. Free Hosting Instructions

### Option 1: GitHub Pages
1. Push all files (`index.html`, `style.css`, `data.js`, `projects.js`, `script.js`, `README.md`) to a GitHub repository (e.g., `username.github.io` or `portfolio`).
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**, pick `main` and `/ (root)`, and click **Save**.
4. Your site goes live within ~60 seconds at `https://<username>.github.io/<repo>/`.

### Option 2: Netlify (Drag & Drop or Git)
1. Sign in at [app.netlify.com](https://app.netlify.com/).
2. Drag and drop your project folder directly onto **Sites → Add new site → Deploy manually**, **or** connect your GitHub repo with blank build command and publish directory `.`.
3. Optional: enable **Form detection** under **Forms** to activate Netlify Forms.

### Option 3: Vercel
1. Sign in at [vercel.com](https://vercel.com/) and click **Add New → Project**.
2. Import your GitHub repository (Framework Preset: **Other** / static HTML, no build command needed).
3. Click **Deploy** — or deploy from your terminal with:
   ```bash
   npx vercel --prod
   ```
