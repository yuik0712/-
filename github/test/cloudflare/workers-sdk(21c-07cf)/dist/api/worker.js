import { previewToken } from './preview.js';
import { DtInspector } from './inspect.js';
import { fetchIt } from '../util/fetch.js';
// Cloudflare Worker 미리보기를 위한 스텁(stub) 클래스
export class CfWorker {
    #init; // Worker 초기화 설정
    #acct; // Cloudflare 계정 정보
    #token; // 미리보기 토큰
    #fetch; // fetch 요청 객체
    #inspector; // 개발자 도구 인스펙터
    // Cloudflare Worker 스텁을 생성하는 생성자
    constructor(init, account) {
        this.#init = init;
        this.#acct = account;
    }
    /**
     * Cloudflare Worker에 HTTP 요청을 보내는 메서드
     * @param input 요청 URL 또는 경로
     * @param init 요청 옵션 (HTTP 메서드, 헤더 등 포함 가능)
     * @returns HTTP 응답 객체
     */
    async fetch(input, init) {
        if (!this.#fetch) {
            await this.refresh();
        }
        return await this.#fetch(input, init);
    }
    /**
     * 개발자 도구(DevTools) 인스펙터를 생성하는 메서드
     * @returns DtInspector 인스턴스
     */
    async inspect() {
        if (this.#inspector) {
            return this.#inspector;
        }
        if (!this.#fetch) {
            await this.refresh();
        }
        const { inspectorUrl } = this.#token;
        return this.#inspector = new DtInspector(inspectorUrl.href);
    }
    // Worker 미리보기 토큰을 갱신하고, 요청을 처리할 fetch 객체를 설정하는 메서드
    async refresh() {
        this.#token = await previewToken(this.#acct, this.#init);
        const { host, value, prewarmUrl } = this.#token;
        this.#fetch = fetchIt({
            host,
            headers: {
                'cf-workers-preview-token': value
            }
        });
        console.log(prewarmUrl.href);
        const r = await fetch(prewarmUrl.href, { method: 'POST' });
        console.log(r.statusText);
    }
    // Worker 미리보기 인스턴스를 닫는 메서드
    close() {
        this.#token = undefined;
        this.#fetch = undefined;
        if (this.#inspector) {
            this.#inspector.close();
            this.#inspector = undefined;
        }
    }
}
