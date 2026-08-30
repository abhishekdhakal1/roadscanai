package org.example.backendspring.controllers;

import org.example.backendspring.model.Pothole;
import org.example.backendspring.repositories.PotholeRepos;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api")
public class PotholeController {

    @Autowired
    PotholeRepos potholeRepos;

    @GetMapping("all")
    public ResponseEntity<List<Pothole>> getAllPotholes(){
        return ResponseEntity.ok()
                .body(potholeRepos.findAll());
    }

    @PostMapping("add")
    public void addPothole(@RequestBody Pothole pothole){
        potholeRepos.save(pothole);
    }
}
