package com.zestful.controller;

import com.zestful.model.RecipeRating;
import com.zestful.payload.RatingDTO;
import com.zestful.service.RatingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @PostMapping
    public ResponseEntity<RecipeRating> addRating(@RequestBody RatingDTO dto, Principal principal) {
        RecipeRating savedRating = ratingService.addRating(dto, principal.getName());
        return new ResponseEntity<>(savedRating, HttpStatus.CREATED);
    }

    @GetMapping("/{recipeId}")
    public ResponseEntity<List<RecipeRating>> getRatings(@PathVariable String recipeId) {
        List<RecipeRating> ratings = ratingService.getRatingsForRecipe(recipeId);
        return ResponseEntity.ok(ratings);
    }
}