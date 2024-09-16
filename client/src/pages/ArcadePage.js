import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ArcadePage.css';

const ArcadePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [arcade, setArcade] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const getEasternTime = () => {
    const now = new Date();
    // Eastern Time is UTC-5 or UTC-4 (for daylight saving)
    const offset = now.getTimezoneOffset() === -240 ? -4 : -5; // Handle daylight saving
    const easternTime = new Date(now.getTime() + offset * 60 * 60 * 1000); // Apply UTC offset
    return easternTime;
  };

  const checkIfOpen = (hours) => {
    const now = getEasternTime();
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
    const currentTime = now.getHours() + now.getMinutes() / 60; // Convert current time to decimal

    console.log("Current Day:", currentDay);
    console.log("Current Time (in decimal):", currentTime);
    console.log("Today's Arcade Hours (from DB):", hours[currentDay]);

    const todayHours = hours[currentDay];

    if (todayHours) {
      let openingTime = parseFloat(todayHours.open);  // Opening time in decimal
      let closingTime = parseFloat(todayHours.close); // Closing time in decimal

      // Handle cases where closing time is after midnight (e.g., close at 2 AM)
      if (closingTime < openingTime) {
        if (currentTime >= openingTime) {
          closingTime += 24; // Add 24 hours to closing time for post-midnight handling
        }
      }

      console.log("Opening Time:", openingTime);
      console.log("Closing Time:", closingTime);

      // Determine if the arcade is currently open
      setIsOpen(currentTime >= openingTime && currentTime < closingTime);
    } else {
      setIsOpen(false); // Closed if no hours are available for today
    }
  };

  const fetchArcadeDetails = async () => {
    try {
      const response = await fetch(`/api/arcades/${id}`);
      const data = await response.json();
      setArcade(data);
      checkIfOpen(data.hours_of_operation);
    } catch (error) {
      console.error('Error fetching arcade details:', error);
    }
  };

  const fetchArcadeReviews = async () => {
    try {
      const response = await fetch(`/api/arcades/${id}/comments`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching arcade reviews:', error);
    }
  };

  useEffect(() => {
    fetchArcadeDetails();
    fetchArcadeReviews();

    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
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
        setReviews((prevReviews) => [newComment, ...prevReviews]);
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
            <p><strong>Status:</strong> {isOpen ? 'Open' : 'Closed'}</p>
            <p><strong>Serves Alcohol:</strong> {arcade.serves_alcohol ? 'Yes' : 'No'}</p>
            <p><strong>Serves Food:</strong> {arcade.serves_food ? 'Yes' : 'No'}</p>
          </div>

          <div className="reviews-list">
            {reviews && reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div key={index} className="comment">
                  <p>
                    <strong>{review.username}</strong> (
                    {new Date(review.created_at).toLocaleDateString()} )
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
