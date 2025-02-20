import { CfPreviewToken, previewToken } from './preview.js'
import { DtInspector } from './inspect.js'
import { Fetch, fetchIt } from '../util/fetch.js'

// Cloudflare 계정 정보를 나타내는 인터페이스
export interface CfAccount {
    /**
     * API 토큰 (Cloudflare API 인증에 사용)
     * @link https://api.cloudflare.com/#user-api-tokens-properties
     */
    apiToken: string // Cloudflare 계정 ID
    accountId: string // Zone ID (workers.dev 도메인을 사용하지 않을 경우 필요)
    zoneId?: string
}

// Cloudflare Worker에서 지원하는 모듈 유형
export type CfModuleType =
    | 'esm'          // ES 모듈
    | 'commonjs'     // CommonJS 모듈
    | 'compiled-wasm' // 컴파일된 WebAssembly 모듈
    | 'text'         // 일반 텍스트 파일
    | 'buffer'       // 버퍼 데이터

// Worker에서 가져올 수 있는 모듈을 정의하는 인터페이스
export interface CfModule {
    name: string // 모듈 이름 (파일 경로 형식)
    content: string | BufferSource // 모듈 내용 (JavaScript 코드 또는 WASM 코드)
    type?: CfModuleType // 모듈 유형 (기본적으로 메인 모듈과 동일한 유형을 사용)
}

// Cloudflare KV 저장소 네임스페이스
export interface CfKvNamespace {
    // KV 네임스페이스 ID
    namespaceId: string
}

// WebCrypto API의 암호화 키 형식
export interface CfCryptoKey {
    format: string // 키 형식
    algorithm: string // 사용 알고리즘
    usages: string[] // 사용 목적
    data: BufferSource | JsonWebKey // 키 데이터
}

// Cloudflare Worker에서 사용할 환경 변수 유형
export type CfVariable =
    | string
    | CfKvNamespace
    | CfCryptoKey

// Cloudflare Worker 인스턴스를 초기화할 때 필요한 설정 값
export interface CfWorkerInit {
    main: CfModule // 엔트리포인트 모듈
    modules?: CfModule[] // 추가 모듈 목록
    variables?: { [name: string]: CfVariable } // 환경 변수 (KV 또는 CryptoKey 포함 가능)
}

// Cloudflare Worker 미리보기를 위한 스텁(stub) 클래스
export class CfWorker {
    #init: CfWorkerInit // Worker 초기화 설정
    #acct: CfAccount // Cloudflare 계정 정보
    #token?: CfPreviewToken // 미리보기 토큰
    #fetch?: Fetch // fetch 요청 객체
    #inspector?: DtInspector // 개발자 도구 인스펙터

    // Cloudflare Worker 스텁을 생성하는 생성자
    constructor(init: CfWorkerInit, account: CfAccount) {
        this.#init = init
        this.#acct = account
    }

    /**
     * Cloudflare Worker에 HTTP 요청을 보내는 메서드
     * @param input 요청 URL 또는 경로
     * @param init 요청 옵션 (HTTP 메서드, 헤더 등 포함 가능)
     * @returns HTTP 응답 객체
     */
    async fetch(input: string, init?: RequestInit): Promise<Response> {
        if (!this.#fetch) {
            await this.refresh()
        }
        return await this.#fetch(input, init)
    }

    /**
     * 개발자 도구(DevTools) 인스펙터를 생성하는 메서드
     * @returns DtInspector 인스턴스
     */
    async inspect(): Promise<DtInspector> {
        if (this.#inspector) {
            return this.#inspector
        }
        if (!this.#fetch) {
            await this.refresh()
        }
        const { inspectorUrl } = this.#token
        return this.#inspector = new DtInspector(inspectorUrl.href)
    }

    // Worker 미리보기 토큰을 갱신하고, 요청을 처리할 fetch 객체를 설정하는 메서드
    private async refresh(): Promise<void> {
        this.#token = await previewToken(this.#acct, this.#init)
        const { host, value, prewarmUrl } = this.#token
        this.#fetch = fetchIt({
            host,
            headers: {
                'cf-workers-preview-token': value
            }
        })
        console.log(prewarmUrl.href)
        const r = await fetch(prewarmUrl.href, { method: 'POST' })
        console.log(r.statusText)
    }

    // Worker 미리보기 인스턴스를 닫는 메서드
    close(): void {
        this.#token = undefined
        this.#fetch = undefined
        if (this.#inspector) {
            this.#inspector.close()
            this.#inspector = undefined
        }
    }
}