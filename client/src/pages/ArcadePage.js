import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ArcadePage.css';

const ArcadePage = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook to navigate between pages
  const [arcade, setArcade] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchArcade = async () => {
      try {
        const response = await fetch(`/api/arcades/${id}`);
        const data = await response.json();
        setArcade(data);
      } catch (error) {
        console.error('Error fetching arcade data:', error);
      }
    };

    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }

    fetchArcade();
  }, [id]);

  const handleRating = (index) => {
    setRating(index + 1);
  };

  const handleSubmitReview = async () => {
    if (!isLoggedIn) {
      alert('You must be logged in to submit a review.');
      return;
    }

    if (rating === 0 || review.trim() === '') {
      alert('You must provide both a rating and a review.');
      return;
    }

    try {
      const response = await fetch(`/api/arcades/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ rating, comment: review }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setArcade((prevArcade) => ({
          ...prevArcade,
          reviews: [newComment, ...prevArcade.reviews],
        }));
        setRating(0);
        setReview('');
      } else {
        const data = await response.json();
        alert(data.msg || 'Error submitting review.');
        console.error('Error submitting review:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? arcade.gallery.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === arcade.gallery.length - 1 ? 0 : prev + 1));
  };

  if (!arcade) {
    return <div>Loading arcade details...</div>;
  }

  return (
    <div className="arcade-page">
      <div className="arcade-header">
        <h1>{arcade.name}</h1>
      </div>
      <div className="arcade-content">
        <div className="arcade-left">
          <div className="arcade-description">
            <p>{arcade.description}</p>
          </div>
          <div className="arcade-slideshow">
            <button className="slide-button" onClick={prevSlide}>&lt;</button>
            <img
              src={`/assets/arcade-images/${arcade.gallery[currentSlide]}`}
              alt={`Slideshow ${currentSlide + 1}`}
              className="slideshow-image"
            />
            <button className="slide-button" onClick={nextSlide}>&gt;</button>
          </div>

          {isLoggedIn && (
            <div className="review-section">
              <textarea
                placeholder="Leave a review..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              ></textarea>
              <div className="star-rating">
                {[...Array(5)].map((_, index) => (
                  <span
                    key={index}
                    className={`star ${rating > index ? 'filled' : ''}`}
                    onClick={() => handleRating(index)}
                  >
                    &#9733;
                  </span>
                ))}
              </div>
              <button className="submit-review" onClick={handleSubmitReview}>
                Submit Review
              </button>
              <button className="back-button" onClick={() => navigate('/')}>
                &lt; Back
              </button>
            </div>
          )}
        </div>
        <div className="arcade-right">
          <div className="arcade-info-div">
            <p><strong>Hours:</strong></p>
            <ul>
              {Object.entries(arcade.hours_of_operation).map(([day, hours]) => (
                <li key={day}>
                  {day}: {hours.open} - {hours.close}
                </li>
              ))}
            </ul>
            <p><strong>Serves Alcohol:</strong> {arcade.serves_alcohol ? 'Yes' : 'No'}</p>
            <p><strong>Serves Food:</strong> {arcade.serves_food ? 'Yes' : 'No'}</p>
          </div>

          <div className="reviews-list">
            {arcade.reviews && arcade.reviews.length > 0 ? (
              arcade.reviews.map((review, index) => (
                <div key={index} className="comment">
                  <p>
                    <strong>{review.username}</strong> (
                    {new Date(review.created_at).toLocaleDateString()})
                  </p>
                  <p>Rating: {review.rating} stars</p>
                  <p>{review.comment}</p>
                </div>
              ))
            ) : (
              <p>No comments yet. Be the first to leave one!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArcadePage;
