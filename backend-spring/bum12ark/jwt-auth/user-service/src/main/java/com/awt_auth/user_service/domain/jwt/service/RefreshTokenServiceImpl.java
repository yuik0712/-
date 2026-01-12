package com.awt_auth.user_service.domain.jwt.service;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class RefreshTokenServiceImpl implements RefreshTokenService{
    private final UserRepository userRepository;
    private final RefreshTokenRedisRepository refreshTokenRedisRepository;

    @Transactional
    @Override
    public void updateRefreshToken(Long id, String uuid) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotExistUserException("사용자 고유번호: " + id + "는 없는 사용자입니다."));

        refreshTokenRedisRepository.save(RefreshToken.of(user.getId().toString(), uuid));
    }
}