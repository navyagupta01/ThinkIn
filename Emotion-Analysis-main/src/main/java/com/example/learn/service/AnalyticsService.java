package com.example.learn.service;

import com.example.learn.dto.EmotionDataRequest;
import com.example.learn.dto.FatigueDataRequest;
import com.example.learn.dto.HeadPoseDataRequest;
import com.example.learn.model.AttendanceRecord;
import com.example.learn.model.EmotionEntry;
import com.example.learn.model.FatigueEntry;
import com.example.learn.model.HeadPoseEntry;
import com.example.learn.model.MeetingAnalyticsSnapshot;
import com.example.learn.repository.AttendanceRepository;
import com.example.learn.repository.EmotionRepository;
import com.example.learn.repository.FatigueRepository;
import com.example.learn.repository.HeadPoseRepository;
import com.example.learn.repository.MeetingAnalyticsSnapshotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private EmotionRepository emotionRepository;

    @Autowired
    private FatigueRepository fatigueRepository;

    @Autowired
    private HeadPoseRepository headPoseRepository;

    @Autowired
    private MeetingAnalyticsSnapshotRepository snapshotRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    public void recordEmotionData(EmotionDataRequest request) {
        EmotionEntry entry = new EmotionEntry();
        entry.setId(UUID.randomUUID().toString());
        entry.setMeetingId(request.getMeetingId());
        entry.setParticipantId(request.getParticipantId());
        entry.setEmotion(request.getEmotion());
        entry.setTimestamp(request.getTimestamp());
        emotionRepository.save(entry);

        // Update attendance record - find by participantId, not by ID
        AttendanceRecord record = attendanceRepository.findByMeetingIdAndParticipantEmail(
                request.getMeetingId(), request.getParticipantId())
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found"));
        
        record.setCurrentEmotion(request.getEmotion());
        
        // Recalculate engagement score
        Double engagementScore = calculateEngagementScore(
            request.getEmotion(), 
            record.getCurrentEngagement()
        );
        record.setEngagementScore(engagementScore);
        
        attendanceRepository.save(record);
    }

    public void recordFatigueData(FatigueDataRequest request) {
        FatigueEntry entry = new FatigueEntry();
        entry.setId(UUID.randomUUID().toString());
        entry.setMeetingId(request.getMeetingId());
        entry.setParticipantId(request.getParticipantId());
        entry.setFatigueStatus(request.getFatigueStatus());
        entry.setTimestamp(request.getTimestamp());
        fatigueRepository.save(entry);

        // Update attendance record - find by participantId, not by ID
        AttendanceRecord record = attendanceRepository.findByMeetingIdAndParticipantEmail(
                request.getMeetingId(), request.getParticipantId())
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found"));
        
        record.setCurrentEngagement(request.getFatigueStatus());
        
        // Recalculate engagement score
        Double engagementScore = calculateEngagementScore(
            record.getCurrentEmotion(), 
            request.getFatigueStatus()
        );
        record.setEngagementScore(engagementScore);
        
        attendanceRepository.save(record);
    }

    private Double calculateEngagementScore(String emotion, String fatigueStatus) {
        Map<String, Double> emotionScores = Map.of(
            "happy", 0.8,
            "neutral", 0.5,
            "sad", 0.2,
            "surprise", 0.6,
            "anger", 0.3
        );
        
        Double baseScore = emotionScores.getOrDefault(emotion != null ? emotion.toLowerCase() : "neutral", 0.5);
        
        if ("Alert".equals(fatigueStatus)) {
            baseScore += 0.1;
        } else if ("Sleepy".equals(fatigueStatus)) {
            baseScore -= 0.1;
        }
        
        return Math.min(Math.max(baseScore, 0.0), 1.0);
    }

    public void recordHeadPoseData(HeadPoseDataRequest request) {
        HeadPoseEntry entry = new HeadPoseEntry();
        entry.setId(UUID.randomUUID().toString());
        entry.setMeetingId(request.getMeetingId());
        entry.setParticipantId(request.getParticipantId());
        entry.setYaw(request.getYaw());
        entry.setPitch(request.getPitch());
        entry.setRoll(request.getRoll());
        entry.setTimestamp(request.getTimestamp());
        headPoseRepository.save(entry);
    }

    public void generateAnalyticsSnapshot(String meetingId) {
        List<AttendanceRecord> records = attendanceRepository.findByMeetingId(meetingId);
        Map<String, Double> engagementScores = new HashMap<>();
        Map<String, String> currentEmotions = new HashMap<>();
        Map<String, String> currentFatigue = new HashMap<>();

        for (AttendanceRecord record : records) {
            // Use participantEmail as the key since that's what identifies participants
            String participantKey = record.getParticipantEmail();
            engagementScores.put(participantKey, record.getEngagementScore() != null ? record.getEngagementScore() : 0.0);
            currentEmotions.put(participantKey, record.getCurrentEmotion());
            currentFatigue.put(participantKey, record.getCurrentEngagement());
        }

        MeetingAnalyticsSnapshot snapshot = new MeetingAnalyticsSnapshot();
        snapshot.setId(UUID.randomUUID().toString());
        snapshot.setMeetingId(meetingId);
        snapshot.setTimestamp(LocalDateTime.now());
        snapshot.setEngagementScores(engagementScores);
        snapshot.setCurrentEmotions(currentEmotions);
        snapshot.setCurrentFatigue(currentFatigue);
        snapshotRepository.save(snapshot);
    }

    public List<MeetingAnalyticsSnapshot> getMeetingAnalytics(String meetingId) {
        return snapshotRepository.findByMeetingId(meetingId);
    }

    public List<EmotionEntry> getParticipantEmotions(String participantId) {
        return emotionRepository.findByParticipantId(participantId);
    }

    public List<FatigueEntry> getParticipantFatigue(String participantId) {
        return fatigueRepository.findByParticipantId(participantId);
    }

    public List<HeadPoseEntry> getParticipantHeadPose(String participantId) {
        return headPoseRepository.findByParticipantId(participantId);
    }

    public int getAttendanceCount(String meetingId) {
        return attendanceRepository.findByMeetingId(meetingId).size();
    }

    public List<Map<String, Object>> getEngagementScores(String meetingId) {
        List<AttendanceRecord> records = attendanceRepository.findByMeetingId(meetingId);
        return records.stream().map(record -> {
            Map<String, Object> map = new HashMap<>();
            map.put("participantId", record.getId());
            map.put("participantEmail", record.getParticipantEmail());
            map.put("participantName", record.getParticipantName());
            map.put("engagementScore", record.getEngagementScore());
            map.put("currentEmotion", record.getCurrentEmotion());
            map.put("currentEngagement", record.getCurrentEngagement());
            return map;
        }).collect(Collectors.toList());
    }

    public java.util.Optional<AttendanceRecord> getStudentEngagement(String meetingId, String participantEmail) {
        return attendanceRepository.findByMeetingIdAndParticipantEmail(meetingId, participantEmail);
    }
}