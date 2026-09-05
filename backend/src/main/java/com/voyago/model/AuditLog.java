package com.voyago.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "auditLogs")
public class AuditLog {

    @Id
    private String id;

    private String actor;

    private String role;

    private String action;

    private String entity;

    private String entityId;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    private String details;
}
