package com.zestful.controller;

import com.zestful.model.RecipeCollection;
import com.zestful.service.CollectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/collections")
public class CollectionController {

    private final CollectionService collectionService;

    public CollectionController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    @GetMapping
    public ResponseEntity<List<RecipeCollection>> getCollections(Principal principal) {
        return ResponseEntity.ok(collectionService.getUserCollections(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<RecipeCollection> createCollection(@RequestBody Map<String, String> payload, Principal principal) {
        return ResponseEntity.ok(collectionService.createCollection(payload.get("name"), principal.getName()));
    }

    @PostMapping("/{collectionId}/add/{recipeId}")
    public ResponseEntity<?> addRecipe(@PathVariable Long collectionId, @PathVariable Long recipeId, Principal principal) {
        collectionService.addRecipeToCollection(collectionId, recipeId, principal.getName());
        return ResponseEntity.ok().build();
    }
}