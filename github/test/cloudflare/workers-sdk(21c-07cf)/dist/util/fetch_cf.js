import { fetchJson } from './fetch.js';
// Cloudflare API와 통신하는 커스텀 `fetch()` 함수 생성 (특정 계정의 API 토큰을 사용하여 요청 수행)
export function fetchCf(account) {
    const { apiToken } = account;
    const fetch = fetchJson({
        userAgent: 'workers-cli/1.0',
        host: 'api.cloudflare.com',
        headers: {
            'Authorization': 'Bearer ' + apiToken // API 요청 인증을 위한 Bearer 토큰 추가
        }
    });
    // Cloudflare API 요청을 수행하는 비동기 함수 
    return (async (input, init) => {
        const response = await fetch(input, init);
        const { success, errors, result } = response;
        if (success) {
            return result; // 성공 시 결과 반환
        }
        if (errors) {
            throw toError(errors[0]); // 오류 발생 시 첫 번째 오류를 변환하여 예외 발생
        }
        throw new Error('Invalid Cloudflare response: ' + JSON.stringify(response)); // 예외 처리
    });
}
// Cloudflare API 오류 객체를 JavaScript `Error` 객체로 변환
function toError(err) {
    const { message, code, error_chain } = err;
    let reason = `${message} [code: ${code}]`;
    if (error_chain) {
        const { message, code } = error_chain[0];
        reason += `\n\tcaused by, ${message} [code: ${code}]`;
    }
    const error = new Error(reason);
    error.name = 'CloudflareError';
    return error;
}
