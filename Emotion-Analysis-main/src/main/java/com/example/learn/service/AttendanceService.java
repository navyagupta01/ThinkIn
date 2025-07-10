package com.example.learn.service;

import com.example.learn.model.AttendanceRecord;
import com.example.learn.repository.AttendanceRepository;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    public AttendanceRecord joinMeeting(AttendanceRecord record) {
        record.setId(UUID.randomUUID().toString());
        record.setJoinTime(LocalDateTime.now());
        return attendanceRepository.save(record);
    }

    public void leaveMeeting(String attendanceId) {
        AttendanceRecord record = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found"));
        record.setLeaveTime(LocalDateTime.now());
        attendanceRepository.save(record);
    }

    public List<AttendanceRecord> getMeetingAttendance(String meetingId) {
        return attendanceRepository.findByMeetingId(meetingId);
    }

    public List<AttendanceRecord> getParticipantAttendance(String participantEmail) {
        return attendanceRepository.findByParticipantEmail(participantEmail);
    }

    public AttendanceRecord getAttendanceRecord(String attendanceId) {
        return attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found"));
    }

    public void recordEngagement(String participantEmail, String meetingId, String emotion, String engagement, String timestamp) {
        AttendanceRecord record = attendanceRepository.findByMeetingIdAndParticipantEmail(meetingId, participantEmail)
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found"));
        record.setCurrentEmotion(emotion);
        record.setCurrentEngagement(engagement);
        attendanceRepository.save(record);
    }

    public AttendanceRecord updateEngagementScore(String attendanceId, Double engagementScore) {
        AttendanceRecord record = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found"));
        record.setEngagementScore(engagementScore);
        return attendanceRepository.save(record);
    }

    public byte[] exportAttendanceToExcel(String meetingId) {
        List<AttendanceRecord> records = getMeetingAttendance(meetingId);
        try (Workbook workbook = new XSSFWorkbook()) {
            // Implement Excel generation logic
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export attendance to Excel", e);
        }
    }
}