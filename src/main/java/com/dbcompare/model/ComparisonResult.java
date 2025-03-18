package com.dbcompare.model;

import lombok.Data;
import java.util.Map;

@Data
public class ComparisonResult {
    private Long id;
    private String status;
    private Map<String, ValueDifference> differences;
    
    @Data
    public static class ValueDifference {
        private String sourceValue;
        private String targetValue;
    }
}