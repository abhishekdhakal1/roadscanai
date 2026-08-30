package org.example.backendspring.repositories;

import org.example.backendspring.model.Pothole;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PotholeRepos extends MongoRepository<Pothole,String> {
}
