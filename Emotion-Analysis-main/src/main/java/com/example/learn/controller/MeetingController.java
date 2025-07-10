package com.example.learn.controller;

import com.example.learn.dto.CreateMeetingRequest;
import com.example.learn.dto.CreateTranscriptRequest;
import com.example.learn.dto.JoinTokenResponse;
import com.example.learn.model.AttendanceRecord;
import com.example.learn.model.Meeting;
import com.example.learn.model.TranscriptLine;
import com.example.learn.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = {"http://localhost:5050", "http://localhost:3000","http://localhost:8080"})
public class MeetingController {

    @Autowired
    private MeetingService meetingService;

    @PostMapping("/create")
    public ResponseEntity<?> createMeeting(@RequestBody CreateMeetingRequest request,
                                           @RequestParam String teacherEmail,
                                           @RequestParam String teacherName) {
        try {
            Meeting meeting = meetingService.createMeeting(request, teacherEmail, teacherName);
            return ResponseEntity.ok(meeting);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to create meeting: " + e.getMessage());
        }
    }

    @PostMapping("/join/{meetingId}")
    public ResponseEntity<?> joinMeeting(@PathVariable String meetingId,
                                         @RequestParam String userEmail,
                                         @RequestParam String userName) {
        try {
            JoinTokenResponse response = meetingService.joinMeeting(meetingId, userEmail, userName);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to join meeting: " + e.getMessage());
        }
    }

    @PostMapping("/leave/{participantId}")
    public ResponseEntity<?> leaveMeeting(@PathVariable String participantId) {
        try {
            meetingService.leaveMeeting(participantId);
            return ResponseEntity.ok("Left meeting successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to leave meeting: " + e.getMessage());
        }
    }

    @PostMapping("/end/{meetingId}")
    public ResponseEntity<?> endMeeting(@PathVariable String meetingId,
                                        @RequestParam String teacherEmail) {
        try {
            meetingService.endMeeting(meetingId, teacherEmail);
            return ResponseEntity.ok("Meeting ended successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to end meeting: " + e.getMessage());
        }
    }



    @GetMapping("/teacher/{teacherEmail}")
    public ResponseEntity<?> getTeacherMeetings(@PathVariable String teacherEmail) {
        try {
            List<Meeting> meetings = meetingService.getTeacherMeetings(teacherEmail);
            return ResponseEntity.ok(meetings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to retrieve teacher meetings: " + e.getMessage());
        }
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveMeetings() {
        try {
            List<Meeting> meetings = meetingService.getActiveMeetings();
            return ResponseEntity.ok(meetings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve active meetings: " + e.getMessage());
        }
    }

    @GetMapping("/{meetingId}/transcript")
    public ResponseEntity<?> getMeetingTranscript(@PathVariable String meetingId) {
        try {
            List<TranscriptLine> transcript = meetingService.getMeetingTranscript(meetingId);
            return ResponseEntity.ok(transcript);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to retrieve transcript: " + e.getMessage());
        }
    }

    @GetMapping("/{meetingId}/attendance")
    public ResponseEntity<?> getMeetingAttendance(@PathVariable String meetingId) {
        try {
            List<AttendanceRecord> attendance = meetingService.getMeetingAttendance(meetingId);
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to retrieve attendance: " + e.getMessage());
        }
    }

    @GetMapping("/export/notes/{meetingId}")
    public ResponseEntity<?> exportNotesToExcel(@PathVariable String meetingId) {
        try {
            byte[] excelFile = meetingService.exportNotesToExcel(meetingId);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "notes_" + meetingId + ".xlsx");
            headers.setContentLength(excelFile.length);
            return new ResponseEntity<>(excelFile, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to export notes: " + e.getMessage());
        }
    }
}