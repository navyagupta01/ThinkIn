package com.example.learn.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "analytics_snapshots")
public class MeetingAnalyticsSnapshot {
    @Id
    private String id;
    private String meetingId;
    private LocalDateTime timestamp;
    private Map<String, Double> engagementScores; // participantId -> score
    private Map<String, String> currentEmotions; // participantId -> emotion
    private Map<String, String> currentFatigue; // participantId -> fatigue status

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMeetingId() {
        return meetingId;
    }

    public void setMeetingId(String meetingId) {
        this.meetingId = meetingId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, Double> getEngagementScores() {
        return engagementScores;
    }

    public void setEngagementScores(Map<String, Double> engagementScores) {
        this.engagementScores = engagementScores;
    }

    public Map<String, String> getCurrentEmotions() {
        return currentEmotions;
    }

    public void setCurrentEmotions(Map<String, String> currentEmotions) {
        this.currentEmotions = currentEmotions;
    }

    public Map<String, String> getCurrentFatigue() {
        return currentFatigue;
    }

    public void setCurrentFatigue(Map<String, String> currentFatigue) {
        this.currentFatigue = currentFatigue;
    }

    // Alias methods for backward compatibility with your data mapping
    public Map<String, String> getEmotions() {
        return currentEmotions;
    }

    public Map<String, String> getFatigue() {
        return currentFatigue;
    }
}