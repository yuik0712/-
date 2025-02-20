import fetch, { Request, Headers, Response } from 'node-fetch';
import { FormData, Blob } from 'formdata-node';
import WebSocket, { WebSocketServer } from 'ws';
import { createServer } from 'node:http';
export function polyfill() {
    // @ts-ignore
    if (!globalThis.fetch)
        globalThis.fetch = fetch;
    // @ts-ignore
    if (!globalThis.Request)
        globalThis.Request = Request;
    // @ts-ignore
    if (!globalThis.Headers)
        globalThis.Headers = Headers;
    // @ts-ignore
    if (!globalThis.Response)
        globalThis.Response = Response;
    // @ts-ignore
    if (!globalThis.FormData)
        globalThis.FormData = FormData;
    // @ts-ignore
    if (!globalThis.Blob)
        globalThis.Blob = Blob;
    // @ts-ignore
    if (!globalThis.WebSocket)
        globalThis.WebSocket = WebSocket;
}
/*
 * Binds a `FetchServer` to a local port to receive HTTP requests.
 */
export function bind(fetcher, port) {
    const controller = new AbortController();
    const server = createServer((input, output) => toString(input)
        // @ts-ignore
        .then(request => fetcher.fetch(request)) // FetchServer에서 처리할 요청을 보냄
        // @ts-ignore
        .then(response => toResponse(response, output)) // 응답을 Node.js 응답 객체로 변환하여 반환
        .catch(error => console.error(error))); // 에러 핸들링
    // WebSocket 서버가 설정된 경우, WebSocket 연결을 처리
    if (fetcher.upgrade) {
        const webSocket = new WebSocketServer({ server });
        webSocket.on('connection', (ws) => fetcher.upgrade(ws));
    }
    // 서버를 시작하고, AbortController를 통해 서버를 종료할 수 있게 함
    const socket = server.listen({ port });
    controller.signal.onabort = () => socket.close(); // AbortController가 호출되면 서버 종료
    return controller;
}
/**
 * Converts a Node.js request to a Web standard `Request`.
 */
async function toRequest(request) {
    const host = request.headers.host ?? 'localhost';
    const { href } = new URL(request.url, 'http://' + host);
    const { rawHeaders, method } = request;
    const headers = new Headers();
    for (let i = 0; i < rawHeaders.length; i += 2) {
        headers.append(rawHeaders[i], rawHeaders[i + 1]);
    }
    return new Promise((resolve, reject) => {
        let chunks = [];
        request.on('data', chunk => chunks.push(chunk)); // 요청 본문을 수집
        request.on('error', error => reject(error)); // 에러 처리
        request.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const body = buffer.length === 0 ? undefined : buffer;
            resolve(new Request(href, { method, headers, body })); // Request 객체 반환
        });
    });
}
/**
 * Converts a Web standard `Response` into a Node.js response.
 */
async function toResponse(input, response) {
    const { status, statusText, headers, body: hasBody } = input;
    // 응답 헤더 설정
    for (const [name, value] of headers.entries()) {
        response.setHeader(name, value);
    }
    let body;
    if (hasBody) {
        body = new Uint8Array(await input.arrayBuffer()); // 본문을 배열로 변환
        response.setHeader('Content-Length', body.byteLength);
    }
    response.writeHead(status, statusText); // 상태 코드와 상태 메시지 설정
    response.write(body); // 응답 본문 작성
}
