-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,               -- Unique identifier for each user
    username VARCHAR(100) NOT NULL,      -- Username for the user
    email VARCHAR(255) UNIQUE NOT NULL,  -- Email address for the user (must be unique)
    password VARCHAR(255) NOT NULL,      -- Hashed password for security
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp for when the user was created
);

-- Create the arcades table
CREATE TABLE arcades (
    id SERIAL PRIMARY KEY,               -- Unique identifier for each arcade
    name VARCHAR(255) NOT NULL,          -- Name of the arcade
    address VARCHAR(255),                -- Address of the arcade
    days_open VARCHAR(255),              -- Days the arcade is open
    hours_of_operation JSONB,            -- JSONB format to store the opening and closing hours
    serves_alcohol BOOLEAN,              -- Boolean indicating if the arcade serves alcohol
    serves_food BOOLEAN,                 -- Boolean indicating if the arcade serves food
    description TEXT,                    -- Detailed description of the arcade
    nearest_train JSONB,                 -- JSONB format to store nearest train information
    gallery TEXT[],                      -- Array of URLs to images for the arcade
    background_image TEXT                -- URL to the background image for the arcade
);

-- Create the comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,               -- Unique identifier for each comment
    user_id INT REFERENCES users(id) ON DELETE CASCADE, -- Foreign key to the users table
    arcade_id INT REFERENCES arcades(id) ON DELETE CASCADE, -- Foreign key to the arcades table
    comment TEXT NOT NULL,               -- The comment text
    rating INT CHECK (rating >= 1 AND rating <= 5), -- Rating between 1 and 5
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for when the comment was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp for when the comment was last updated
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_arcades_name ON arcades(name);
CREATE INDEX idx_comments_arcade_id ON comments(arcade_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Insert initial data (optional)
-- INSERT INTO arcades (name, address, serves_alcohol) VALUES ('Example Arcade', '123 Main St, City, Country', true);

-- Additional tables or constraints can be added as needed.
