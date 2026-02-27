package com.finance_dashboard.ProjetoT1.controller;

import com.finance_dashboard.ProjetoT1.dto.CategoryRequestDTO;
import com.finance_dashboard.ProjetoT1.model.Category;
import com.finance_dashboard.ProjetoT1.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Category>> listCategories(
            @AuthenticationPrincipal String userEmail) {

        return ResponseEntity.ok(
                categoryService.listActiveByUser(userEmail)
        );
    }

    @PostMapping
    public ResponseEntity<Category> create(
            @AuthenticationPrincipal String userEmail,
            @RequestBody CategoryRequestDTO dto) {

        return ResponseEntity.ok(
                categoryService.create(userEmail, dto.getName())
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(
            @AuthenticationPrincipal String userEmail,
            @PathVariable String id,
            @RequestBody CategoryRequestDTO dto) {

        return ResponseEntity.ok(
                categoryService.rename(userEmail, id, dto.getName())
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal String userEmail,
            @PathVariable String id) {

        categoryService.softDelete(userEmail, id);
        return ResponseEntity.noContent().build();
    }
}
