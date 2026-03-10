package com.finance_dashboard.ProjetoT1.security;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    // Define um balde com 10 tokens que se recarrega totalmente a cada 1 minuto
    private final Bucket bucket = Bucket.builder()
            .addLimit(limit -> limit.capacity(10).refillGreedy(10, Duration.ofMinutes(1)))
            .build();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            // Adiciona um cabeçalho informando quantos tokens restam (bom para o Frontend)
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            return true;
        } else {
            // Se o balde estiver vazio, bloqueia a requisição
            long waitForRefill = probe.getNanosToWaitForRefill() / 1_000_000_000;
            response.setContentType("application/json");
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value()); // Erro 429
            response.getWriter().write("{ \"error\": \"Muitas requisições. Tente novamente em " + waitForRefill + " segundos.\" }");
            return false;
        }
    }
}