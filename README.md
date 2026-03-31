# WanderLust

WanderLust is a full-stack travel listing platform built with Node.js, Express, MongoDB, EJS, Passport, Cloudinary, and MapTiler. Users can browse stay listings, create and manage their own properties, upload images, leave reviews, search destinations, and view listing locations on an interactive map.

## Overview

This project is a server-rendered web application focused on travel and stay discovery. It uses:

- `Express` for routing and middleware
- `EJS` and `ejs-mate` for templating and layout support
- `MongoDB Atlas` and `Mongoose` for persistence
- `Passport Local` for authentication
- `Cloudinary` and `multer-storage-cloudinary` for image uploads
- `MapTiler` for geocoding and map display
- `Joi` for request validation
- `connect-flash` and sessions for user feedback and login persistence

## Features

- Browse all listings with pagination
- Search listings by title, location, or country
- Create a new listing with image upload
- Edit and delete listings owned by the logged-in user
- View individual listing details with owner and review data
- Add and delete reviews
- User signup, login, and logout
- Location geocoding for listings
- Interactive map rendering on listing detail pages
- Flash messages for success and failure states

## Tech Stack

### Backend

- Node.js `v18.20.3`
- Express `5.2.1`
- Mongoose `9.0.0`
- Passport `0.7.0`
- Joi `18.0.2`

### Frontend

- EJS templates
- Bootstrap-based UI
- Custom CSS and client-side validation

### Cloud and External Services

- MongoDB Atlas for database hosting
- Cloudinary for media storage
- MapTiler for geocoding and map tiles

## Project Structure

