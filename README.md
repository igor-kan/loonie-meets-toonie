# Buy Canadian

Buy Canadian is a multi-platform solution to help Canadian consumers support local products. The project includes:

- A **Chrome extension** that scrapes Amazon listings to show whether products are Canadian-made, using an AI agent to compute a “Canadian score.” Users can vote and leave reviews.
- A **backend API** built with Express, PostgreSQL (using Drizzle ORM and Zod), and integrated with an AI agent (via langgraph) plus optional n8n workflow triggers.
- A **public directory website** built with Astro and React to display curated Canadian products.

## Features
- **Real-Time Scraping & Overlays:** Automatically displays product classification on Amazon.
- **AI-Driven Classification:** Uses AI to compute a Canadian score based on product descriptions.
- **Community Voting & Reviews:** Allows users to upvote/downvote and review products.
- **Modular, Scalable Architecture:** Built with TypeScript, React, Tailwind CSS, and ShadCN UI.
- **Robust Testing:** Unit tests with Jest ensure quality and stability.

## Setup Instructions

### Backend
1. Navigate to the `backend/` directory.
2. Run `npm install` to install dependencies.
3. Create a `.env` file (see provided sample).
4. Run `npm start` to launch the server.
5. Run tests with `npm test`.

### Chrome Extension
1. Navigate to the `chrome-extension/` directory.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to develop and `npm run build` to produce the final extension bundle.
4. Load the built extension into Chrome via `chrome://extensions/`.

### Public Directory Website
1. Navigate to the `public-directory-website/` directory.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server.
4. Deploy on Vercel/Netlify as needed.

## Documentation
See the `docs/` folder for the PRD, Design Document, and Roadmap.

## License
MIT License.
d