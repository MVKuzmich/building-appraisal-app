package com.kuzmich.buildingsappraisal.model;

import com.fasterxml.jackson.annotation.JsonSetter;

import lombok.Data;

@Data
public class VolumeBasedCost {
    private String volumeFrom;
    private String volumeTo;
    private double cost;

    @JsonSetter("volumeFrom")
    public void setVolumeFrom(Object value) {
        this.volumeFrom = value == null ? null : String.valueOf(value);
    }

    @JsonSetter("volumeTo")
    public void setVolumeTo(Object value) {
        this.volumeTo = value == null ? null : String.valueOf(value);
    }
}
