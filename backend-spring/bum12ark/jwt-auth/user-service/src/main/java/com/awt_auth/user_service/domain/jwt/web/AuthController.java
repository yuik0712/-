package com.awt_auth.user_service.domain.jwt.web;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
@Slf4j
public class AuthController {
    private final RefreshTokenService refreshTokenService;
    private final CookieProvider cookieProvider;

    @GetMapping("/reissue")
    public ResponseEntity<Result> refreshToken(@RequestHeader("X-AUTH-TOKEN") String accessToken,
                                               @CookieValue("refresh-token") String refreshToken) {
        JwtTokenDto jwtTokenDto = refreshTokenService.refreshJwtToken(accessToken, refreshToken);

        ResponseCookie responseCookie = cookieProvider.createRefreshTokenCookie(refreshToken);

        return ResponseEntity.status(HttpStatus.OK)
                .header(HttpHeaders.SET_COOKIE, responseCookie.toString()) // 새로 발행된 refresh token
                .body(Result.createSuccessResult(new RefreshTokenResponse(jwtTokenDto))) // 새로 발행된 access token과 유효시간
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    static class RefreshTokenResponse {
        private String accessToken;
        private String expiredTime;

        public RefreshTokenResponse(JwtTokenDto jwtTokenDto) {
            this.accessToken = jwtTokenDto.getAccessToken();
            this.expiredTime = new SimpleDateFormat("yyyy-mm-dd HH:mm:ss")
                    .format(jwtTokenDto.getAccessTokenExpriedDate());
        }
    }
}