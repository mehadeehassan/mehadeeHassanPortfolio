# Mehadee Hassan — Portfolio Website

A personal portfolio website showcasing my projects, technical skills, and professional background as a Full Stack Software Engineer (MERN Stack).

**Live Site:** [https://mehadee-hassan-portfolio.netlify.app]

---

## 🖥️ Overview

This is a fully responsive, multi-page personal portfolio built with vanilla HTML, CSS, and JavaScript (Bootstrap 5). It features a dynamic project showcase with client-side pagination, a dark/light theme toggle with persisted user preference, and an animated cursor interaction — all built without any frontend framework or build tooling.

## ✨ Features

- **Dynamic Project Grid** — Projects are rendered from a single JS data array with automatic pagination (6 per page), so adding a new project only requires one object.
- **Dark / Light Mode** — Theme preference is toggled instantly and persisted via `localStorage`, applied pre-paint to avoid flash of unstyled content.
- **Expandable Project Descriptions** — Long descriptions are clamped with a "See More / See Less" toggle, generated dynamically for every rendered card.
- **Interactive Cursor Effect** — A lightweight particle/smoke trail follows the cursor, automatically disabled on touch devices and when the user prefers reduced motion.
- **Fully Responsive** — Built with Bootstrap 5 grid and custom CSS for a consistent experience across desktop, tablet, and mobile.
- **Multi-page Structure** — Separate Home and About pages sharing a common navbar and footer.

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Markup / Styling | HTML5, CSS3, Bootstrap 5 |
| Scripting | Vanilla JavaScript (ES6+) |
| Icons | Font Awesome |
| Hosting | [e.g. Vercel / GitHub Pages] |

## 📁 Project Structure

```
mehadeeHassanPortfolio/
├── index.html          # Home page (hero, skills, projects grid)
├── pages/
│   └── about.html       # About page
├── css/
│   └── index.css        # Global styles + theming
├── js/
│   └── index.js          # Theme toggle, cursor effect, projects rendering
├── images/               # Site images, logos, icons
└── files/
    └── MEHADEE_HASSAN.pdf # Downloadable resume/CV
```

## 🚀 Getting Started

No build step required — this is a static site.

```bash
# Clone the repository
git clone https://github.com/mehadeehassan/mehadeeHassanPortfolio.git

# Open in browser
cd mehadeeHassanPortfolio
open index.html   # or use VS Code Live Server
```

## 📬 Contact

- **Email:** mehedi19999@gmail.com
- **LinkedIn:** [linkedin.com/in/mehadee-hassan](https://www.linkedin.com/in/mehadee-hassan/)
- **GitHub:** [github.com/mehadeehassan](https://github.com/mehadeehassan)
- **Facebook:** [facebook.com/mehediahnaf1](https://www.facebook.com/mehediahnaf1)

## 📄 License

This project is open for reference and learning purposes. Please do not copy the personal branding/content as-is for your own portfolio.

---

⭐ If you found this helpful, consider giving the repo a star!
