import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProfilePage.css';

const ProfilePage = ({ user }) => {
  // Check if the user object and user.comments are defined
  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  if (!user.comments) {
    user.comments = []; // Initialize comments as an empty array if undefined
  }

  return (
    <div className="profile-page">
      <h1>{user.username}'s Profile</h1>
      <p>Email: {user.email}</p>
      <p>Member since: {new Date(user.created_at).toLocaleDateString()}</p>

      <h2>Your Comments</h2>
      {user.comments.length > 0 ? (
        <ul>
          {user.comments.map((comment, index) => (
            <li key={index}>
              <strong>Arcade:</strong> {comment.arcade_id}<br />
              <strong>Comment:</strong> {comment.comment}<br />
              <strong>Rating:</strong> {comment.rating}<br />
              <strong>Date:</strong> {new Date(comment.created_at).toLocaleDateString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't made any comments yet.</p>
      )}

      {/* Back to Home Button */}
      <Link to="/">
        <button className="back-button">Back to Home</button>
      </Link>
    </div>
  );
};

export default ProfilePage;
