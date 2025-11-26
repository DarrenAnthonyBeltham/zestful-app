package com.zestful.payload;

import lombok.Data;
import java.util.Map;

@Data
public class ShoppingListDTO {
    private Map<String, Long> ingredients;
    private int totalRecipes;
    private double estimatedCost; 

    public ShoppingListDTO(Map<String, Long> ingredients, int totalRecipes, double estimatedCost) {
        this.ingredients = ingredients;
        this.totalRecipes = totalRecipes;
        this.estimatedCost = estimatedCost;
    }
}