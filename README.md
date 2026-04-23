# Sentinel AI — Tourist Safety Platform

> Real-time tourist safety monitoring with geofencing alerts, incident tracking, and AI-powered risk assessment.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

## What is this?

Sentinel AI is a hackathon project that tackles tourist safety in unfamiliar cities. Tourists register and share location; admins monitor incidents in real-time with AI-powered severity assessment and anomaly detection.

**Built at a hackathon** — the concept was validated with demo data from Tokyo and Manhattan tourist zones.

## Features

- **Dual-role system** — tourists register & share location; admins monitor & respond
- **Geofencing** — define safe zones and get alerts when tourists deviate
- **AI anomaly detection** — Gemini categorizes incidents (Lost, Coercion, Medical, Other)
- **Safety Score gauge** — real-time risk assessment per tourist
- **Digital ID cards** — generated for each registered tourist
- **Incident dashboard** — admin view with severity filtering and AI assessment

## Tech Stack

React, TypeScript, Vite, Gemini API, Tailwind CSS, component-based state management

## Quick Start

```bash
git clone https://github.com/nnish16/Tourist-Safety.git
cd Tourist-Safety
npm install
echo "GEMINI_API_KEY=your_key" > .env.local
npm run dev
```

## License

[MIT](LICENSE) — Nishant Sarang
