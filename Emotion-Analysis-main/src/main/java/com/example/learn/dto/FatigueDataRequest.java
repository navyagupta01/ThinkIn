package com.example.learn.dto;

import java.time.LocalDateTime;

public class FatigueDataRequest {
    private String meetingId;
    private String participantId;
    private String fatigueStatus;
    private LocalDateTime timestamp;

    // Getters and Setters
    public String getMeetingId() {
        return meetingId;
    }

    public void setMeetingId(String meetingId) {
        this.meetingId = meetingId;
    }

    public String getParticipantId() {
        return participantId;
    }

    public void setParticipantId(String participantId) {
        this.participantId = participantId;
    }

    public String getFatigueStatus() {
        return fatigueStatus;
    }

    public void setFatigueStatus(String fatigueStatus) {
        this.fatigueStatus = fatigueStatus;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}