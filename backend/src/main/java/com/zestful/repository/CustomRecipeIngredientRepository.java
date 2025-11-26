package com.zestful.repository;

import com.zestful.model.CustomRecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomRecipeIngredientRepository extends JpaRepository<CustomRecipeIngredient, Long> {
}