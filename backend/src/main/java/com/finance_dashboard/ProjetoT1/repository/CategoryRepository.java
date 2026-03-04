package com.finance_dashboard.ProjetoT1.repository;

import com.finance_dashboard.ProjetoT1.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends MongoRepository<Category, String> {

    List<Category> findByUserEmailIsNull();
    List<Category> findByUserEmail(String userEmail);
    Optional<Category> findByUserEmailAndName(String userEmail, String name);
    boolean existsByNameAndUserEmailIsNull(String name);

}
