# Product Requirements Document (PRD)

## Executive Summary
Buy Canadian is a multi-platform project that empowers Canadian consumers to identify and support Canadian-made products. It includes:
- A Chrome extension that scrapes Amazon pages to overlay indicators (✅, ❌, or ?) based on an AI-computed Canadian score.
- A community-driven voting and review system (with social authentication via Supabase).
- A public directory website displaying curated Canadian-made products.
- A backend API (using Node.js, Express, PostgreSQL, Drizzle ORM, and Zod) that handles product data, AI classification, and voting.

## Key Features
- **Chrome Extension:** Real-time scraping and overlay of product classifications.
- **AI Integration:** Uses an AI agent (via langgraph) to determine a “Canadian score.”
- **Community Feedback:** Voting and review functionalities for users to refine classifications.
- **Public Directory:** A searchable website listing Canadian products with detailed pages.
- **Backend API:** Robust, modular services with RESTful endpoints and social auth integration.
- **Monetization:** Grants, sponsorships, affiliate referrals, crowd-donations, and curated ad revenue.

## User Stories
- As a shopper, I want to know if a product is Canadian-made so I can support local businesses.
- As a community member, I want to vote on product classifications to help improve data quality.
- As an admin, I want a modular, scalable system that is maintainable and well-tested.

## Technical Overview
- **Frontend:** Chrome extension built with React, Tailwind, ShadCN UI, and TypeScript; public directory using Astro and React.
- **Backend:** Express API with PostgreSQL (managed via Drizzle ORM and Zod), integrated AI via langgraph, and optional n8n workflow triggers.
- **Deployment:** Backend hosted on Node.js/Supabase; website on Vercel/Netlify; extension distributed via Chrome Web Store.

...
