package com.zestful.service;

import com.zestful.model.RecipeRating;
import com.zestful.model.User;
import com.zestful.payload.RatingDTO;
import com.zestful.repository.RecipeRatingRepository;
import com.zestful.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RatingService {

    private final RecipeRatingRepository ratingRepository;
    private final UserRepository userRepository;

    public RatingService(RecipeRatingRepository ratingRepository, UserRepository userRepository) {
        this.ratingRepository = ratingRepository;
        this.userRepository = userRepository;
    }

    public RecipeRating addRating(RatingDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        RecipeRating rating = new RecipeRating();
        rating.setUser(user);
        rating.setRecipeId(dto.getRecipeId());
        rating.setRating(dto.getRating());
        rating.setComment(dto.getComment());

        return ratingRepository.save(rating);
    }

    public List<RecipeRating> getRatingsForRecipe(String recipeId) {
        return ratingRepository.findByRecipeIdOrderByCreatedAtDesc(recipeId);
    }
}