package com.awt_auth.user_service.global.security;

public class LoginAuthenticationFilter extends UsernamePasswordAuthenticationFilter {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenServiceImpl refreshTokenServiceImpl;
    private final CookieProvider cookieProvider;

    // login 리퀘스트 패스로 오는 요청 판단
    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        Authentication authentication;

        try {
            // POST 요청으로 들어오는 email과 password
            LoginRequest credential = new ObjectMapper().readValue(request.getInputStream(), LoginRequest.class);

            // UsernamePasswordAuthenticationToken을 통해 loadUserByUsername 메소드에서 로그인 판별
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken()
            );
        } catch (IOException) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }

        return authentication;
    }

    // 로그인 성공 이후 토큰 생성
    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException {
        org.springframework.security.core.userdetails.User user = (User) authResult.getPrincipal();

        List<String> roles = user.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        String userId = user.getUsername();

        // response body에 넣어줄 access token 및 expired time 생성
        String accessToken = jwtTokenProvider.createJwtAccessToken(userId, request.getRequestURI(), roles);
        Date expiredTime = jwtTokenProvider.getExpiredTime(accessToken);
        // 쿠키에 넣어줄 refresh token 생성
        String refreshToken = jwtTokenProvider.createJwtRefreshToken();

        // redis에 새로 발행된 refresh token 값 갱신
        refreshTokenServiceImpl.updateRefreshToken(Long.valueOf(userId), jwtTokenProvider.getRefreshTokenId(refreshToken));

        // 쿠키 설정
        ResponseCookie refreshTokenCookie = cookieProvider.createRefreshTokenCookie(refreshToken);

        Cookie cookie = cookieProvider.of(refreshTokenCookie);

        response.setContentType(APPLICATION_JSON_VALUE);
        response.addCookie(cookie);

        // body 설정
        Map<String, Object> tokens = Map.of(
                "accessToken", accessToken,
                "expiredTime", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(expiredTime)
        );

        new ObjectMapper().writeValue(response.getOutputStream(), Result.createSuccessResult(tokens));
    }
}