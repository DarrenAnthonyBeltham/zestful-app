package com.zestful.controller;

import com.zestful.payload.GamificationDTO;
import com.zestful.service.GamificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/gamification")
public class GamificationController {

    private final GamificationService gamificationService;

    public GamificationController(GamificationService gamificationService) {
        this.gamificationService = gamificationService;
    }

    @GetMapping
    public ResponseEntity<GamificationDTO> getStats(Principal principal) {
        return ResponseEntity.ok(gamificationService.getUserStats(principal.getName()));
    }

    @PostMapping("/action")
    public ResponseEntity<?> recordAction(@RequestBody Map<String, String> action, Principal principal) {
        String type = action.get("type");
        int xp = 0;
        
        switch (type) {
            case "LOGIN": xp = 10; break;
            case "SEARCH": xp = 5; break;
            case "SAVE_RECIPE": xp = 20; break;
            case "CREATE_RECIPE": xp = 50; break;
            default: xp = 1;
        }
        
        gamificationService.addXp(principal.getName(), xp);
        return ResponseEntity.ok().build();
    }
}