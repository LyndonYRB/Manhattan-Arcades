# Manhattan Arcades

Manhattan Arcades is a location-based discovery app for exploring arcade venues across Manhattan. It brings venue details, operating hours, nearby transit context, amenities, and user reviews into a more focused browsing experience.

## Features
- **Venue discovery**: Browse arcade locations across Manhattan and open dedicated detail views.
- **Clear venue details**: Review hours of operation, amenities, and supporting venue information in one place.
- **Community reviews**: Authenticated users can rate venues and leave comments.
- **Transit-aware browsing**: Surface nearby train lines to add local context for each arcade.
- **Responsive interface**: Optimized for desktop and mobile exploration.

## Technologies Used
- **Frontend**: React, React Router, Material UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Token)
- **Deployment**: Ready for local development; deployment configuration can be added as needed.

## Setup Instructions

### Prerequisites
- Node.js
- PostgreSQL
- Git

### Steps to Run Locally
1. Clone the repository:
    ```bash
    git clone https://github.com/LyndonYRB/Manhattan-Arcades.git
    ```

2. Navigate to the project directory:
    ```bash
    cd Manhattan-Arcades
    ```

3. Install dependencies:
    ```bash
    npm install
    ```

4. Set up the PostgreSQL database:
    - Create a PostgreSQL database.
    - Update the .env file with your database credentials:
      ```bash
      DB_USER=your_db_user
      DB_HOST=localhost
      DB_NAME=arcade_locator
      DB_PASSWORD=your_password
      DB_PORT=5432
      JWT_SECRET=your_jwt_secret
      ```
    - Run the migrations to set up the database tables:
      ```bash
      npm run migrate
      ```
    - Start the backend server:
      ```bash
      npm run start
      ```

5. Navigate to the client folder and install the frontend dependencies:
    ```bash
    cd client
    npm install
    ```

6. Start the frontend server:
    ```bash
    npm start
    ```

The app should now be running on http://localhost:3000/ with the backend running on http://localhost:5000/.

Contributing
Feel free to submit pull requests to improve this project.

License
This project is licensed under the MIT License.
