# Frontend - Social Media App

This is the frontend for the Social Media application, built with React and Vite. It provides a modern, responsive user interface for interacting with the backend API, including authentication, posting, commenting, following users, and more.

## Features
- User authentication (sign up, login, onboarding)
- Create, view, and delete posts
- Like and comment on posts
- Follow/unfollow users and manage follow requests
- Real-time notifications
- Responsive layout with sidebars and modals
- API integration with backend server

## Project Structure
```
Frontend/
	package.json
	vite.config.js
	src/
		App.jsx                # Main app component
		main.jsx               # Entry point
		index.css              # Global styles
		assets/                # Static assets (logo, images)
		Components/            # Reusable UI components
		Hooks/                 # Custom React hooks
		Lib/                   # API and utility functions
		Pages/                 # Page components (Home, Login, Profile, etc.)
	public/                  # Static public files
```

## Getting Started

### Prerequisites
- Node.js (v16 or above recommended)

### Installation
1. Navigate to the `Frontend` directory:
	 ```sh
	 cd Frontend
	 ```
2. Install dependencies:
	 ```sh
	 npm install
	 ```

### Running the App
```sh
npm run dev
```
The app will start on the port specified by Vite (default: 5173). Open your browser and go to `http://localhost:5173`.

## Environment Variables
Create a `.env` file in the `Frontend` directory if you need to override Vite or API settings. Example:
```env
VITE_API_URL=http://localhost:3000/api
```

## Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License
This project is licensed under the MIT License.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.