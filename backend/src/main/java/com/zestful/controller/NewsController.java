package com.zestful.controller;

import com.zestful.payload.gnews.GNewsResponseDTO;
import com.zestful.service.NewsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    @GetMapping("/food")
    public ResponseEntity<GNewsResponseDTO> getFoodNews(
            @RequestParam(defaultValue = "cooking") String q,
            @RequestParam(defaultValue = "1") int page) {
        
        GNewsResponseDTO response = newsService.getFoodNews(q, page);
        if (response == null) {
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok(response);
    }
}