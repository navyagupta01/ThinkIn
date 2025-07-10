package com.example.learn.service;

import com.example.learn.dto.CreateMeetingRequest;
import com.example.learn.dto.JoinTokenResponse;
import com.example.learn.model.AttendanceRecord;
import com.example.learn.model.Meeting;
import com.example.learn.model.TranscriptLine;
import com.example.learn.repository.MeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class MeetingService {

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private AttendanceService attendanceService;

    public Meeting createMeeting(CreateMeetingRequest request, String teacherEmail, String teacherName) {
        Meeting meeting = new Meeting();
        meeting.setId(UUID.randomUUID().toString());
        meeting.setTitle(request.getTitle());
        meeting.setTeacherEmail(teacherEmail);
        meeting.setTeacherName(teacherName);
        meeting.setStartTime(request.getStartTime() != null ? request.getStartTime().toString() : LocalDateTime.now().toString());
        meeting.setActive(true);
        meeting.setParticipantIds(new ArrayList<>());
        return meetingRepository.save(meeting);
    }

    public JoinTokenResponse joinMeeting(String meetingId, String userEmail, String userName) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found"));

        if (!meeting.isActive()) {
            throw new IllegalArgumentException("Meeting is not active");
        }

        // Check if user is already in the meeting
        List<AttendanceRecord> existingRecords = attendanceService.getMeetingAttendance(meetingId);
        for (AttendanceRecord existing : existingRecords) {
            if (existing.getParticipantEmail().equals(userEmail) && existing.getLeaveTime() == null) {
                // User is already in the meeting, return existing record
                JoinTokenResponse response = new JoinTokenResponse();
                response.setMeetingId(meetingId);
                response.setParticipantId(existing.getId());
                return response;
            }
        }

        AttendanceRecord record = new AttendanceRecord();
        record.setId(UUID.randomUUID().toString());
        record.setMeetingId(meetingId);
        record.setParticipantEmail(userEmail);
        record.setParticipantName(userName);
        record.setJoinTime(LocalDateTime.now());
        // Initialize engagement data
        record.setEngagementScore(0.5); // Default neutral score
        record.setCurrentEmotion("neutral");
        record.setCurrentEngagement("Alert");
        
        attendanceService.joinMeeting(record);

        // Add participant email to the list instead of ID for better tracking
        if (!meeting.getParticipantIds().contains(userEmail)) {
            meeting.getParticipantIds().add(userEmail);
            meetingRepository.save(meeting);
        }

        JoinTokenResponse response = new JoinTokenResponse();
        response.setMeetingId(meetingId);
        response.setParticipantId(record.getId());
        return response;
    }

    public void leaveMeeting(String participantId) {
        AttendanceRecord record = attendanceService.getAttendanceRecord(participantId);
        if (record == null) {
            throw new IllegalArgumentException("Participant not found");
        }
        
        attendanceService.leaveMeeting(record.getId());

        Meeting meeting = meetingRepository.findById(record.getMeetingId())
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found"));
        
        meeting.getParticipantIds().remove(record.getParticipantEmail());
        meetingRepository.save(meeting);
    }

    public void endMeeting(String meetingId, String teacherEmail) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found"));
        
        if (!meeting.getTeacherEmail().equals(teacherEmail)) {
            throw new IllegalArgumentException("Only the teacher can end the meeting");
        }
        
        // End all active attendance records
        List<AttendanceRecord> activeRecords = attendanceService.getMeetingAttendance(meetingId);
        for (AttendanceRecord record : activeRecords) {
            if (record.getLeaveTime() == null) {
                attendanceService.leaveMeeting(record.getId());
            }
        }
        
        meeting.setActive(false);
        meeting.setEndTime(LocalDateTime.now().toString());
        meetingRepository.save(meeting);
    }

    public List<Meeting> getTeacherMeetings(String teacherEmail) {
        return meetingRepository.findByTeacherEmail(teacherEmail);
    }

    public List<Meeting> getActiveMeetings() {
        return meetingRepository.findByIsActiveTrue();
    }

    public List<AttendanceRecord> getMeetingAttendance(String meetingId) {
        return attendanceService.getMeetingAttendance(meetingId);
    }

    public Meeting getMeetingById(String meetingId) {
        return meetingRepository.findById(meetingId)
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found"));
    }

    public List<TranscriptLine> getMeetingTranscript(String meetingId) {
        // Verify meeting exists
        getMeetingById(meetingId);
        
        // TODO: Implement transcript retrieval logic
        // This should connect to your transcript storage system
        return new ArrayList<>();
    }

    public byte[] exportNotesToExcel(String meetingId) {
        // Verify meeting exists
        getMeetingById(meetingId);
        
        // TODO: Implement Excel export logic for notes
        // This should use Apache POI or similar library to generate Excel files
        return new byte[0];
    }

    public boolean isMeetingActive(String meetingId) {
        return meetingRepository.findById(meetingId)
                .map(Meeting::isActive)
                .orElse(false);
    }

    public int getMeetingParticipantCount(String meetingId) {
        return attendanceService.getMeetingAttendance(meetingId).size();
    }
}