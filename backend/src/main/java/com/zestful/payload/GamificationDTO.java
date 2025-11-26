package com.zestful.payload;

import lombok.Data;
import java.util.List;

@Data
public class GamificationDTO {
    private Integer currentXp;
    private Integer level;
    private Integer nextLevelXp;
    private List<String> badges;

    public GamificationDTO(Integer currentXp, Integer level, Integer nextLevelXp, List<String> badges) {
        this.currentXp = currentXp;
        this.level = level;
        this.nextLevelXp = nextLevelXp;
        this.badges = badges;
    }
}