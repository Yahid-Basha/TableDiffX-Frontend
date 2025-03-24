package com.dbcompare.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ComparisonOptions {
    @NotBlank
    private String sourceTable;
    
    @NotBlank
    private String targetTable;
    
    @NotBlank
    private String exportFormat;
}