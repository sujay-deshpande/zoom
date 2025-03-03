# Zoom API Integration

This repository contains a Node.js server and a simple Next.js frontend for integrating with the Zoom API. The project enables functionalities such as creating Zoom meetings, adding members, and retrieving past meeting data.

## Features
- Create Zoom meetings
- Add members to a Zoom meeting
- Retrieve past meeting data
- Fetch upcoming, ongoing, and previous meetings
- OAuth authentication for Zoom API access
- Simple Next.js frontend for testing API calls

## Tech Stack
- **Backend:** Node.js, Express, MongoDB
- **Frontend:** Next.js (Minimal UI for API testing)
- **Zoom API:** Used for meeting management

## Prerequisites
**Note:** You might require a Zoom Pro account to access certain meeting data features.
Before running the project, ensure you have:
- Node.js installed (v16+ recommended)
- A Zoom Developer Account with API credentials
- `.env` file with the following variables:
  ```env
  ZOOM_API_KEY=your_zoom_api_key
  ZOOM_API_SECRET=your_zoom_api_secret
  ZOOM_ACCOUNT_ID=your_zoom_account_id
  ZOOM_CLIENT_ID=your_zoom_client_id
  ZOOM_CLIENT_SECRET=your_zoom_client_secret
  REDIRECT_URI=your_redirect_uri
  MONGODB_URL=your_mongodb_url
  ```

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the backend server:
   ```sh
   npm run server
   ```
4. Start the frontend:
   ```sh
   npm run dev
   ```

## API Endpoints
### 1. OAuth Authentication
- **Endpoint:** `GET /api/auth/zoom`
- **Description:** Redirects to Zoom OAuth authorization URL

### 2. Create a Zoom Meeting
- **Endpoint:** `POST /api/create-meetings`
- **Description:** Creates a new Zoom meeting
- **Request Body:**
  ```json
  {
    "topic": "Team Meeting",
    "start_time": "2025-03-03T15:00:00Z",
    "duration": 30,
    "timezone": "UTC"
  }
  ```

### 3. Get Upcoming Meetings
- **Endpoint:** `GET /api/meetings/upcoming-meetings`
- **Description:** Retrieves a list of upcoming meetings

### 4. Get Ongoing Meetings
- **Endpoint:** `POST /api/meetings/ongoing`
- **Description:** Fetches currently live meetings

### 5. Get Previous Meetings
- **Endpoint:** `GET /api/meetings/previous-meetings`
- **Description:** Fetches past meeting data

### 6. Add Members to a Meeting
- **Endpoint:** `POST /api/meetings/join`
- **Description:** Adds a user to a Zoom meeting
- **Request Body:**
  ```json
  {
    "meetingId": "123456789",
    "name": "Sujay Deshpande",
    "email": "sujaydeshpande@yahoo.com"
  }
  ```

### 7. Fetch Users
- **Endpoint:** `GET /api/users`
- **Description:** Fetches Zoom account users

## Frontend Preview
A minimal Next.js UI is included to test API calls. Open `http://localhost:3000` to access the frontend.

## Contributing
Feel free to submit issues or pull requests to improve this project!

## License
This project is licensed under the MIT License.
