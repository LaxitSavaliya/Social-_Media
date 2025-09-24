# Social Media App

A full-stack social media application with a modern React frontend (Vite) and a Node.js/Express backend. This project allows users to sign up, log in, create posts, comment, like, follow/unfollow, and receive notifications.

## Project Structure
```
Social_Media/
  Backend/    # Node.js + Express REST API
  Frontend/   # React + Tailwind + Vite client app
```

## Getting Started

### Prerequisites
- Node.js (v16 or above)
- MongoDB (local or cloud)
- Cloudinary account (for image uploads)

---

## Backend
See [`Backend/README.md`](./Backend/README.md) for detailed setup and API documentation.

### Quick Start
```sh
cd Backend
npm install
npm start
```

---

## Frontend
See [`Frontend/README.md`](./Frontend/README.md) for detailed setup and usage instructions.

### Quick Start
```sh
cd Frontend
npm install
npm run dev
```

---

## Environment Variables
- Backend: Copy `.env.example` to `.env` in the `Backend` folder and fill in your credentials.
- Frontend: Create a `.env` file in the `Frontend` folder if you need to override Vite or API settings.

---

## License
This project is licensed under the MIT License.
