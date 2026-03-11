package com.finance_dashboard.ProjetoT1.security;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    // Bucket por usuário (IP ou token) - evita que um usuário afete outro
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    // Limites mais generosos: 60 tokens por minuto (1 por segundo)
    private Bucket createNewBucket() {
        return Bucket.builder()
                .addLimit(limit -> limit.capacity(60).refillGreedy(60, Duration.ofMinutes(1)))
                .build();
    }

    private Bucket resolveBucket(HttpServletRequest request) {
        // Usa o header Authorization ou o IP como chave
        String key = request.getHeader("Authorization");
        if (key == null || key.isEmpty()) {
            key = request.getRemoteAddr();
        }
        return buckets.computeIfAbsent(key, k -> createNewBucket());
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Ignora requisições OPTIONS (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // Ignora requisições GET - são apenas leituras
        if ("GET".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        Bucket bucket = resolveBucket(request);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            return true;
        } else {
            long waitForRefill = probe.getNanosToWaitForRefill() / 1_000_000_000;
            response.setContentType("application/json");
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("{ \"error\": \"Muitas requisições. Tente novamente em " + waitForRefill + " segundos.\" }");
            return false;
        }
    }
}