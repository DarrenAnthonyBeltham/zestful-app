package com.zestful.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zestful.payload.edamam.EdamamHitDTO;
import com.zestful.payload.edamam.EdamamResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Random;

@Service
public class RecipeService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${edamam.api.app-id}")
    private String edamamAppId;

    @Value("${edamam.api.app-key}")
    private String edamamAppKey;

    @Value("${google.gemini.key}")
    private String geminiKey;

    private static final String EDAMAM_API_URL = "https://api.edamam.com/api/recipes/v2";

    public RecipeService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    private HttpEntity<String> createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Edamam-Account-User", "zestful-user");
        return new HttpEntity<>(headers);
    }

    public EdamamResponseDTO searchRecipes(String query, String diet, String health, 
                                           String calories, String mealType, 
                                           String cuisineType, String time, String nextPageUrl) {
        
        URI uri;

        if (nextPageUrl != null && !nextPageUrl.isEmpty()) {
            try {
                uri = new URI(nextPageUrl);
            } catch (Exception e) {
                return new EdamamResponseDTO();
            }
        } else {
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(EDAMAM_API_URL)
                    .queryParam("type", "public")
                    .queryParam("app_id", edamamAppId)
                    .queryParam("app_key", edamamAppKey)
                    .queryParam("q", query);

            if (diet != null && !diet.isEmpty()) builder.queryParam("diet", diet);
            if (health != null && !health.isEmpty()) builder.queryParam("health", health);
            if (calories != null && !calories.isEmpty()) builder.queryParam("calories", calories);
            if (time != null && !time.isEmpty()) builder.queryParam("time", time);
            if (mealType != null && !mealType.isEmpty()) builder.queryParam("mealType", mealType);
            if (cuisineType != null && !cuisineType.isEmpty()) builder.queryParam("cuisineType", cuisineType);

            uri = builder.build().encode().toUri();
        }

        HttpEntity<String> entity = createHeaders();
        try {
            ResponseEntity<EdamamResponseDTO> response = restTemplate.exchange(
                uri, HttpMethod.GET, entity, EdamamResponseDTO.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("Edamam API Failed: " + e.getMessage());
            return new EdamamResponseDTO();
        }
    }

    public EdamamHitDTO getRecipeById(String id) {
        if (id.contains("#recipe_")) {
            id = id.split("#recipe_")[1];
        }

        URI uri = UriComponentsBuilder.fromHttpUrl(EDAMAM_API_URL + "/" + id)
                .queryParam("type", "public")
                .queryParam("app_id", edamamAppId)
                .queryParam("app_key", edamamAppKey)
                .build().encode().toUri();
        
        HttpEntity<String> entity = createHeaders();
        ResponseEntity<EdamamHitDTO> response = restTemplate.exchange(
            uri, HttpMethod.GET, entity, EdamamHitDTO.class);

        return response.getBody();
    }

    public EdamamHitDTO getRandomRecipe() {
        String[] keywords = {"Chicken", "Pasta", "Salad", "Soup", "Fish", "Beef", "Vegetarian", "Vegan", "Dessert", "Breakfast"};
        String randomQuery = keywords[new Random().nextInt(keywords.length)];
        
        EdamamResponseDTO searchResult = searchRecipes(randomQuery, null, null, null, null, null, null, null);
        
        if (searchResult != null && searchResult.getHits() != null && !searchResult.getHits().isEmpty()) {
            int randomIndex = new Random().nextInt(searchResult.getHits().size());
            return searchResult.getHits().get(randomIndex);
        }
        return null;
    }
}