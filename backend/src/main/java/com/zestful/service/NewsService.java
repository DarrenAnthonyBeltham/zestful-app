package com.zestful.service;

import com.zestful.payload.gnews.GNewsResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class NewsService {

    private final RestTemplate restTemplate;

    @Value("${gnews.api.key}")
    private String gnewsApiKey;

    private static final String GNEWS_API_URL = "https://gnews.io/api/v4/search";

    public NewsService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public GNewsResponseDTO getFoodNews(String query, int page) {
        String url = UriComponentsBuilder.fromUriString(GNEWS_API_URL)
                .queryParam("q", query) 
                .queryParam("lang", "en")
                .queryParam("max", 6)
                .queryParam("page", page)
                .queryParam("apikey", gnewsApiKey.trim())
                .encode()
                .toUriString();
        
        try {
            return restTemplate.getForObject(url, GNewsResponseDTO.class);
        } catch (Exception e) {
            System.err.println("Error fetching news: " + e.getMessage());
            return null;
        }
    }
}