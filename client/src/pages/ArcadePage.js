import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ArcadePage.css';

const ArcadePage = () => {
  const { id } = useParams();
  const [arcade, setArcade] = useState(null);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArcadeDetails = async () => {
      try {
        const arcadeResponse = await axios.get(`/api/arcades/${id}`);
        setArcade(arcadeResponse.data);

        const commentsResponse = await axios.get(`/api/arcades/${id}/comments`);
        setComments(commentsResponse.data);
      } catch (err) {
        setError('Failed to load arcade details.');
      }
    };

    fetchArcadeDetails();
  }, [id]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!arcade) {
    return <div>Loading...</div>;
  }

  return (
    <div className="arcade-page">
      <div className="arcade-header">
        <button className="back-button" onClick={() => navigate(-1)}>Back</button>
        <h1>{arcade.name}</h1>
      </div>
      <div className="arcade-content">
        <div className="arcade-description">
          <p>{arcade.description}</p>
        </div>
        <div className="arcade-details">
          <p><strong>Days Open:</strong> {arcade.days_open}</p>
          <p><strong>Hours of Operation:</strong> {Object.entries(arcade.hours_of_operation).map(([day, hours]) => (
            <div key={day}>
              {day}: {hours.open} - {hours.close}
            </div>
          ))}</p>
          <p><strong>Serves Alcohol:</strong> {arcade.serves_alcohol ? 'Yes' : 'No'}</p>
          {/* Add subway information or other details here */}
        </div>
      </div>
      <div className="arcade-slideshow">
        {/* Placeholder for image slideshow */}
      </div>
      <div className="review-section">
        <textarea placeholder="Leave a comment..."></textarea>
        <div className="star-rating">
          {/* Placeholder for star rating */}
        </div>
      </div>
      <div className="reviews-list">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              <p><strong>{comment.username}</strong> ({new Date(comment.date).toLocaleDateString()})</p>
              <p>Rating: {comment.rating} stars</p>
              <p>{comment.comment}</p>
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to leave one!</p>
        )}
      </div>
    </div>
  );
};

export default ArcadePage;
