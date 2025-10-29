# SickFitPro

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR_SITE_ID/deploy-status)](https://app.netlify.com/sites/YOUR_SITE_NAME/deploys)

A modern fitness tracking app built with Next.js 15, TypeScript, Firebase RTDB, and lazy-loaded components for optimal performance.

## Features

- 🏁 Real-time workout tracking with session comparison
- 📈 Dynamic charts with safe Recharts wrappers
- 🌍 i18n support (English, Italian, Spanish, French)
- 🔒 Firebase Realtime Database with security rules
- ⚡ Lazy-loaded panels and components
- 🚀 Sentry error monitoring
- 🎨 Modern UI with shadcn/ui and Tailwind CSS

## Quick Start

```bash
npm ci
npm run dev
```

## Production Checklist

- [x] Next.js App Router optimized
- [x] TypeScript strict mode
- [x] Recharts safe dynamic imports
- [x] Sentry instrumentation with onRequestError
- [x] RTDB security rules deployed
- [x] UTC-based date calculations
- [x] Error boundaries throughout
- [x] A11y compliance (ARIA labels)

## Architecture

- **Frontend**: Next.js 15 with App Router
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth
- **Charts**: Recharts with safe dynamic wrappers
- **UI**: shadcn/ui + Tailwind CSS
- **Monitoring**: Sentry
- **Deployment**: Netlify

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run rtdb:rules:deploy` - Deploy Firebase RTDB rules
