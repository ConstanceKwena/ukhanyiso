package com.ukhanyiso.matching.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "matching_records")
public class MatchingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sourceReference;

    @Column(nullable = false)
    private String matchStatus;

    private LocalDateTime createdAt = LocalDateTime.now();

    public MatchingRecord() {}

    public Long getId() { return id; }
    public String getSourceReference() { return sourceReference; }
    public void setSourceReference(String sourceReference) { this.sourceReference = sourceReference; }
    public String getMatchStatus() { return matchStatus; }
    public void setMatchStatus(String matchStatus) { this.matchStatus = matchStatus; }
}
