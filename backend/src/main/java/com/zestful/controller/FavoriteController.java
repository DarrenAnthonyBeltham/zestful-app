package com.zestful.controller;

import com.zestful.model.FavoriteRecipe;
import com.zestful.payload.FavoriteRecipeDTO;
import com.zestful.service.FavoriteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addFavorite(@RequestBody FavoriteRecipeDTO dto, Principal principal) {
        try {
            FavoriteRecipe savedRecipe = favoriteService.addFavorite(dto, principal.getName());
            return new ResponseEntity<>(savedRecipe, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @GetMapping("/my-recipes")
    public ResponseEntity<List<FavoriteRecipe>> getMyFavorites(Principal principal) {
        List<FavoriteRecipe> favorites = favoriteService.getFavorites(principal.getName());
        return ResponseEntity.ok(favorites);
    }
}