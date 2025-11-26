package com.zestful.controller;

import com.zestful.model.PantryItem;
import com.zestful.service.PantryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pantry")
public class PantryController {

    private final PantryService pantryService;

    public PantryController(PantryService pantryService) {
        this.pantryService = pantryService;
    }

    @GetMapping
    public ResponseEntity<List<PantryItem>> getPantry(Principal principal) {
        return ResponseEntity.ok(pantryService.getPantryItems(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<PantryItem> addItem(@RequestBody Map<String, String> payload, Principal principal) {
        String name = payload.get("name");
        String dateStr = payload.get("expirationDate");
        LocalDate date = (dateStr != null && !dateStr.isEmpty()) ? LocalDate.parse(dateStr) : null;
        return ResponseEntity.ok(pantryService.addItem(name, date, principal.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id, Principal principal) {
        pantryService.deleteItem(id, principal.getName());
        return ResponseEntity.ok().build();
    }
}