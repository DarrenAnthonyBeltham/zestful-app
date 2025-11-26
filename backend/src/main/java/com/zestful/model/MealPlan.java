package com.zestful.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "meal_plan")
@Data
public class MealPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    private String dayOfWeek;

    @Column(nullable = false, length = 20)
    private String mealType;

    private String recipeUri;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custom_recipe_id")
    private CustomRecipe customRecipe;
}