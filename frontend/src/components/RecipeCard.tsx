import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EdamamRecipe } from '../types/recipe.types';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { Heart, HeartFill, FolderPlus } from 'react-bootstrap-icons';

interface RecipeCardProps {
  recipe: EdamamRecipe;
  onAddToCollection?: (recipe: EdamamRecipe) => void; // New Prop
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { 
    scale: 1.03,
    boxShadow: "0 8px 20px rgba(0,0,0,0.07)"
  }
};

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onAddToCollection }) => {
  const isLoggedIn = authService.isLoggedIn();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isCustom = recipe.uri.startsWith('custom_');
  
  const recipeId = recipe.uri.split('_').pop() || '';
  const recipeLink = isCustom ? `/custom-recipe/${recipeId}` : `/recipe/${recipeId}`;

  const handleSave = async () => {
    if (isSaving || isSaved || isCustom) return;
    setIsSaving(true);

    const recipeData = {
      recipeUri: recipe.uri,
      label: recipe.label,
      imageUrl: recipe.image,
      calories: recipe.calories
    };

    try {
      const response = await fetch('/api/favorites/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader()
        },
        body: JSON.stringify(recipeData)
      });

      if (response.ok) {
        setIsSaved(true);
        userService.recordAction('SAVE_RECIPE');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="h-100"
    >
      <Card className="h-100 shadow-sm" style={{ borderRadius: 'var(--bs-border-radius-lg)', overflow: 'hidden' }}>
        <Link to={recipeLink} style={{ textDecoration: 'none' }}>
          <Card.Img 
            variant="top" 
            src={recipe.image} 
            style={{ height: '200px', objectFit: 'cover' }}
          />
        </Link>
        <Card.Body className="d-flex flex-column">
          <Link to={recipeLink} style={{ textDecoration: 'none' }}>
            <Card.Title 
              style={{ color: 'var(--matcha-dark)', minHeight: '3rem', fontSize: '1.1rem' }}
              className="fw-bold"
            >
              {recipe.label}
            </Card.Title>
          </Link>
          
          <Card.Text className="text-muted small">
            {isCustom ? 'My Custom Recipe' : `${Math.round(recipe.calories)} Calories`}
          </Card.Text>

          <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
             <div className="d-flex gap-2">
                {isLoggedIn && !isCustom && (
                  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={handleSave} style={{ cursor: 'pointer', color: isSaved ? '#e63946' : 'var(--matcha-medium)' }}>
                    {isSaved ? <HeartFill size={20} /> : <Heart size={20} />}
                  </motion.div>
                )}
                {isLoggedIn && onAddToCollection && (
                   <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => onAddToCollection(recipe)} style={{ cursor: 'pointer', color: 'var(--matcha-medium)' }} title="Add to Cookbook">
                      <FolderPlus size={20} />
                   </motion.div>
                )}
             </div>

            {isCustom ? (
               <span className="badge bg-light text-dark border">Custom</span>
            ) : (
              <Link to={recipeLink} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                View
              </Link>
            )}
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};