package com.example.learn.repository;

import com.example.learn.model.EmotionEntry;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface EmotionRepository extends MongoRepository<EmotionEntry, String> {
    List<EmotionEntry> findByParticipantId(String participantId);
}