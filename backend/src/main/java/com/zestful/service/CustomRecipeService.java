package com.zestful.service;

import com.zestful.model.CustomRecipe;
import com.zestful.model.CustomRecipeIngredient;
import com.zestful.model.User;
import com.zestful.payload.CustomRecipeDTO;
import com.zestful.repository.CustomRecipeRepository;
import com.zestful.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomRecipeService {

    private final CustomRecipeRepository customRecipeRepository;
    private final UserRepository userRepository;

    public CustomRecipeService(CustomRecipeRepository customRecipeRepository, UserRepository userRepository) {
        this.customRecipeRepository = customRecipeRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CustomRecipe createRecipe(CustomRecipeDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        CustomRecipe recipe = new CustomRecipe();
        recipe.setUser(user);
        recipe.setTitle(dto.getTitle());
        recipe.setInstructions(dto.getInstructions());
        recipe.setImageUrl(dto.getImageUrl());

        List<CustomRecipeIngredient> ingredients = dto.getIngredients().stream()
                .map(ingredientText -> {
                    CustomRecipeIngredient ingredient = new CustomRecipeIngredient();
                    ingredient.setIngredientText(ingredientText);
                    ingredient.setCustomRecipe(recipe);
                    return ingredient;
                })
                .collect(Collectors.toList());
        
        recipe.setIngredients(ingredients);
        
        return customRecipeRepository.save(recipe);
    }

    public List<CustomRecipe> getRecipesByUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return customRecipeRepository.findByUser(user);
    }

    public CustomRecipe getRecipeByIdAndUser(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        return customRecipeRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Recipe not found or access denied"));
    }
}