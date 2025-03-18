package com.dbcompare.service;

import com.dbcompare.model.DatabaseConnection;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class DatabaseService {
    private final Map<String, HikariDataSource> dataSources = new ConcurrentHashMap<>();
    
    public DataSource connectToDatabase(DatabaseConnection connection) {
        String key = generateKey(connection);
        
        if (dataSources.containsKey(key)) {
            return dataSources.get(key);
        }
        
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(buildJdbcUrl(connection));
        config.setUsername(connection.getUsername());
        config.setPassword(connection.getPassword());
        config.setMaximumPoolSize(5);
        
        HikariDataSource dataSource = new HikariDataSource(config);
        dataSources.put(key, dataSource);
        
        return dataSource;
    }
    
    public List<String> getTables(DataSource dataSource) throws Exception {
        List<String> tables = new ArrayList<>();
        
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet rs = metaData.getTables(null, null, "%", new String[]{"TABLE"});
            
            while (rs.next()) {
                tables.add(rs.getString("TABLE_NAME"));
            }
        }
        
        return tables;
    }
    
    public List<String> getColumns(DataSource dataSource, String tableName) throws Exception {
        List<String> columns = new ArrayList<>();
        
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet rs = metaData.getColumns(null, null, tableName, "%");
            
            while (rs.next()) {
                columns.add(rs.getString("COLUMN_NAME"));
            }
        }
        
        return columns;
    }
    
    private String buildJdbcUrl(DatabaseConnection connection) {
        return switch (connection.getDatabaseType().toLowerCase()) {
            case "mysql" -> String.format(
                "jdbc:mysql://%s:%s/%s",
                connection.getHostname(),
                connection.getPort(),
                connection.getDatabaseName()
            );
            case "postgresql" -> String.format(
                "jdbc:postgresql://%s:%s/%s",
                connection.getHostname(),
                connection.getPort(),
                connection.getDatabaseName()
            );
            case "sqlserver" -> String.format(
                "jdbc:sqlserver://%s:%s;databaseName=%s",
                connection.getHostname(),
                connection.getPort(),
                connection.getDatabaseName()
            );
            default -> throw new IllegalArgumentException("Unsupported database type: " + connection.getDatabaseType());
        };
    }
    
    private String generateKey(DatabaseConnection connection) {
        return String.format(
            "%s_%s_%s_%s",
            connection.getDatabaseType(),
            connection.getHostname(),
            connection.getPort(),
            connection.getDatabaseName()
        );
    }
}