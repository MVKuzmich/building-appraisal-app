package com.kuzmich.buildingsappraisal.service;

import java.util.List;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.kuzmich.buildingsappraisal.dto.FormData;
import com.kuzmich.buildingsappraisal.model.BuildingType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BuildingTypeService {

    private final MongoTemplate mongoTemplate;

    public List<BuildingType> getBuildingTypes(FormData formData) {
        Query query = new Query();
        StringBuilder sb = new StringBuilder();

        if (formData.getBuildingType() != null && !formData.getBuildingType().isEmpty()) {
            query.addCriteria(Criteria.where("type").regex(formData.getBuildingType(), "i"));
        }

        if (formData.getBuildingName() != null && !formData.getBuildingName().isEmpty()) {
            sb.append(formData.getBuildingName());
            sb.append(".*");
        }
        
        if (formData.getWalls() != null && !formData.getWalls().isEmpty()) {
            sb.append(formData.getWalls());
        }

        if(!sb.isEmpty()) {
            query.addCriteria(Criteria.where("description").regex(sb.toString(), "i"));
        }
        
        
        return mongoTemplate.find(query, BuildingType.class);
    }
    
}
