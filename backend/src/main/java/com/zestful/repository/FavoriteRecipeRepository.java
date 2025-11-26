package com.zestful.repository;

import com.zestful.model.FavoriteRecipe;
import com.zestful.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRecipeRepository extends JpaRepository<FavoriteRecipe, Long> {
    List<FavoriteRecipe> findByUser(User user);
    Optional<FavoriteRecipe> findByUserAndRecipeUri(User user, String recipeUri);
}