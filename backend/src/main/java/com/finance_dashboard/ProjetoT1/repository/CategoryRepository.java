package com.finance_dashboard.ProjetoT1.repository;

import com.finance_dashboard.ProjetoT1.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends MongoRepository<Category, String> {

    long countByUserEmailAndIsDefaultFalse(String userEmail);

    boolean existsByUserEmailAndNormalizedName(String userEmail, String normalizedName);

    Optional<Category> findByIdAndUserEmail(String id, String userEmail);

    List<Category> findByUserEmailAndActiveTrue(String userEmail);

    Optional<Category> findByIdAndUserEmailAndActiveTrue(
            String id,
            String userEmail
    );

}