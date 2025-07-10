package com.example.learn.model;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import java.util.List;
//done
@Document(collection = "meetings")
public class Meeting {
    @Id
    private String id;
    private String title;
    private String teacherEmail;
    private String teacherName;
    private String startTime;
    private String endTime;
    private boolean isActive;
    private List<String> participantIds;
    private String jitsiMeetingId;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getTeacherEmail() { return teacherEmail; }
    public void setTeacherEmail(String teacherEmail) { this.teacherEmail = teacherEmail; }
    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }
    public List<String> getParticipantIds() {
        return participantIds;
    }

    public void setParticipantIds(List<String> participantIds) {
        this.participantIds = participantIds;
    }

    public String getJitsiMeetingId() {
        return jitsiMeetingId;
    }

    public void setJitsiMeetingId(String jitsiMeetingId) {
        this.jitsiMeetingId = jitsiMeetingId;
    }
}