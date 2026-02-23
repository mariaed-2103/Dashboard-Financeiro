package com.finance_dashboard.ProjetoT1.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateUserRequestDTO(

        @NotBlank(message = "Nome é obrigatório")
        String name
) {}