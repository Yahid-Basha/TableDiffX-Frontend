package com.dbcompare.model;

import lombok.Data;
import java.util.Map;

@Data
public class ComparisonResult {
    private Map<String, String> sourceValues;
    private Map<String, String> targetValues;
    private boolean matched;
}