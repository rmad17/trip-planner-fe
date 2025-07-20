# Trip Planner Frontend

A React-based web application that integrates with the trip-planner backend APIs for managing trips and user accounts.

## Features

- **User Authentication**: Separate registration and login pages with JWT authentication
- **Google OAuth**: Integration with Google login
- **Dashboard**: View all trips with the ability to create new ones
- **Trip Details**: Detailed view of individual trips
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Trip Planner Backend running on `http://localhost:8080`

## Installation

1. Navigate to the frontend directory:
```bash
cd trip-planner-fe
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Application Structure

### Pages

- **Login** (`/login`): User authentication with username/password or Google OAuth
- **Register** (`/register`): User registration with form validation
- **Dashboard** (`/dashboard`): Main page showing all trips with create trip functionality
- **Trip Details** (`/trip/:tripId`): Detailed view of a specific trip

### Components

- **ProtectedRoute**: HOC for route protection
- **AuthContext**: React context for authentication state management

### Services

- **API Service**: Axios-based HTTP client with JWT token management
- **Auth API**: User registration, login, and profile endpoints
- **Trip API**: Trip creation and retrieval endpoints

## API Integration

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/user/profile` - Get user profile
- `GET /api/v1/auth/google/login` - Google OAuth login

### Trips
- `POST /api/v1/trips/create` - Create new trip
- `GET /api/v1/trips` - Get all trips

## Environment Setup

Make sure the backend is running on `http://localhost:8080`. The frontend is configured to connect to this URL by default.

### Backend Requirements

The backend should be running with the following APIs available:
- Account management (registration/login)
- Trip management (CRUD operations)
- JWT authentication middleware
- Google OAuth integration

## Usage

1. **Registration**: Create a new account with username and password
2. **Login**: Sign in with credentials or Google account
3. **Dashboard**: View existing trips or create new ones
4. **Trip Creation**: Fill out the trip form with details like:
   - Place name
   - Start/end dates
   - Travel mode
   - Hotels (comma-separated)
   - Tags (comma-separated)
   - Notes
5. **Trip Details**: Click on any trip to view comprehensive details

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## Development

### Adding New Features

The application is structured to easily add new features:

1. **New Pages**: Add to `src/pages/` and update routing in `App.js`
2. **New Components**: Add to `src/components/`
3. **New API Endpoints**: Update `src/services/api.js`
4. **State Management**: Extend `AuthContext` or create new contexts

## Security

- JWT tokens are stored in localStorage
- API requests include authentication headers automatically
- Protected routes require authentication
- Password validation on registration
- Secure Google OAuth integration

## Styling

The application uses Tailwind CSS for styling, loaded via CDN for quick setup. For production, consider installing Tailwind CSS as a dependency for better performance and customization.

## Future Enhancements

- Trip editing functionality
- Trip sharing capabilities
- Advanced search and filtering
- Trip collaboration features
- Mobile app using React Native
- Offline support with service workers
