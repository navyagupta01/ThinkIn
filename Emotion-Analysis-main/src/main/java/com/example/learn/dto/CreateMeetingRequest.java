package com.example.learn.dto;

import java.time.LocalDateTime;

public class CreateMeetingRequest {
    private String title;
    private LocalDateTime startTime;
    private String jitsiMeetingId;

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public String getJitsiMeetingId() {
        return jitsiMeetingId;
    }

    public void setJitsiMeetingId(String jitsiMeetingId) {
        this.jitsiMeetingId = jitsiMeetingId;
    }
}