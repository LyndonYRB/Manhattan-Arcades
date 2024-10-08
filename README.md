# Arcade Locator Web App

A full-stack web application that allows users to search, view, and review arcades located in Manhattan.

## Features
- **Arcade Information**: Display arcade details such as location, hours of operation, and available amenities.
- **Rating System**: Users can rate and leave reviews for arcades.
- **Login and Registration**: Users can register, log in, and access their profile.
- **Nearest Train Information**: Display train symbols for the nearest stations to each arcade.
- **Responsive Design**: Optimized for mobile and desktop devices.

## Technologies Used
- **Frontend**: React, Material UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Token)
- **Deployment**: (not yet)

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
