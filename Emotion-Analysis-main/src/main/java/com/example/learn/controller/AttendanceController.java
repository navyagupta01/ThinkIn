package com.example.learn.controller;

import com.example.learn.model.AttendanceRecord;
import com.example.learn.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = {"http://localhost:5050", "http://localhost:3000","http://localhost:8080"})
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/join")
    public ResponseEntity<?> joinMeeting(@Valid @RequestBody AttendanceRecord record) {
        try {
            if (record.getParticipantEmail() == null || record.getMeetingId() == null) {
                return ResponseEntity.badRequest().body("Participant email and meeting ID are required");
            }
            AttendanceRecord savedRecord = attendanceService.joinMeeting(record);
            return ResponseEntity.ok(savedRecord);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to join meeting: " + e.getMessage());
        }
    }

    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<?> getMeetingAttendance(@PathVariable String meetingId) {
        try {
            List<AttendanceRecord> attendance = attendanceService.getMeetingAttendance(meetingId);
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve meeting attendance: " + e.getMessage());
        }
    }

    @GetMapping("/participant/{participantEmail}")
    public ResponseEntity<?> getParticipantAttendance(@PathVariable String participantEmail) {
        try {
            List<AttendanceRecord> attendance = attendanceService.getParticipantAttendance(participantEmail);
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve participant attendance: " + e.getMessage());
        }
    }

    @PostMapping("/leave/{attendanceId}")
    public ResponseEntity<?> leaveMeeting(@PathVariable String attendanceId) {
        try {
            attendanceService.leaveMeeting(attendanceId);
            return ResponseEntity.ok("Successfully left meeting");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to leave meeting: " + e.getMessage());
        }
    }

    @PostMapping("/engagement")
    public ResponseEntity<?> recordEngagement(@RequestBody Map<String, Object> body) {
        try {
            String participantEmail = (String) body.get("participantEmail");
            String meetingId = (String) body.get("meetingId");
            String emotion = (String) body.get("emotion");
            String engagement = (String) body.get("engagement");
            String timestamp = (String) body.get("timestamp");

            // Validate required fields
            if (participantEmail == null || meetingId == null || engagement == null) {
                return ResponseEntity.badRequest()
                        .body("participantEmail, meetingId, and engagement are required fields");
            }

            attendanceService.recordEngagement(
                    participantEmail, meetingId, emotion, engagement, timestamp);
            return ResponseEntity.ok("Engagement recorded");
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid engagement score format");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to record engagement: " + e.getMessage());
        }
    }

    @PutMapping("/engagement/{attendanceId}")
    public ResponseEntity<?> updateEngagementScore(@PathVariable String attendanceId,
                                                   @RequestBody Map<String, Object> body) {
        try {
            Double engagementScore = Double.parseDouble(body.get("engagementScore").toString());
            AttendanceRecord updatedRecord = attendanceService.updateEngagementScore(attendanceId, engagementScore);
            return ResponseEntity.ok(updatedRecord);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid engagement score format");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update engagement score: " + e.getMessage());
        }
    }

    @GetMapping("/export/{meetingId}")
    public ResponseEntity<?> exportAttendanceToExcel(@PathVariable String meetingId) {
        try {
            byte[] excelData = attendanceService.exportAttendanceToExcel(meetingId);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .header("Content-Disposition", "attachment; filename=attendance_" + meetingId + ".xlsx")
                    .body(excelData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to export attendance data: " + e.getMessage());
        }
    }
}