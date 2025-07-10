package com.example.learn.repository;

import com.example.learn.model.Meeting;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MeetingRepository extends MongoRepository<Meeting, String> {
    List<Meeting> findByTeacherEmail(String teacherEmail);
    List<Meeting> findByIsActiveTrue();
}