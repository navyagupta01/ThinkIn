package com.example.learn.repository;

import com.example.learn.model.MeetingAnalyticsSnapshot;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MeetingAnalyticsSnapshotRepository extends MongoRepository<MeetingAnalyticsSnapshot, String> {
    List<MeetingAnalyticsSnapshot> findByMeetingId(String meetingId);
}