package com.dbcompare.controller;

import com.dbcompare.model.DatabaseConnection;
import com.dbcompare.model.ComparisonOptions;
import com.dbcompare.model.ComparisonResult;
import com.dbcompare.service.DatabaseService;
import com.dbcompare.service.ComparisonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DatabaseController {
    
    private final DatabaseService databaseService;
    private final ComparisonService comparisonService;
    private final Map<String, DataSource> connections = new ConcurrentHashMap<>();
    
    @PostMapping("/connect")
    public ResponseEntity<Map<String, Object>> connect(@Valid @RequestBody DatabaseConnection connection) {
        try {
            DataSource dataSource = databaseService.connectToDatabase(connection);
            String key = connection.getDatabaseName();
            connections.put(key, dataSource);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Successfully connected to database"
            ));
        } catch (Exception e) {
            log.error("Failed to connect to database", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/tables/{dbName}")
    public ResponseEntity<List<String>> getTables(@PathVariable String dbName) {
        try {
            DataSource dataSource = connections.get(dbName);
            if (dataSource == null) {
                return ResponseEntity.badRequest().build();
            }
            
            List<String> tables = databaseService.getTables(dataSource);
            return ResponseEntity.ok(tables);
        } catch (Exception e) {
            log.error("Failed to get tables", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/columns/{tableName}")
    public ResponseEntity<List<String>> getColumns(
        @PathVariable String tableName,
        @RequestParam String dbName
    ) {
        try {
            DataSource dataSource = connections.get(dbName);
            if (dataSource == null) {
                return ResponseEntity.badRequest().build();
            }
            
            List<String> columns = databaseService.getColumns(dataSource, tableName);
            return ResponseEntity.ok(columns);
        } catch (Exception e) {
            log.error("Failed to get columns", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/compare")
    public ResponseEntity<List<ComparisonResult>> compare(@Valid @RequestBody ComparisonOptions options) {
        try {
            DataSource sourceDs = connections.get(options.getSourceTable().split("\\.")[0]);
            DataSource targetDs = connections.get(options.getTargetTable().split("\\.")[0]);
            
            if (sourceDs == null || targetDs == null) {
                return ResponseEntity.badRequest().build();
            }
            
            List<ComparisonResult> results = comparisonService.compareTables(sourceDs, targetDs, options);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Failed to compare tables", e);
            return ResponseEntity.badRequest().build();
        }
    }
}