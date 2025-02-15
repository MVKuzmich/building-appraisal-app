package com.kuzmich.buildingsappraisal.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.kuzmich.buildingsappraisal.model.BuildingType;

public interface BuildingTypeRepository extends MongoRepository<BuildingType, String>{

    public Optional<BuildingType> findByType(String type);
    
}
