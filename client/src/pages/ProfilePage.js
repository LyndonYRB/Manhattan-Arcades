import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editedComment, setEditedComment] = useState(''); // For capturing edited comment
  const [editedRating, setEditedRating] = useState(0); // For capturing edited rating
  const [reviewIdBeingEdited, setReviewIdBeingEdited] = useState(null); // Track the review being edited
  const navigate = useNavigate(); // Use navigate for redirection

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      navigate('/'); // Redirect to home page if not logged in
      return;
    }

    setIsLoggedIn(true);

    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 403) {
          throw new Error('Forbidden access - Invalid token');
        }

        const data = await response.json();
        setReviews(data.comments || []); // Safeguard against undefined 'comments'
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, [navigate]);

  const handleDelete = async (reviewId) => {
    const confirmed = window.confirm("Are you sure you want to delete this review?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/comments/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setReviews(reviews.filter(review => review.id !== reviewId));
      } else {
        console.error('Error deleting review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleEdit = (reviewId) => {
    const reviewToEdit = reviews.find(review => review.id === reviewId);
    setEditedComment(reviewToEdit.comment);
    setEditedRating(reviewToEdit.rating);
    setReviewIdBeingEdited(reviewId);
  };

  const handleSaveEdit = async () => {
    const updatedReviewData = {
      comment: editedComment, // Use the state value for the edited comment
      rating: editedRating, // Use the state value for the edited rating
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/comments/${reviewIdBeingEdited}`, {
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
            review.id === reviewIdBeingEdited ? updatedReview : review
          )
        );
        setReviewIdBeingEdited(null); // Reset after saving
        setEditedComment('');
        setEditedRating(0);
      } else {
        console.error('Error editing review');
      }
    } catch (error) {
      console.error('Error editing review:', error);
    }
  };

  return (
    <div className="profile-page">
      <h1>Your Reviews</h1>
      {isLoggedIn ? (
        <div className="reviews-container">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={review.id || index} className="review-card">
                <h3>{review.arcade_name || 'Unknown Arcade'}</h3> {/* Fallback to 'Unknown Arcade' if name is missing */}
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
                    <button onClick={() => handleDelete(review.id)} className="delete-btn">Delete</button>
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
    </div>
  );
};

export default ProfilePage;
