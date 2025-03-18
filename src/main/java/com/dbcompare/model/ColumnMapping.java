package com.dbcompare.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ColumnMapping {
    @NotBlank
    private String sourceColumn;
    
    @NotBlank
    private String targetColumn;
}