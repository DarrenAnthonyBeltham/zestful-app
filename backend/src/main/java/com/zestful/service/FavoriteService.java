package com.zestful.service;

import com.zestful.model.FavoriteRecipe;
import com.zestful.model.User;
import com.zestful.payload.FavoriteRecipeDTO;
import com.zestful.repository.FavoriteRecipeRepository;
import com.zestful.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRecipeRepository favoriteRecipeRepository;
    private final UserRepository userRepository;

    public FavoriteService(FavoriteRecipeRepository favoriteRecipeRepository, UserRepository userRepository) {
        this.favoriteRecipeRepository = favoriteRecipeRepository;
        this.userRepository = userRepository;
    }

    public FavoriteRecipe addFavorite(FavoriteRecipeDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (favoriteRecipeRepository.findByUserAndRecipeUri(user, dto.getRecipeUri()).isPresent()) {
            throw new IllegalStateException("Recipe already saved");
        }

        FavoriteRecipe newFavorite = new FavoriteRecipe();
        newFavorite.setUser(user);
        newFavorite.setRecipeUri(dto.getRecipeUri());
        newFavorite.setLabel(dto.getLabel());
        newFavorite.setImageUrl(dto.getImageUrl());
        newFavorite.setCalories(dto.getCalories());

        return favoriteRecipeRepository.save(newFavorite);
    }

    public List<FavoriteRecipe> getFavorites(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        return favoriteRecipeRepository.findByUser(user);
    }
}