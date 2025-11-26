package com.zestful.service;

import com.zestful.model.FavoriteRecipe;
import com.zestful.model.RecipeCollection;
import com.zestful.model.User;
import com.zestful.repository.FavoriteRecipeRepository;
import com.zestful.repository.RecipeCollectionRepository;
import com.zestful.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CollectionService {

    private final RecipeCollectionRepository collectionRepository;
    private final UserRepository userRepository;
    private final FavoriteRecipeRepository favoriteRecipeRepository;

    public CollectionService(RecipeCollectionRepository collectionRepository, UserRepository userRepository, FavoriteRecipeRepository favoriteRecipeRepository) {
        this.collectionRepository = collectionRepository;
        this.userRepository = userRepository;
        this.favoriteRecipeRepository = favoriteRecipeRepository;
    }

    public List<RecipeCollection> getUserCollections(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return collectionRepository.findByUser(user);
    }

    public RecipeCollection createCollection(String name, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        RecipeCollection collection = new RecipeCollection();
        collection.setName(name);
        collection.setUser(user);
        return collectionRepository.save(collection);
    }

    @Transactional
    public void addRecipeToCollection(Long collectionId, Long recipeId, String userEmail) {
        RecipeCollection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        
        if (!collection.getUser().getEmail().equals(userEmail)) {
            throw new SecurityException("Not authorized");
        }

        FavoriteRecipe recipe = favoriteRecipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        collection.getRecipes().add(recipe);
        collectionRepository.save(collection);
    }
}