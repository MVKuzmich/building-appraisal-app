package com.kuzmich.buildingsappraisal.service;

import java.io.InputStream;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kuzmich.buildingsappraisal.model.BuildingType;
import com.kuzmich.buildingsappraisal.repository.BuildingTypeRepository;

import jakarta.annotation.PostConstruct;

@Service
public class DataLoader {

    @Autowired
    private BuildingTypeRepository repository;

    @Autowired
    private ResourceLoader resourceLoader;

    @PostConstruct
    public void loadData() {
        try {
            if(repository.count() == 0) {
            InputStream inputStream = resourceLoader.getResource("classpath:data.json").getInputStream();
            ObjectMapper mapper = new ObjectMapper();
            List<BuildingType> entities = List.of(mapper.readValue(inputStream, BuildingType[].class));
            
            repository.saveAll(entities);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}