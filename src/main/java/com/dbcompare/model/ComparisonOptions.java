package com.dbcompare.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ComparisonOptions {
    @NotBlank
    private String sourceTable;
    
    @NotBlank
    private String targetTable;
    
    @NotNull
    private List<ColumnMapping> columnMappings;
    
    private List<String> skipColumns;
    
    @NotBlank
    private String matchingAlgorithm;
    
    private Integer fuzzyThreshold;
    
    @NotBlank
    private String exportFormat;
}