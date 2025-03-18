package com.dbcompare.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DatabaseConnection {
    @NotBlank
    private String hostname;
    
    @NotBlank
    private String port;
    
    @NotBlank
    private String username;
    
    @NotBlank
    private String password;
    
    @NotBlank
    private String databaseType;
    
    @NotBlank
    private String databaseName;
}