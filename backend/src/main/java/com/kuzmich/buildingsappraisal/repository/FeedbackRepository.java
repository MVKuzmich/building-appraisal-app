package com.kuzmich.buildingsappraisal.repository;

import com.kuzmich.buildingsappraisal.model.Feedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends MongoRepository<Feedback, String> {
} 