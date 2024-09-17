import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ArcadePage.css';

const ArcadePage = ({ user }) => { // Accept user as prop
  const { id } = useParams();
  const navigate = useNavigate();
  const [arcade, setArcade] = useState(null); 
  const [reviews, setReviews] = useState([]);  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!user); // Check if user is logged in
  const [isOpen, setIsOpen] = useState(false);

  const getEasternTime = () => {
    const now = new Date();
    const estOffset = -5 * 60; // Eastern Standard Time (EST) offset in minutes
    const isDST = now.getTimezoneOffset() < estOffset; // Check if daylight saving time is in effect
    const offset = isDST ? -4 * 60 : estOffset; // Use daylight saving time offset if necessary
    const easternTime = new Date(now.getTime() + (offset * 60 * 1000));
    return easternTime;
};


  const checkIfOpen = (hours) => {
    const now = getEasternTime(); // Get the current time in Eastern Time
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' }); // Get current day in full (Monday, etc.)
    const currentTime = now.getHours() + (now.getMinutes() / 60); // Get current time in decimal (e.g., 5.5 for 5:30 PM)
  
    console.log("Current Day:", currentDay);
    console.log("Current Time (in decimal):", currentTime);
    console.log("Today's Arcade Hours (from DB):", hours[currentDay]);
  
    const todayHours = hours[currentDay]; // Get the hours for the current day
  
    if (todayHours) {
      let openingTime = parseFloat(todayHours.open);  // Convert opening time to decimal
      let closingTime = parseFloat(todayHours.close); // Convert closing time to decimal
  
      // Handle closing time past midnight
      if (closingTime < openingTime) {
        // Add 24 hours to the closing time if it's past midnight
        closingTime += 24;
      }
  
      console.log("Opening Time:", openingTime);
      console.log("Closing Time:", closingTime);
  
      // Determine if the current time is within the open hours
      if (currentTime >= openingTime && currentTime < closingTime) {
        setIsOpen(true); // Arcade is open
      } else {
        setIsOpen(false); // Arcade is closed
      }
    } else {
      setIsOpen(false); // If no hours are found for today, assume closed
    }
  };
  

  const fetchArcadeDetails = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/arcades/${id}`);
      const data = await response.json();
      setArcade(data);
      checkIfOpen(data.hours_of_operation);
    } catch (error) {
      console.error('Error fetching arcade details:', error);
    }
  };

  const fetchArcadeReviews = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/arcades/${id}/comments`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching arcade reviews:', error);
    }
  };

  useEffect(() => {
    fetchArcadeDetails();
    fetchArcadeReviews();

    // Update login state based on the current user
    setIsLoggedIn(!!user);  // Update when user logs in/out
  }, [id, user]); // Add user as a dependency to update when login status changes

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
            </div>
          )}
          <button className="back-button" onClick={() => navigate('/')}>
            &lt; Back
          </button>
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

            {/* Nearest Trains Section */}
            <p><strong>Nearest Trains:</strong></p>
            <div className="train-icons">
              {arcade.nearest_train && JSON.parse(arcade.nearest_train).map((train, index) => (
                <img
                  key={index}
                  src={`/assets/train-symbols/${train.train}.svg.png`}
                  alt={`Train ${train.train}`}
                  className="train-icon"
                />
              ))}
            </div>
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
