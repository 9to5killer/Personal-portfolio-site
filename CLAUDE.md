# CLAUDE.md — kevinclark.ai Portfolio Site

## Behavior Instructions
- Never output full file rewrites unless explicitly asked
- Provide targeted edits: show only the changed lines with enough context to locate them
- When making multiple changes, list them as numbered steps with file paths and line references
- Prefer terminal commands for anything that can be done via CLI
- Flag any change that could break the build before making it

## Project
- Live site: kevinclark.ai
- Stack: Astro, React, Tailwind CSS, Framer Motion, Three.js
- Deploy: Vercel via GitHub push (auto-deploys in 2-3 min)
- Repo: github.com/9to5killer/Personal-portfolio-site
- Local: /Users/takamiclark/kevinclark-site

## Deploy Workflow
git add .
git commit -m "describe change"
git push

## Design System
- Background: Cream #F5F0E6
- Hero background: Dark navy #0A0E1A
- Accent/cursor: Terracotta #C65D3A
- Typography: Inter Display (sans) + Fraunces (serif italic)
- KC Monogram: 4 vertical pill-shaped bars (Variant 3)

## Sections (in order)
01 - ABOUT
02 - EXPERIENCE
03 - DOMAINS
04 - DEPLOYMENT (4 colored panels — centerpiece)
05 - PROJECTS (placeholder → real cards)
06 - WRITING (placeholder → essays)
07 - CONNECT

## Deployment Panels
- DISCOVER / THE WORKFLOW — Deep navy #1A2A3F
- BUILD / PRODUCTION SYSTEMS — Terracotta #C65D3A
- EVALUATE / THE THRESHOLD — Sage #7A8B6F
- SCALE / ACROSS THE ORG — Stone gray #8B8682
- Rounded outer corners: 24px
- Hover: flex-grow animation, 1.1s tween easing

## Hero
- Two column: 55% text left, 45% particle field right
- 2400 particles, 12-second cycle (chaos → sphere → dissolve)
- Dark-to-cream fade on scroll
- Custom cursor: terracotta dot

## Contact
- Email: kc@kevinclark.ai
- LinkedIn: linkedin.com/in/kevinfrancisclark
- GitHub: github.com/9to5killer

## Pending Work
- Copy edits throughout
- Projects section: next card = Meeting Intelligence Agent
- Writing section: fill with essays
- Mobile hamburger menu refinement

## Owner
Kevin Clark — Director | AI Strategy & Deployment, professional services
Portfolio target: VP/CAO of AI at AI-native companies
