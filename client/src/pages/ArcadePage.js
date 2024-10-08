import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ArcadePage.css';

const ArcadePage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [arcade, setArcade] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [isOpen, setIsOpen] = useState(false);

  // Function to always get Eastern Time
  const getEasternTime = () => {
    const now = new Date();
    const easternTimeString = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
    }).format(now);

    const [hours, minutes] = easternTimeString.split(':').map(Number);
    return hours + minutes / 60;
  };

  const checkIfOpen = (hours) => {
    const currentDay = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        weekday: 'long',
    }).format(new Date());

    let currentTime = getEasternTime(); // Changed to 'let' to allow reassignment
    const todayHours = hours[currentDay];

    if (todayHours) {
        let openingTime = parseFloat(todayHours.open);
        let closingTime = parseFloat(todayHours.close);

        if (closingTime === 24) closingTime = 23.99;
        if (closingTime < openingTime) {
            if (currentTime < openingTime) currentTime += 24;
            closingTime += 24;
        }

        if (currentTime >= openingTime && currentTime < closingTime) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    } else {
        setIsOpen(false);
    }
};

const fetchArcadeDetails = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/arcades/${id}`);
    const responseText = await response.text();

    if (response.ok) {
      const data = JSON.parse(responseText);
      setArcade(data);
      checkIfOpen(data.hours_of_operation);
    } else {
      console.error('Error fetching arcade details:', response.status);
    }
  } catch (error) {
    console.error('Error fetching arcade details:', error);
  }
};


const fetchArcadeReviews = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/arcades/${id}/comments`);
    const contentType = response.headers.get('content-type');

    if (response.ok && contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Fetched reviews data:', data);
      setReviews(data);
    } else {
      const errorText = await response.text();
      console.error('Received non-JSON response:', errorText);
      throw new Error(`Expected JSON but received ${contentType}`);
    }
  } catch (error) {
    console.error('Error fetching arcade reviews:', error);
  }
};


  
  
  useEffect(() => {
    fetchArcadeDetails();
    fetchArcadeReviews();
    setIsLoggedIn(!!user);
  }, [id, user]);

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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/arcades/${id}/comments`, {
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
      alert('An error occurred while submitting your review. Please try again later.');
    }
  };
  

  const prevSlide = () => {
    if (arcade && arcade.gallery) {
      setCurrentSlide((prev) => (prev === 0 ? arcade.gallery.length - 1 : prev - 1));
    }
  };

  const nextSlide = () => {
    if (arcade && arcade.gallery) {
      setCurrentSlide((prev) => (prev === arcade.gallery.length - 1 ? 0 : prev + 1));
    }
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
            {arcade.gallery && (
              <img
                src={`/assets/arcade-images/${arcade.gallery[currentSlide]}`}
                alt={`Slideshow ${currentSlide + 1}`}
                className="slideshow-image"
              />
            )}
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
              {arcade.hours_of_operation && Object.entries(arcade.hours_of_operation).map(([day, hours]) => (
                <li key={day}>
                  {day}: {hours.open} - {hours.close}
                </li>
              ))}
            </ul>
            <p><strong>Status:</strong> {isOpen ? 'Open' : 'Closed'}</p>
            <p><strong>Serves Alcohol:</strong> {arcade.serves_alcohol ? 'Yes' : 'No'}</p>
            <p><strong>Serves Food:</strong> {arcade.serves_food ? 'Yes' : 'No'}</p>

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
            {reviews.length > 0 ? (
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
