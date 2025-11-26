package com.zestful.payload;

import lombok.Data;

@Data
public class FavoriteRecipeDTO {
    private String recipeUri;
    private String label;
    private String imageUrl;
    private Double calories;
}