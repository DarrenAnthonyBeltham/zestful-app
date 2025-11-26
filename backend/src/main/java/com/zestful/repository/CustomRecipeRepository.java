package com.zestful.repository;

import com.zestful.model.CustomRecipe;
import com.zestful.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomRecipeRepository extends JpaRepository<CustomRecipe, Long> {
    List<CustomRecipe> findByUser(User user);
    Optional<CustomRecipe> findByIdAndUser(Long id, User user);
}