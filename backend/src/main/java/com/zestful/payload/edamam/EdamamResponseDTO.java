package com.zestful.payload.edamam;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class EdamamResponseDTO {
    
    private List<EdamamHitDTO> hits;

    @JsonProperty("_links")
    private Map<String, EdamamLinkDTO> links;
}