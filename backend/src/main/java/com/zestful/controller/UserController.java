package com.zestful.controller;

import com.zestful.model.User;
import com.zestful.payload.UserPreferencesDTO;
import com.zestful.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getLoggedInUserDetails(Principal principal) {
        User user = userService.findByEmail(principal.getName());
        return ResponseEntity.ok(user);
    }

    @PostMapping("/preferences")
    public ResponseEntity<User> updatePreferences(@RequestBody UserPreferencesDTO preferencesDTO, Principal principal) {
        User updatedUser = userService.updatePreferences(principal.getName(), preferencesDTO);
        return ResponseEntity.ok(updatedUser);
    }
}