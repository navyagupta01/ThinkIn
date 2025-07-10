package com.example.learn.controller;

import com.example.learn.dto.EmotionDataRequest;
import com.example.learn.dto.FatigueDataRequest;
import com.example.learn.dto.HeadPoseDataRequest;
import com.example.learn.model.AttendanceRecord;
import com.example.learn.model.EmotionEntry;
import com.example.learn.model.FatigueEntry;
import com.example.learn.model.HeadPoseEntry;
import com.example.learn.model.MeetingAnalyticsSnapshot;
import com.example.learn.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:5050", "http://localhost:3000","http://localhost:8080"})
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @PostMapping("/emotion")
    public ResponseEntity<?> recordEmotionData(@RequestBody EmotionDataRequest request) {
        try {
            analyticsService.recordEmotionData(request);
            return ResponseEntity.ok("Emotion data recorded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to record emotion data: " + e.getMessage());
        }
    }

    @PostMapping("/fatigue")
    public ResponseEntity<?> recordFatigueData(@RequestBody FatigueDataRequest request) {
        try {
            analyticsService.recordFatigueData(request);
            return ResponseEntity.ok("Fatigue data recorded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to record fatigue data: " + e.getMessage());
        }
    }

    @PostMapping("/headpose")
    public ResponseEntity<?> recordHeadPoseData(@RequestBody HeadPoseDataRequest request) {
        try {
            analyticsService.recordHeadPoseData(request);
            return ResponseEntity.ok("Head pose data recorded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to record head pose data: " + e.getMessage());
        }
    }

    @PostMapping("/snapshot/{meetingId}")
    public ResponseEntity<?> generateAnalyticsSnapshot(@PathVariable String meetingId) {
        try {
            analyticsService.generateAnalyticsSnapshot(meetingId);
            return ResponseEntity.ok("Analytics snapshot generated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to generate analytics snapshot: " + e.getMessage());
        }
    }

    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<?> getMeetingAnalytics(@PathVariable String meetingId) {
        try {
            List<MeetingAnalyticsSnapshot> analytics = analyticsService.getMeetingAnalytics(meetingId);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to retrieve meeting analytics: " + e.getMessage());
        }
    }

    @GetMapping("/participant/{participantId}/emotions")
    public ResponseEntity<?> getParticipantEmotions(@PathVariable String participantId) {
        try {
            List<EmotionEntry> emotions = analyticsService.getParticipantEmotions(participantId);
            return ResponseEntity.ok(emotions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to retrieve participant emotions: " + e.getMessage());
        }
    }

    @GetMapping("/participant/{participantId}/fatigue")
    public ResponseEntity<?> getParticipantFatigue(@PathVariable String participantId) {
        try {
            List<FatigueEntry> fatigue = analyticsService.getParticipantFatigue(participantId);
            return ResponseEntity.ok(fatigue);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to retrieve participant fatigue: " + e.getMessage());
        }
    }

    @GetMapping("/participant/{participantId}/headpose")
    public ResponseEntity<?> getParticipantHeadPose(@PathVariable String participantId) {
        try {
            List<HeadPoseEntry> headPose = analyticsService.getParticipantHeadPose(participantId);
            return ResponseEntity.ok(headPose);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to retrieve participant head pose: " + e.getMessage());
        }
    }

    @GetMapping("/attendance-count/{meetingId}")
    public ResponseEntity<?> getAttendanceCount(@PathVariable String meetingId) {
        try {
            int count = analyticsService.getAttendanceCount(meetingId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to retrieve attendance count: " + e.getMessage());
        }
    }

    @GetMapping("/engagement-scores/{meetingId}")
    public ResponseEntity<?> getEngagementScores(@PathVariable String meetingId) {
        try {
            List<Map<String, Object>> scores = analyticsService.getEngagementScores(meetingId);
            return ResponseEntity.ok(scores);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to retrieve engagement scores: " + e.getMessage());
        }
    }

    @GetMapping("/student-engagement/{meetingId}/{participantEmail}")
    public ResponseEntity<?> getStudentEngagement(@PathVariable String meetingId, @PathVariable String participantEmail) {
        try {
            AttendanceRecord record = analyticsService.getStudentEngagement(meetingId, participantEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Engagement data not found"));
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to retrieve student engagement: " + e.getMessage());
        }
    }

    @GetMapping("/chart-data/{meetingId}")
    public ResponseEntity<?> getChartData(@PathVariable String meetingId) {
        try {
            List<MeetingAnalyticsSnapshot> snapshots = analyticsService.getMeetingAnalytics(meetingId);
            // Transform snapshots into chart-friendly data
            List<Map<String, Object>> chartData = snapshots.stream().map(snapshot -> {
                Map<String, Object> data = new HashMap<>();
                data.put("timestamp", snapshot.getTimestamp());
                data.put("engagementScores", snapshot.getEngagementScores());
                data.put("emotions", snapshot.getEmotions());
                data.put("fatigue", snapshot.getFatigue());
                return data;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(chartData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to retrieve chart data: " + e.getMessage());
        }
    }
}