package com.dbcompare.service;

import com.dbcompare.model.ComparisonOptions;
import com.dbcompare.model.ComparisonResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.*;
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
        
        try (Connection sourceConn = sourceDs.getConnection();
             Connection targetConn = targetDs.getConnection()) {
            
            // Get table metadata
            List<String> primaryKeys = getPrimaryKeys(sourceConn, options.getSourceTable());
            List<String> uniqueColumns = primaryKeys.isEmpty() ? 
                getUniqueColumns(sourceConn, options.getSourceTable()) : primaryKeys;
            List<String> allColumns = getAllColumns(sourceConn, options.getSourceTable());
            
            if (uniqueColumns.isEmpty()) {
                throw new Exception("No primary key or unique columns found for comparison");
            }
            
            // Build comparison query
            String query = buildComparisonQuery(
                options.getSourceTable(),
                options.getTargetTable(),
                uniqueColumns,
                allColumns
            );
            
            // Execute query and process results
            try (Statement sourceStmt = sourceConn.createStatement();
                 ResultSet rs = sourceStmt.executeQuery(query)) {
                
                ResultSetMetaData metaData = rs.getMetaData();
                int columnCount = metaData.getColumnCount();
                
                while (rs.next()) {
                    ComparisonResult result = new ComparisonResult();
                    Map<String, String> sourceValues = new HashMap<>();
                    Map<String, String> targetValues = new HashMap<>();
                    boolean matched = true;
                    
                    for (String column : allColumns) {
                        String sourceValue = rs.getString("A_" + column);
                        String targetValue = rs.getString("B_" + column);
                        
                        sourceValues.put(column, sourceValue);
                        targetValues.put(column, targetValue);
                        
                        if (!Objects.equals(sourceValue, targetValue)) {
                            matched = false;
                        }
                    }
                    
                    result.setSourceValues(sourceValues);
                    result.setTargetValues(targetValues);
                    result.setMatched(matched);
                    results.add(result);
                }
            }
        }
        
        return results;
    }
    
    private List<String> getPrimaryKeys(Connection conn, String tableName) throws SQLException {
        List<String> primaryKeys = new ArrayList<>();
        DatabaseMetaData metaData = conn.getMetaData();
        
        try (ResultSet rs = metaData.getPrimaryKeys(null, null, tableName)) {
            while (rs.next()) {
                primaryKeys.add(rs.getString("COLUMN_NAME"));
            }
        }
        
        return primaryKeys;
    }
    
    private List<String> getUniqueColumns(Connection conn, String tableName) throws SQLException {
        List<String> uniqueColumns = new ArrayList<>();
        DatabaseMetaData metaData = conn.getMetaData();
        
        try (ResultSet rs = metaData.getIndexInfo(null, null, tableName, true, false)) {
            while (rs.next()) {
                uniqueColumns.add(rs.getString("COLUMN_NAME"));
            }
        }
        
        return uniqueColumns;
    }
    
    private List<String> getAllColumns(Connection conn, String tableName) throws SQLException {
        List<String> columns = new ArrayList<>();
        DatabaseMetaData metaData = conn.getMetaData();
        
        try (ResultSet rs = metaData.getColumns(null, null, tableName, null)) {
            while (rs.next()) {
                columns.add(rs.getString("COLUMN_NAME"));
            }
        }
        
        return columns;
    }
    
    private String buildComparisonQuery(
        String sourceTable,
        String targetTable,
        List<String> uniqueColumns,
        List<String> allColumns
    ) {
        StringBuilder query = new StringBuilder();
        query.append("SELECT ");
        
        // Select columns
        for (String column : allColumns) {
            query.append(String.format("A.%s AS A_%s, B.%s AS B_%s, ", 
                column, column, column, column));
        }
        query.setLength(query.length() - 2); // Remove last comma
        
        // From clause
        query.append(String.format(" FROM %s A FULL OUTER JOIN %s B ON ", 
            sourceTable, targetTable));
        
        // Join conditions
        for (String column : uniqueColumns) {
            query.append(String.format("A.%s = B.%s AND ", column, column));
        }
        query.setLength(query.length() - 5); // Remove last AND
        
        // Where clause for differences
        query.append(" WHERE ");
        for (String column : allColumns) {
            query.append(String.format(
                "(A.%s <> B.%s OR A.%s IS NULL OR B.%s IS NULL) OR ",
                column, column, column, column
            ));
        }
        query.setLength(query.length() - 4); // Remove last OR
        
        return query.toString();
    }
}