package com.kuzmich.buildingsappraisal.service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import com.kuzmich.buildingsappraisal.model.BuildingType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BuildingTypeService {

    private final MongoTemplate mongoTemplate;

    public List<BuildingType> getBuildingTypes(String buildingType, String buildingName) {
        Query query = new Query();
        
        if (buildingType != null && !buildingType.isEmpty()) {
            query.addCriteria(Criteria.where("type").regex("^" + buildingType + "$", "i"));
        }

        if (buildingName != null && !buildingName.isEmpty()) {
            String[] userWords = buildingName.toLowerCase().trim().split("\\s+");
            List<Criteria> wordCriteria = new ArrayList<>();
            
            for (String word : userWords) {
                wordCriteria.add(Criteria.where("name").regex(".*" + Pattern.quote(word) + ".*", "i"));
            }
            
            query.addCriteria(new Criteria().andOperator(wordCriteria.toArray(new Criteria[0])));
        }
        
        return mongoTemplate.find(query, BuildingType.class);
    }
}
