import { CfAccount } from '../api/worker.js'
import { FetchJson, fetchJson } from './fetch.js'

// cloudflare api에서 반환하는 오류 객체를 정의하는 인터페이스(api 응답에서 `errors` 필드에 포함될 수 있음)
interface CfError {
    code: number // 오류코드
    message: string // 오류메시지 
    error_chain?: CfError[] // 중첩된 오류 목록(선택적)
}

// cloudflare API에서 반환하는 응답 객체를 정의하는 인터페이스 (`succeess`, `errors`, result` 필드를 포함하는 응답을 반환함)
interface CfResponse<T> {
    success: boolean // API 요청 성공 여부
    errors: CfError[] // 오류 목록 (실패 시 포함됨)
    result: T // 요청 성공 시 반환되는 데이터 
}

// Cloudflare API와 통신하는 커스텀 `fetch()` 함수 생성 (특정 계정의 API 토큰을 사용하여 요청 수행)
export function fetchCf(account: CfAccount): FetchJson {
    const { apiToken } = account
    const fetch = fetchJson({
        userAgent: 'workers-cli/1.0',  // Cloudflare API 요청에 포함할 User-Agent
        host: 'api.cloudflare.com',  // Cloudflare API 기본 도메인
        headers: {
          'Authorization': 'Bearer ' + apiToken  // API 요청 인증을 위한 Bearer 토큰 추가
        }
    })

    // Cloudflare API 요청을 수행하는 비동기 함수 
    return (async <T>(input: string, init?: RequestInit) => {
        const response = await fetch<CfResponse<T>>(input, init)
        const { success, errors, result } = response
    
        if (success) {
          return result  // 성공 시 결과 반환
        }
        if (errors) {
          throw toError(errors[0])  // 오류 발생 시 첫 번째 오류를 변환하여 예외 발생
        }
        throw new Error('Invalid Cloudflare response: ' + JSON.stringify(response))  // 예외 처리
      })
}

// Cloudflare API 오류 객체를 JavaScript `Error` 객체로 변환
function toError(err: CfError): Error {
    const { message, code, error_chain } = err
  
    let reason = `${message} [code: ${code}]`
    if (error_chain) {
      const { message, code } = error_chain[0]
      reason += `\n\tcaused by, ${message} [code: ${code}]`
    }
    
    const error = new Error(reason)
    error.name = 'CloudflareError'
    return error
}