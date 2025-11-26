package com.zestful.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zestful.payload.ai.AiMealPlanItem;
import com.zestful.payload.ai.ChatResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiService {

    @Value("${google.gemini.key}")
    private String geminiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    public AiService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public ChatResponse getChefReply(String userMessage) {
        return callGeminiText("You are a friendly Sous Chef. Answer briefly: " + userMessage);
    }

    public List<AiMealPlanItem> generateMealPlan(String diet, String health) {
        String prompt = String.format(
            "Generate a 7-day meal plan. Diet: %s, Health: %s. " +
            "Return ONLY a JSON array. Do not use Markdown. " +
            "Format: [{\"day\": \"Monday\", \"mealType\": \"Breakfast\", \"suggestion\": \"Oatmeal\"}, ...]. " +
            "Cover Monday to Sunday for Breakfast, Lunch, Dinner.",
            diet, health
        );
        
        ChatResponse response = callGeminiText(prompt);
        String json = extractJson(response.getReply());
        
        try {
            return objectMapper.readValue(json, new TypeReference<List<AiMealPlanItem>>(){});
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    private ChatResponse callGeminiText(String promptText) {
        if (geminiKey == null || geminiKey.isEmpty()) return new ChatResponse("Error: No API Key");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> contentPart = new HashMap<>();
        List<Map<String, String>> parts = new ArrayList<>();
        
        parts.add(Map.of("text", promptText));
        contentPart.put("parts", parts);
        contents.add(contentPart);
        requestBody.put("contents", contents);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            String url = GEMINI_URL + geminiKey;
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> body = response.getBody();
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> responseParts = (List<Map<String, Object>>) content.get("parts");
            return new ChatResponse((String) responseParts.get(0).get("text"));
        } catch (Exception e) {
            return new ChatResponse("AI Error");
        }
    }

    private String extractJson(String text) {
        text = text.replace("```json", "").replace("```", "").trim();
        Pattern pattern = Pattern.compile("\\[.*\\]", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) return matcher.group();
        return "[]";
    }
}