package com.kuzmich.buildingsappraisal.repository;


import org.springframework.data.mongodb.repository.MongoRepository;

import com.kuzmich.buildingsappraisal.model.BuildingType;

public interface BuildingTypeRepository extends MongoRepository<BuildingType, String>{

    
}
