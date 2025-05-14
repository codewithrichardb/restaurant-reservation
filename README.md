# Restaurant Reservation System

A modern restaurant reservation system built with Next.js and Bootstrap.

## Features

- Modern, responsive design using Bootstrap
- Interactive reservation system with real-time availability checking
- Customer information collection and special requests handling
- Admin dashboard for managing reservations
- MongoDB database for data persistence
- Authentication with NextAuth.js

## Pages

- **Home** - Attractive landing page showcasing the restaurant
- **Reservation** - Interactive reservation form with date/time selection
- **Confirmation** - Reservation details and confirmation
- **Admin** - Dashboard for restaurant staff to manage reservations

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/restaurant-reservation.git
cd restaurant-reservation
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Access

To access the admin dashboard, you need to:

1. Run the seed API endpoint to create an admin user:
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

2. Login with the admin credentials:
   - **Email**: admin@example.com
   - **Password**: admin123

You can customize these credentials in the `.env.local` file.

## Technologies Used

- Next.js 15
- React 19
- TypeScript
- Bootstrap 5 (via CDN)
- MongoDB for database
- Mongoose for MongoDB object modeling
- NextAuth.js for authentication
- React Context API for state management
- React Hook Form for form handling
- date-fns for date manipulation

## Project Structure

- `/src/app` - Next.js App Router pages
- `/src/components` - Reusable UI components
- `/src/context` - React Context for state management
- `/src/models` - MongoDB models
- `/src/lib` - Database connection utilities
- `/src/types` - TypeScript type definitions
- `/src/utils` - Utility functions
- `/public` - Static assets

## Deployment to Vercel

### Prerequisites

1. A MongoDB database (e.g., MongoDB Atlas)
2. A Vercel account
3. An SMTP server for sending emails

### Environment Variables

Set the following environment variables in your Vercel project settings:

- `MONGODB_URI`: Your MongoDB connection string
- `NEXTAUTH_SECRET`: A secret for NextAuth.js (generate a random string)
- `NEXTAUTH_URL`: The URL of your Vercel deployment (will be set automatically by Vercel)
- `EMAIL_HOST`: SMTP server host
- `EMAIL_PORT`: SMTP server port
- `EMAIL_SECURE`: Whether to use TLS (true/false)
- `EMAIL_USER`: SMTP server username
- `EMAIL_PASSWORD`: SMTP server password
- `EMAIL_FROM`: From email address for sent emails
- `ADMIN_EMAIL`: Email for the initial admin user
- `ADMIN_PASSWORD`: Password for the initial admin user
- `CRON_API_KEY`: API key for cron jobs (if used)

### Deployment Steps

1. Fork or clone this repository
2. Connect your GitHub repository to Vercel
3. Configure the environment variables in Vercel
4. Deploy the project

### Troubleshooting

If you encounter a 500 internal server error after deployment:

1. Check that all environment variables are set correctly in Vercel
2. Verify that your MongoDB connection string is correct and the database is accessible
3. Check the Vercel logs for any specific error messages
4. Make sure your MongoDB IP allowlist includes Vercel's IP ranges

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Frestaurant-reservation)
