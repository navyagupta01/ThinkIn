package com.example.learn.repository;

import com.example.learn.model.FatigueEntry;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FatigueRepository extends MongoRepository<FatigueEntry, String> {
    List<FatigueEntry> findByParticipantId(String participantId);
}