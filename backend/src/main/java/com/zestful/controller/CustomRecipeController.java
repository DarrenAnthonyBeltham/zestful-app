package com.zestful.controller;

import com.zestful.model.CustomRecipe;
import com.zestful.payload.CustomRecipeDTO;
import com.zestful.service.CustomRecipeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/custom")
public class CustomRecipeController {

    private final CustomRecipeService customRecipeService;

    public CustomRecipeController(CustomRecipeService customRecipeService) {
        this.customRecipeService = customRecipeService;
    }

    @PostMapping("/create")
    public ResponseEntity<CustomRecipe> createRecipe(@RequestBody CustomRecipeDTO dto, Principal principal) {
        CustomRecipe createdRecipe = customRecipeService.createRecipe(dto, principal.getName());
        return new ResponseEntity<>(createdRecipe, HttpStatus.CREATED);
    }

    @GetMapping("/my-recipes")
    public ResponseEntity<List<CustomRecipe>> getMyCustomRecipes(Principal principal) {
        List<CustomRecipe> recipes = customRecipeService.getRecipesByUser(principal.getName());
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomRecipe> getCustomRecipeById(@PathVariable Long id, Principal principal) {
        try {
            CustomRecipe recipe = customRecipeService.getRecipeByIdAndUser(id, principal.getName());
            return ResponseEntity.ok(recipe);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}