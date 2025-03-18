package com.dbcompare.service;

import com.dbcompare.model.ComparisonOptions;
import com.dbcompare.model.ComparisonResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComparisonService {
    
    public List<ComparisonResult> compareTables(
        DataSource sourceDs,
        DataSource targetDs,
        ComparisonOptions options
    ) throws Exception {
        List<ComparisonResult> results = new ArrayList<>();
        Map<String, String> columnMap = new HashMap<>();
        
        options.getColumnMappings().forEach(mapping ->
            columnMap.put(mapping.getSourceColumn(), mapping.getTargetColumn())
        );
        
        String sourceQuery = buildSelectQuery(options.getSourceTable(), new ArrayList<>(columnMap.keySet()));
        String targetQuery = buildSelectQuery(options.getTargetTable(), new ArrayList<>(columnMap.values()));
        
        Map<String, Map<String, String>> sourceData = new HashMap<>();
        Map<String, Map<String, String>> targetData = new HashMap<>();
        
        // Load source data
        try (Connection conn = sourceDs.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sourceQuery)) {
            
            while (rs.next()) {
                Map<String, String> row = new HashMap<>();
                for (String column : columnMap.keySet()) {
                    row.put(column, rs.getString(column));
                }
                sourceData.put(rs.getString(1), row);
            }
        }
        
        // Load target data
        try (Connection conn = targetDs.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(targetQuery)) {
            
            while (rs.next()) {
                Map<String, String> row = new HashMap<>();
                for (String column : columnMap.values()) {
                    row.put(column, rs.getString(column));
                }
                targetData.put(rs.getString(1), row);
            }
        }
        
        // Compare data
        compareData(sourceData, targetData, columnMap, results);
        
        return results;
    }
    
    private void compareData(
        Map<String, Map<String, String>> sourceData,
        Map<String, Map<String, String>> targetData,
        Map<String, String> columnMap,
        List<ComparisonResult> results
    ) {
        Set<String> processedKeys = new HashSet<>();
        long resultId = 1;
        
        // Check source records
        for (Map.Entry<String, Map<String, String>> sourceEntry : sourceData.entrySet()) {
            String key = sourceEntry.getKey();
            Map<String, String> sourceRow = sourceEntry.getValue();
            Map<String, String> targetRow = targetData.get(key);
            
            ComparisonResult result = new ComparisonResult();
            result.setId(resultId++);
            
            if (targetRow == null) {
                result.setStatus("missing_target");
                Map<String, ComparisonResult.ValueDifference> differences = new HashMap<>();
                
                for (Map.Entry<String, String> column : sourceRow.entrySet()) {
                    ComparisonResult.ValueDifference diff = new ComparisonResult.ValueDifference();
                    diff.setSourceValue(column.getValue());
                    diff.setTargetValue(null);
                    differences.put(column.getKey(), diff);
                }
                
                result.setDifferences(differences);
            } else {
                result.setStatus("matched");
                Map<String, ComparisonResult.ValueDifference> differences = new HashMap<>();
                boolean hasDifferences = false;
                
                for (Map.Entry<String, String> sourceColumn : sourceRow.entrySet()) {
                    String targetColumn = columnMap.get(sourceColumn.getKey());
                    String sourceValue = sourceColumn.getValue();
                    String targetValue = targetRow.get(targetColumn);
                    
                    if (!Objects.equals(sourceValue, targetValue)) {
                        hasDifferences = true;
                        ComparisonResult.ValueDifference diff = new ComparisonResult.ValueDifference();
                        diff.setSourceValue(sourceValue);
                        diff.setTargetValue(targetValue);
                        differences.put(sourceColumn.getKey(), diff);
                    }
                }
                
                if (hasDifferences) {
                    result.setStatus("mismatched");
                    result.setDifferences(differences);
                }
            }
            
            if (!result.getStatus().equals("matched")) {
                results.add(result);
            }
            
            processedKeys.add(key);
        }
        
        // Check for missing source records
        for (Map.Entry<String, Map<String, String>> targetEntry : targetData.entrySet()) {
            String key = targetEntry.getKey();
            
            if (!processedKeys.contains(key)) {
                ComparisonResult result = new ComparisonResult();
                result.setId(resultId++);
                result.setStatus("missing_source");
                
                Map<String, ComparisonResult.ValueDifference> differences = new HashMap<>();
                Map<String, String> targetRow = targetEntry.getValue();
                
                for (Map.Entry<String, String> column : targetRow.entrySet()) {
                    ComparisonResult.ValueDifference diff = new ComparisonResult.ValueDifference();
                    diff.setSourceValue(null);
                    diff.setTargetValue(column.getValue());
                    differences.put(column.getKey(), diff);
                }
                
                result.setDifferences(differences);
                results.add(result);
            }
        }
    }
    
    private String buildSelectQuery(String tableName, List<String> columns) {
        return String.format(
            "SELECT %s FROM %s",
            String.join(", ", columns),
            tableName
        );
    }
}