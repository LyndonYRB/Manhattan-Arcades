import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';

const ProfilePage = ({ user }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editedComment, setEditedComment] = useState('');
  const [editedRating, setEditedRating] = useState(0);
  const [reviewIdBeingEdited, setReviewIdBeingEdited] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        return;
      }
  
      setIsLoggedIn(true);
  
      try {
        const response = await fetch(`${baseURL}/api/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          if (data.comments) {
            setReviews(data.comments);
          } else {
            setReviews([]);
          }
        } else {
          const errorText = await response.text();
          console.error('Error fetching reviews:', errorText);
          setError('Error fetching reviews');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Error fetching reviews');
      }
    };
  
    fetchReviews();
  }, [navigate, baseURL]);

  // Handle deleting a review
  const handleDelete = async (reviewId) => {
    const confirmed = window.confirm('Are you sure you want to delete this review?');
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/comments/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setReviews(reviews.filter((review) => review.id !== reviewId));
      } else {
        setError('Error deleting review');
      }
    } catch (error) {
      setError('Error deleting review');
    }
  };

  // Handle editing a review
  const handleEdit = (reviewId) => {
    const reviewToEdit = reviews.find((review) => review.id === reviewId);
    setEditedComment(reviewToEdit.comment);
    setEditedRating(reviewToEdit.rating);
    setReviewIdBeingEdited(reviewId);
  };

  // Save the edited review
  // Save the edited review
const handleSaveEdit = async () => {
  const updatedReviewData = {
    comment: editedComment,
    rating: editedRating,
  };

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseURL}/api/comments/${reviewIdBeingEdited}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedReviewData),
    });

    if (response.ok) {
      const updatedReview = await response.json();
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewIdBeingEdited
            ? { ...review, ...updatedReview }  // Ensure the arcade_name is not overwritten
            : review
        )
      );
      setReviewIdBeingEdited(null);
      setEditedComment('');
      setEditedRating(0);
    } else {
      setError('Error editing review');
    }
  } catch (error) {
    console.error('Error editing review:', error);
    setError('Error editing review');
  }
};


  return (
    <div className="profile-page">
      <h1>Your Reviews</h1>
      {isLoggedIn ? (
        <div className="reviews-container">
          {error && <p className="error-message">{error}</p>}
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={review.id || index} className="review-card">
                <h3>{review.arcade_name || 'Unknown Arcade'}</h3>
                <p>{new Date(review.created_at).toLocaleDateString()}</p>
                <p>Rating: {review.rating} stars</p>
                <p>{review.comment}</p>

                {reviewIdBeingEdited === review.id ? (
                  <div>
                    <textarea
                      value={editedComment}
                      onChange={(e) => setEditedComment(e.target.value)}
                    />
                    <input
                      type="number"
                      value={editedRating}
                      onChange={(e) => setEditedRating(Number(e.target.value))}
                      min="1"
                      max="5"
                    />
                    <button onClick={handleSaveEdit}>Save</button>
                  </div>
                ) : (
                  <div>
                    <button onClick={() => handleEdit(review.id)}>Edit</button>
                    <button onClick={() => handleDelete(review.id)} className="delete-btn">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>You have not posted any reviews yet.</p>
          )}
        </div>
      ) : (
        <p>Please log in to view your reviews.</p>
      )}

      <div className="navigation-buttons">
        <button className="back-button" onClick={() => navigate(-1)}>
          &lt; Back
        </button>
        <button className="home-button" onClick={() => navigate('/')}>
          Home
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
