# notes-test

QuickNotes is a web application for managing personal notes with tag-based filtering, built with React + TypeScript for the frontend and Node.js + Express for the backend.

## How to Run the Project Locally

This section outlines the steps for running the frontend and backend separately.

### 1. Clone the Repository

Start by cloning the repository:

```bash
git clone https://github.com/RostykZhuk/notes-test.git
cd notes-test
```

### 2. Running the Backend (Backend)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create the .env file if it doesn't exist and configure the necessary environment variables:
```bash
cp env.example .env
```
Edit the .env file to configure your environment (e.g., database connection, Redis, JWT secret, etc.).

3. Start the backend using Docker Compose:
```bash
docker-compose up -d --build
```

4. Verify the backend is running:
```bash
curl http://localhost:8080/health
```
You should see a response indicating the service is up and running.

### 3. Running the Frontend (Frontend)

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install the necessary dependencies:
```bash
npm install
```

3. Set up the environment variables for the API. Create or update the .env file with the following:
```bash
echo "REACT_APP_API_BASE_URL=http://localhost:8080" > .env
```

4. Start the frontend application:
```bash
npm start
```

The application will be available at: http://localhost:3000

### Notes:
- Ensure that the backend API is accessible at http://localhost:8080 for the frontend to work correctly.
- The frontend is configured to interact with the API for user authentication, notes CRUD operations, and tag-based filtering.

### Run the test suite
```bash
npm test
```
Runs Jest in watch mode with React Testing Library helpers.

### Create a production build
```bash
npm run build
```
Outputs an optimized bundle to the `build/` directory.

## Docker
A multi stage Dockerfile builds the React app and serves it through Nginx.
```bash
docker build -t quick-notes-frontend \
  --build-arg REACT_APP_API_BASE_URL=http://localhost:8080 .
docker run --rm -p 8080:80 quick-notes-frontend
```
The container exposes port 80 (mapped to 8080 in the example). Pass the correct API base URL at build time.

> Note: `docker-compose.yml` is a placeholder; it currently points the `frontend` build context to `./src` and does not orchestrate the planned backend services. Replace it with a full stack compose file once the API is implemented.
