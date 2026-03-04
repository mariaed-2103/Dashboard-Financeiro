package com.finance_dashboard.ProjetoT1.dto;

import com.finance_dashboard.ProjetoT1.model.Category;

import java.util.List;
import java.util.Arrays;

public record CategoriesResponseDTO(
        List<Category> global,
        List<Category> custom
) {}