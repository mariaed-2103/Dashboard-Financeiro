package com.finance_dashboard.ProjetoT1.service;

import com.finance_dashboard.ProjetoT1.config.AuthenticatedUser;
import com.finance_dashboard.ProjetoT1.dto.*;
import com.finance_dashboard.ProjetoT1.model.User;
import com.finance_dashboard.ProjetoT1.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponseDTO getProfile() {

        String email = AuthenticatedUser.getEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return toDTO(user);
    }

    public UserResponseDTO updateProfile(UpdateUserRequestDTO dto) {

        String emailFromToken = AuthenticatedUser.getEmail();

        User user = userRepository.findByEmail(emailFromToken)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        user.setName(dto.name());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        return toDTO(user);
    }

    public void updatePassword(UpdatePasswordRequestDTO dto) {

        String email = AuthenticatedUser.getEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!passwordEncoder.matches(dto.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Senha atual incorreta");
        }

        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
    }

    // 🔥 Upload simples (versão local - depois você troca por Cloudinary)
    public UserResponseDTO uploadAvatar(MultipartFile file) {

        String email = AuthenticatedUser.getEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio");
        }

        if (!file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Arquivo deve ser uma imagem");
        }

        if (file.getSize() > 2 * 1024 * 1024) {
            throw new IllegalArgumentException("Imagem deve ter no máximo 2MB");
        }

        // 🔴 Aqui você colocará Cloudinary depois
        // Por enquanto simulamos URL
        String fakeUrl = "https://fake-storage.com/" + file.getOriginalFilename();

        user.setProfileImageUrl(fakeUrl);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        return toDTO(user);
    }

    private UserResponseDTO toDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getProfileImageUrl()
        );
    }
}