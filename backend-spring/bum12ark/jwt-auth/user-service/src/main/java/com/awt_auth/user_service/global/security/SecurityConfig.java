package com.awt_auth.user_service.global.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

// spring security의 웹 보안 기능 초기화 및 설정
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig extends WebSecurityConfigurationAdapter {
    private final UserDetailsService userDetailsService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenServiceImpl refreshTokenServiceImpl;
    private final CookieProvider cookieProvider;

    // Password 해싱하기 위해 BCrypt 알고리즘 사용
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(bCryptPasswordEncoder);
    }

    // spring security 규칙
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        // Custom Login Authentication 필터 설정
        LoginAuthenticationFilter loginAuthenticationFilter = new LoginAuthenticationFilter(authenticationManagerBean(), jwtTokenProvider, refreshTokenServiceImpl, cookieProvider);
        loginAuthenticationFilter.setFilterProcessesUrl("/login");

        // CSRF 보안 비활성화
        http.csrf().disable();

        // 세션 관리 정책 설정 (JWT 사용 -> Stateless)
        http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        http.authorizeRequests().anyRequest().permitAll(); // security 처리에 httpServletRequest 사용 (url 패턴지정, 모든 사용자 접근 가능)

        // 커스텀 필터 등록
        http.addFilter(loginAuthenticationFilter);
    }

    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}