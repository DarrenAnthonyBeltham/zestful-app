package com.zestful.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "custom_recipe_ingredients")
@Data
public class CustomRecipeIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custom_recipe_id", nullable = false)
    @JsonIgnore
    private CustomRecipe customRecipe;

    @Column(nullable = false, length = 500)
    private String ingredientText;
}