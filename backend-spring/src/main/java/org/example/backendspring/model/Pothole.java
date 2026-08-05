package org.example.backendspring.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "potholes")
public class Pothole {
    private String class_name;
    private float probability;
    private float inference_time_ms;
    private String gps;
}
