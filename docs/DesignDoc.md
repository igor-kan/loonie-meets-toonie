# Design Document

## System Architecture
- **Frontend:**
  - **Chrome Extension:** Uses React (with TypeScript) to render overlays and a popup. Styled with Tailwind CSS and ShadCN UI.
  - **Public Directory Website:** Built with Astro; embeds React components for interactive elements.
- **Backend:**
  - **Express API:** Provides endpoints for products and votes.
  - **Database:** PostgreSQL with schema validation via Drizzle ORM and Zod.
  - **AI Module:** Encapsulated in its own module (aiAgent.ts) using langgraph for product classification.
  - **Workflow Integration:** Optionally triggers n8n workflows for uncertain classifications.
- **Security & Testing:**
  - Strict TypeScript settings, Zod validation, unit tests with Jest.
  - CI/CD pipeline to run tests on every push.

## Data Flow
1. The extension scrapes product data from Amazon.
2. It either displays cached classification or requests the backend.
3. The backend uses the AI agent to compute a Canadian score and stores the product.
4. Users can vote and review; their input is stored via the API.
5. The public directory fetches product data for display.

## Modularity & Maintainability
- Each major feature (AI, controllers, routes) is separated into its own module.
- TypeScript and Zod ensure type safety and data integrity.
- Unit tests cover key modules.
- The code is designed with single-responsibility principles.

...
