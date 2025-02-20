/**
 * 커스텀 `fetch()` 함수를 생성하는 함수
 * 기본 호스트, 사용자 에이전트, 헤더를 설정할 수 있음
 *
 * @param init 기본 요청 옵션 (호스트, 헤더, User-Agent 등)
 * @returns 설정된 `fetch()` 함수
 */
export function fetchIt(init = {}) {
    const { host, headers: headersInit, userAgent } = init;
    return (async (input, init = {}) => {
        // 상대 경로(`/path`)를 절대 경로(`https://host/path`)로 변환
        if (input.startsWith('/')) {
            input = `https://${host}${input}`;
        }
        // 헤더 설정
        const headers = new Headers(headersInit);
        if (userAgent) {
            headers.set('User-Agent', userAgent);
        }
        // 기존 요청에 포함된 헤더를 추가
        for (const [name, value] of new Headers(init.headers).entries()) {
            headers.set(name, value);
        }
        init.headers = headers;
        return await fetch(input, init);
    });
}
/**
 * JSON 응답을 반환하는 `fetch()` 함수를 생성하는 함수
 * `fetchIt()`을 기반으로 동작하며 응답을 자동으로 JSON으로 변환
 *
 * @param init 기본 요청 옵션 (호스트, 헤더, User-Agent 등)
 * @returns JSON 데이터를 반환하는 `fetch()` 함수
 */
export function fetchJson(init) {
    const fetch = fetchIt(init);
    return (async (input, init = {}) => {
        const response = await fetch(input, init);
        const text = await response.text();
        try {
            return JSON.parse(text); // 응답을 JSON으로 파싱
        }
        catch (cause) {
            throw new Error('Expected a JSON response, but instead got: ' + text);
        }
    });
}
/**
 * 두 개의 WebSocket 간에 데이터를 중계하는 프록시 함수
 * 한쪽에서 받은 메시지를 다른 쪽으로 전달함
 *
 * @param webSocket 클라이언트 WebSocket
 * @param otherSocket 상대방 WebSocket
 */
export function proxyWebSocket(webSocket, otherSocket) {
    // 메시지를 서로 전달
    webSocket.addEventListener('message', (event) => otherSocket.send(event.data));
    otherSocket.addEventListener('message', (event) => webSocket.send(event.data));
    // 연결 종료 시 상대 소켓도 함께 종료
    webSocket.addEventListener('close', () => otherSocket.close());
    otherSocket.addEventListener('close', () => webSocket.close());
}
