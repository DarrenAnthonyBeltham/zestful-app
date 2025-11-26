package com.zestful.payload.gnews;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class GNewsResponseDTO {
    private List<GNewsArticleDTO> articles;
}