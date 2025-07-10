package com.example.learn.repository;

import com.example.learn.model.TranscriptLine;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
//done
public interface TranscriptLineRepository extends MongoRepository<TranscriptLine, String> {
    List<TranscriptLine> findByMeetingId(String meetingId);
}
