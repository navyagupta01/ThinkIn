package com.example.learn.repository;

import com.example.learn.model.HeadPoseEntry;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface HeadPoseRepository extends MongoRepository<HeadPoseEntry, String> {
    List<HeadPoseEntry> findByParticipantId(String participantId);
}