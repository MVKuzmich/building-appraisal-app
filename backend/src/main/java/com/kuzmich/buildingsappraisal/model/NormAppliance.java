package com.kuzmich.buildingsappraisal.model;

public final class NormAppliance {

    public static final String PER_CUBIC_METER = "на 1 куб.м.";
    public static final String PER_SQUARE_METER = "на 1 кв.м.";
    public static final String PER_BUILDING = "на одно строение";

    private NormAppliance() {
    }

    public static String normalize(String value) {
        if (value == null || value.isBlank()) {
            return PER_BUILDING;
        }
        return switch (value.trim()) {
            case "на 1 куб.м.", "на 1 куб.м" -> PER_CUBIC_METER;
            case "на 1 кв.м.", "на 1 кв.м" -> PER_SQUARE_METER;
            case "на одно строение", "на одно сооружение" -> PER_BUILDING;
            default -> value.trim();
        };
    }

    public static boolean isPerCubicMeter(String normAppliance) {
        return PER_CUBIC_METER.equals(normalize(normAppliance));
    }

    public static boolean isPerSquareMeter(String normAppliance) {
        return PER_SQUARE_METER.equals(normalize(normAppliance));
    }
}
