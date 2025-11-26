package com.zestful.controller;

import com.zestful.payload.edamam.EdamamHitDTO;
import com.zestful.payload.edamam.EdamamResponseDTO;
import com.zestful.service.RecipeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @GetMapping("/search")
    public ResponseEntity<EdamamResponseDTO> searchRecipes(
            @RequestParam String query,
            @RequestParam(required = false) String diet,
            @RequestParam(required = false) String health,
            @RequestParam(required = false) String calories,
            @RequestParam(required = false) String mealType,
            @RequestParam(required = false) String cuisineType,
            @RequestParam(required = false) String time,
            @RequestParam(required = false) String nextPageUrl) {
        
        EdamamResponseDTO response = recipeService.searchRecipes(query, diet, health, calories, mealType, cuisineType, time, nextPageUrl);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/random")
    public ResponseEntity<EdamamHitDTO> getRandomRecipe() {
        EdamamHitDTO response = recipeService.getRandomRecipe();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EdamamHitDTO> getRecipeById(@PathVariable String id) {
        EdamamHitDTO response = recipeService.getRecipeById(id);
        return ResponseEntity.ok(response);
    }
}