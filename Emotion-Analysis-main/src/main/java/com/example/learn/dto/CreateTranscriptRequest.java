package com.example.learn.dto;

public class CreateTranscriptRequest {
    private String meetingId;
    private String participantId;
    private String text;
    private String timestamp;

    // Getters and setters
    public String getMeetingId() {
        return meetingId;
    }

    public void setMeetingId(String meetingId) {
        this.meetingId = meetingId;
    }

    public String getParticipantId() {
        return participantId; // Fixed: Return participantId instead of null
    }

    public void setParticipantId(String participantId) {
        this.participantId = participantId;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}