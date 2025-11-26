package com.zestful.controller;

import com.zestful.payload.ShoppingListDTO;
import com.zestful.service.ShoppingListService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/shopping-list")
public class ShoppingListController {

    private final ShoppingListService shoppingListService;

    public ShoppingListController(ShoppingListService shoppingListService) {
        this.shoppingListService = shoppingListService;
    }

    @GetMapping
    public ResponseEntity<ShoppingListDTO> getShoppingList(Principal principal) {
        ShoppingListDTO shoppingList = shoppingListService.generateShoppingList(principal.getName());
        return ResponseEntity.ok(shoppingList);
    }
}