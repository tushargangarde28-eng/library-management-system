 package com.library.library_management_system.config;

import com.library.library_management_system.security.JwtAuthenticationFilter;
import com.library.library_management_system.service.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtService jwtService
    ) throws Exception {

        JwtAuthenticationFilter jwtAuthenticationFilter =
                new JwtAuthenticationFilter(jwtService);

        http
                .csrf(csrf -> csrf.disable())

                .httpBasic(basic -> basic.disable())

                .formLogin(form -> form.disable())

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .exceptionHandling(exception -> exception

                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(
                                    HttpServletResponse.SC_UNAUTHORIZED
                            );
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");

                            response.getWriter().write(
                                    "{\"status\":401,\"message\":\"Authentication required\"}"
                            );
                        })

                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(
                                    HttpServletResponse.SC_FORBIDDEN
                            );
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");

                            response.getWriter().write(
                                    "{\"status\":403,\"message\":\"Access denied: insufficient permissions\"}"
                            );
                        })
                )

                .authorizeHttpRequests(auth -> auth

                        // Public endpoints
                        .requestMatchers(
                                "/api/members/register",
                                "/api/members/login",
                                "/actuator/health",
                                "/actuator/health/**",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // Books: ADMIN and STUDENT can read
                        .requestMatchers(HttpMethod.GET, "/api/books/**")
                        .hasAnyRole("ADMIN", "STUDENT")

                        // Books: only ADMIN can create, update or delete
                        .requestMatchers("/api/books/**")
                        .hasRole("ADMIN")

                        // Members: only ADMIN
                        .requestMatchers("/api/members/**")
                        .hasRole("ADMIN")

                        // Loans: ADMIN and STUDENT can access loan endpoints
                        .requestMatchers("/api/loans/**")
                        .hasAnyRole("ADMIN", "STUDENT")

                        // Other endpoints
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}