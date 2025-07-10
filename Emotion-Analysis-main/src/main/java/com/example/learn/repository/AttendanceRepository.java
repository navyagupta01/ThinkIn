package com.example.learn.repository;

import com.example.learn.model.AttendanceRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends MongoRepository<AttendanceRecord, String> {
    List<AttendanceRecord> findByMeetingId(String meetingId);
    List<AttendanceRecord> findByParticipantEmail(String participantEmail);
    Optional<AttendanceRecord> findByMeetingIdAndParticipantEmail(String meetingId, String participantEmail);
}