```text
WanderLust/
|-- app.js
|-- cloudConfig.js
|-- middleware.js
|-- schema.js
|-- controllers/
|-- models/
|-- routes/
|-- utils/
|-- views/
|-- public/
`-- init/
```

### Important folders

- `controllers/` contains route handler logic
- `models/` defines Mongoose schemas for listings, reviews, and users
- `routes/` contains Express routers
- `views/` contains EJS templates
- `public/` contains static CSS and client-side JavaScript
- `utils/` contains shared helpers such as custom errors and async wrappers
- `init/` appears intended for database seed/setup data

## Data Model

### User

Defined in [models/user.js](C:/Projects/WanderLust/models/user.js).

- `email`
- `username` and password hash/salt are added through `passport-local-mongoose`

### Listing

Defined in [models/listing.js](C:/Projects/WanderLust/models/listing.js).

- `title`
- `description`
- `image`
  - `filename`
  - `url`
- `price`
- `location`
- `country`
- `owner`
- `reviews`
- `geometry`
  - GeoJSON `Point`
  - coordinates stored as `[longitude, latitude]`
- `category`

Listings also cascade-delete their linked reviews through a Mongoose post hook when a listing is deleted.

### Review

Defined in [models/review.js](C:/Projects/WanderLust/models/review.js).

- `comment`
- `rating` from 1 to 5
- `createdAt`
- `author`

## Authentication and Authorization

### Authentication

Authentication is implemented with `passport`, `passport-local`, and `passport-local-mongoose`.

Flow:

1. A user signs up through `/signup`
2. The password is hashed and stored by `passport-local-mongoose`
3. A user logs in through `/login`
4. Passport stores the authenticated user in the session
5. `req.isAuthenticated()` is used to protect restricted routes

Relevant files:

- [app.js](C:/Projects/WanderLust/app.js)
- [routes/user.js](C:/Projects/WanderLust/routes/user.js)
- [controllers/users.js](C:/Projects/WanderLust/controllers/users.js)
- [models/user.js](C:/Projects/WanderLust/models/user.js)

### Authorization

Authorization is enforced through custom middleware in [middleware.js](C:/Projects/WanderLust/middleware.js).

Current authorization rules:

- Only logged-in users can create listings
- Only the listing owner can edit or delete a listing
- Only logged-in users can create reviews
- Only the review author can delete their review

Middleware used:

- `isLoggedIn`
- `isOwner`
- `isReviewAuthor`
- `savedRedirectUrl`

`isLoggedIn` also stores the original URL in session so the app can redirect the user back after login.

## Cloud Usage

Cloud integration is handled through [cloudConfig.js](C:/Projects/WanderLust/cloudConfig.js).

### Cloudinary

Cloudinary is used for image hosting instead of storing uploaded files on the local server.

How it works:

1. `multer` receives the uploaded image from the listing form
2. `multer-storage-cloudinary` sends the file to Cloudinary
3. The uploaded file metadata is returned as `req.file`
4. The listing stores:
   - `image.url`
   - `image.filename`

Storage configuration:

- Folder: `WanderLust`
- Allowed formats: `jpg`, `jpeg`, `png`

Routes using Cloudinary upload:

- `POST /listings`
- `PUT /listings/:id`

### MongoDB Atlas

The application connects to MongoDB using the `ATLASDB_URL` environment variable from [app.js](C:/Projects/WanderLust/app.js).

MongoDB is used to store:

- users
- listings
- reviews
- session-related app data if Mongo session store is enabled later

Note:

- `connect-mongo` is installed and partially configured in [app.js](C:/Projects/WanderLust/app.js), but the session store is currently commented out. Sessions currently rely on the default in-memory session store.

## Map Usage

The project uses `@maptiler/sdk` and the MapTiler Geocoding API.

### Geocoding

When a listing is created or updated, the app sends the entered location to MapTiler and converts it into geographic coordinates.

Implemented in [controllers/listing.js](C:/Projects/WanderLust/controllers/listing.js).

Flow:

1. User submits a location string
2. The app calls the MapTiler Geocoding API
3. The first returned match is used
4. Coordinates are saved into `listing.geometry`

This makes the listing map-ready and ensures each listing stores a reusable geographic point.

### Map Rendering

The listing details page renders an interactive map in [views/listings/show.ejs](C:/Projects/WanderLust/views/listings/show.ejs).

How it works:

- MapTiler SDK is loaded from CDN
- `process.env.MAP_TOKEN` is passed into the page
- Stored coordinates are injected into the client-side script
- A map is centered on the listing's location with the `STREETS` style

Use case:

- Visitors can visually understand where the stay is located
- Coordinates generated during listing creation/update are reused for frontend display

## Validation

Validation is defined in [schema.js](C:/Projects/WanderLust/schema.js) using `Joi`.

### Listing validation

The listing schema validates:

- `title`
- `description`
- `country`
- `location`
- `price`
- optional image object structure

### Review validation

The review schema validates:

- `rating`
- `comment`

Validation middleware is applied in [middleware.js](C:/Projects/WanderLust/middleware.js).

Important current behavior:

- `validateReview` throws an `ExpressError(400)` when review data is invalid
- `validateListing` builds the Joi error message but currently does not throw or return it because the error path is commented out

That means review validation is enforced, but listing validation is only partially enforced in the current implementation.

## Error Handling

Error handling uses a combination of custom errors, async wrappers, flash messages, and a centralized Express error middleware.

### Components

#### Custom error class

[utils/ExpressError.js](C:/Projects/WanderLust/utils/ExpressError.js) is used to create structured application errors with a status code and message.

#### Async wrapper

[utils/wrapAsync.js](C:/Projects/WanderLust/utils/wrapAsync.js) wraps async controllers so rejected promises reach the global error handler.

#### Global error middleware

The final middleware in [app.js](C:/Projects/WanderLust/app.js) catches errors and renders `views/error.ejs`.

#### 404 handling

Unknown routes are forwarded to a `404 Page Not Found` error before hitting the global handler.

### Practical error-handling behavior

- Missing listing pages redirect with a flash error
- Invalid review payloads raise `400`
- Missing or invalid locations during geocoding trigger flash errors and redirect back
- Unhandled server errors render a shared error page

### Current limitations

- Session storage is not yet using MongoDB in production mode because the store is commented out
- Listing validation does not currently block invalid listing submissions
- Some async routes such as search/suggestions are not wrapped in the shared async helper
- `cloudConfig.js` logs the Cloudinary secret to the console, which should be removed for production safety

## Routes

### Listing routes

- `GET /listings` - list all listings with pagination and optional search
- `GET /listings/new` - render new listing form
- `POST /listings` - create listing
- `GET /listings/:id` - show single listing
- `GET /listings/:id/edit` - render edit form
- `PUT /listings/:id` - update listing
- `DELETE /listings/:id` - delete listing
- `GET /listings/suggestions` - JSON suggestion endpoint
- `GET /listings/search` - render search results

### Review routes

- `POST /listings/:id/reviews` - create review
- `DELETE /listings/:id/reviews/:reviewId` - delete review

### User routes

- `GET /signup` - signup page
- `POST /signup` - create account
- `GET /login` - login page
- `POST /login` - authenticate user
- `GET /logout` - logout user

## Search and UX Helpers

Client-side code in [public/js/script.js](C:/Projects/WanderLust/public/js/script.js) provides:

- Bootstrap form validation styling
- Debounced search suggestion behavior
- Click-outside suggestion closing

The current suggestion UI fetches server-rendered listing HTML from `/listings?search=...`, parses it in the browser, and extracts up to five listing titles.

## Environment Variables

Create a `.env` file in the project root and configure the following values:

```env
ATLASDB_URL=your_mongodb_atlas_connection_string
SECRET=your_session_secret
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
MAP_TOKEN=your_maptiler_api_key
NODE_ENV=development
```

### What each variable is used for

- `ATLASDB_URL` connects the app to MongoDB
- `SECRET` signs the session cookie
- `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET` configure Cloudinary
- `MAP_TOKEN` powers geocoding and map rendering
- `NODE_ENV` controls whether `.env` is loaded locally

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/boyinatulasiram/WanderLust.git
cd WanderLust
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add environment variables

Create `.env` in the project root using the variables shown above.

### 4. Start the app

```bash
npm run dev
```

or

```bash
npm start
```

### 5. Open in the browser

```text
http://localhost:8080
```

## How to Use the Application

### For visitors

1. Open the home page
2. Browse listings
3. Search by place name, title, or country
4. Open a listing to view details, image, map, and reviews

### For registered users

1. Sign up for an account
2. Log in
3. Create a new listing
4. Upload an image
5. Provide a valid location so coordinates can be generated
6. Edit or delete only your own listings
7. Add reviews to listings

## Development Notes

The application currently follows a classic MVC-like Express structure:

- routes define endpoint structure
- controllers contain business logic
- models define persisted entities
- middleware centralizes auth and validation checks
- views render server-side HTML

This makes the codebase approachable for learning full-stack Node.js development and for extending features such as:

- category filters
- booking workflows
- image deletion/replacement cleanup in Cloudinary
- stronger role-based authorization
- API endpoints for mobile or SPA clients
- production-grade session storage

## Known Gaps and Improvements

- Enable and test `connect-mongo` session storage
- Re-enable blocking behavior in `validateListing`
- Add stronger error handling around external API failures
- Add tests for auth, listing CRUD, and review flows
- Hide sensitive logs and rotate any exposed secrets
- Improve search suggestions by returning lightweight JSON instead of parsing HTML

## Scripts

Defined in [package.json](C:/Projects/WanderLust/package.json):

- `npm start` runs `node app.js`
- `npm run dev` runs `nodemon app.js`

## License

This repository currently uses the `ISC` license as declared in [package.json](C:/Projects/WanderLust/package.json).
