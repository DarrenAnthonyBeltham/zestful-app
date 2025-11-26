package com.zestful.payload;

import lombok.Data;

@Data
public class MealPlanDTO {
    private String dayOfWeek;
    private String mealType;
    private String recipeUri;
    private Long customRecipeId;
    private String recipeLabel;
    private String recipeImage;
}