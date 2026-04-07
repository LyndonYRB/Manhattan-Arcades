# Manhattan Arcades

Manhattan Arcades is a location-based discovery app for exploring arcade venues across Manhattan through a clean, map-driven interface. The product is designed to make niche entertainment spots easier to browse by bringing venue details, hours, amenities, transit context, and community reviews into a single focused experience.

The project combines frontend UX thinking with full-stack implementation. On the client side, the interface emphasizes responsive layouts, readable content hierarchy, and fast venue exploration. On the backend, an Express API and PostgreSQL database support venue data, authentication, and user-generated reviews.

## Features

- Browse arcade venues across Manhattan from a location-oriented interface
- Open dedicated venue detail views with descriptions, hours, amenities, and gallery images
- View nearby train lines to add practical transit context
- Register and sign in to unlock authenticated actions
- Post one review per venue and view community ratings
- Manage personal review activity from the profile experience
- Use the app across desktop and mobile layouts

## Tech Stack

- Frontend: React, React Router, Axios
- Backend: Node.js, Express
- Database: PostgreSQL
- Auth: JWT-based authentication
- Styling / UI: CSS, Material UI

## Architecture / How It Works

The React frontend handles routing, UI state, and authenticated interactions. It requests venue and review data from the Express API, renders venue browsing and detail views, and updates the interface based on login state.

The Express backend exposes REST endpoints for authentication, arcade listings, venue details, profile data, and review CRUD operations. PostgreSQL stores users, arcades, and comments, while JWT tokens secure protected routes such as posting, editing, and deleting reviews.

In local development, the frontend runs from the `client/` directory and the backend runs from the project root. The client is configured to communicate with the API through `REACT_APP_API_URL` and also includes a proxy to `http://localhost:5000`.

## Screens / Core User Flow

- Browse venues from the main discovery view
- Select a venue and view detailed information
- Sign in or register for an account
- Post a rating and written review
- Manage your own reviews from the profile page

## Local Development

### Prerequisites

- Node.js 20.x recommended
- PostgreSQL

### 1. Install dependencies

From the project root:

```bash
npm install
```

From the client directory:

```bash
cd client
npm install
```

### 2. Configure environment variables

Create or update the root `.env` file with your local database connection and API settings:

```env
DB_USER=postgres
DB_HOST=127.0.0.1
DB_NAME=arcade_locator
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
REACT_APP_API_URL=http://localhost:5000
```

The `client/.env` file can also define `REACT_APP_API_URL`, but for local development this project is set up to work against `http://localhost:5000`.

### 3. Set up the database

Create a PostgreSQL database named `arcade_locator`, then use the schema in the project root:

```bash
psql -d arcade_locator -f schema.sql
```

### 4. Start the backend

From the project root:

```bash
npm run dev
```

Or run the production-style server locally:

```bash
npm start
```

The API runs on `http://localhost:5000`.

### 5. Start the frontend

From the `client/` directory:

```bash
npm start
```

The client runs on `http://localhost:3000`.

## Future Improvements

- Add stronger map interactions for browsing and comparing venues
- Introduce search and filtering by neighborhood, amenities, or rating
- Improve mobile-specific layout polish and touch interactions
- Expand review features with sorting, editing feedback, and richer moderation states
- Add loading, empty, and error states that feel more product-ready across all screens
- Refine venue discovery with clearer onboarding and contextual recommendations

## Why This Project Matters

Manhattan Arcades demonstrates my ability to build a full-stack product with a strong frontend focus. It shows how I approach UI clarity, API-driven state, authentication-aware experiences, and information architecture to turn structured venue data into a polished, user-centered web application.
