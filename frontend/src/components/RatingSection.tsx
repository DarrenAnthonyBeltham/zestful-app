import React, { useState, useEffect } from 'react';
import { Card, Form, Button, ListGroup, Alert, Spinner } from 'react-bootstrap';
import { Star, StarFill } from 'react-bootstrap-icons';
import { authService } from '../services/auth.service';
import { RecipeRating } from '../types/rating.types';

interface RatingSectionProps {
  recipeId: string;
}

export const RatingSection: React.FC<RatingSectionProps> = ({ recipeId }) => {
  const [ratings, setRatings] = useState<RecipeRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/ratings/${recipeId}`);
      if (response.ok) {
        const data: RecipeRating[] = await response.json();
        setRatings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [recipeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authService.isLoggedIn()) {
      setError("You must be logged in to leave a review.");
      return;
    }
    if (userRating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await authService.fetchWithAuth('/api/ratings', {
        method: 'POST',
        body: JSON.stringify({ recipeId, rating: userRating, comment })
      });

      if (!response.ok) throw new Error("Failed to submit rating");

      setComment('');
      setUserRating(0);
      fetchRatings(); 
    } catch (err) {
      if (err instanceof Error && err.message !== "Session expired") {
        setError("Could not submit rating. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = ratings.length > 0
    ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length).toFixed(1)
    : 'No ratings yet';

  return (
    <div className="mt-5">
      <h3 style={{ color: 'var(--matcha-dark)' }}>Reviews & Ratings</h3>
      <p className="text-muted">Average Rating: <strong>{averageRating}</strong> {ratings.length > 0 && <StarFill color="orange" className="mb-1" />}</p>

      <Card className="mb-4 p-3" style={{ backgroundColor: 'var(--matcha-bg)' }}>
        <h5>Leave a Review</h5>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <div className="mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <span 
                key={star} 
                onClick={() => setUserRating(star)}
                style={{ cursor: 'pointer', marginRight: '5px', fontSize: '1.5rem' }}
              >
                {star <= userRating ? <StarFill color="orange" /> : <Star color="gray" />}
              </span>
            ))}
          </div>
          <Form.Group className="mb-3">
            <Form.Control 
              as="textarea" 
              rows={3} 
              placeholder="Write your thoughts..." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Review'}
          </Button>
        </Form>
      </Card>

      {loading ? (
        <Spinner animation="border" size="sm" />
      ) : (
        <ListGroup variant="flush">
          {ratings.map((review) => (
            <ListGroup.Item key={review.id} style={{ backgroundColor: 'transparent' }}>
              <div className="d-flex justify-content-between">
                <strong>{review.user.username}</strong>
                <small className="text-muted">
                  {new Date(review.createdAt).toLocaleDateString()}
                </small>
              </div>
              <div className="mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>
                    {i < review.rating ? <StarFill color="orange" size={12} /> : <Star color="lightgray" size={12} />}
                  </span>
                ))}
              </div>
              <p className="mb-0">{review.comment}</p>
            </ListGroup.Item>
          ))}
          {ratings.length === 0 && <p className="text-muted">No reviews yet. Be the first!</p>}
        </ListGroup>
      )}
    </div>
  );
};