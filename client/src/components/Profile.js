import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Assuming the token is stored in localStorage
        const token = localStorage.getItem('token'); 

        // Fetch profile data from the backend
        const response = await axios.get('http://localhost:5000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Set the user and comments data
        setUser(response.data.user);
        setComments(response.data.comments);
      } catch (err) {
        console.error('Error fetching profile data:', err);
      }
    };

    fetchProfile();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{user.username}'s Profile</h1>
      <p>Email: {user.email}</p>
      <p>Member since: {new Date(user.created_at).toLocaleDateString()}</p>

      <h2>Your Comments</h2>
      {comments.length === 0 ? (
        <p>You haven't made any comments yet.</p>
      ) : (
        <ul>
          {comments.map((comment, index) => (
            <li key={index}>
              <strong>Arcade ID:</strong> {comment.arcade_id}<br />
              <strong>Comment:</strong> {comment.comment}<br />
              <strong>Rating:</strong> {comment.rating}<br />
              <strong>Date:</strong> {new Date(comment.created_at).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Profile;
