import { fetchCf } from '../util/fetch_cf.js';
import { fetchJson } from '../util/fetch.js';
import { toFormData } from './form_data.js';
// 프리뷰 세션 토큰을 생성하는 함수
async function sessionToken(account) {
    const { accountId, zoneId } = account;
    const initUrl = zoneId
        ? `/client/v4/zones/${zoneId}/workers/edge-preview` // zoneId가 있을 경우
        : `/client/v4/accounts/${accountId}/workers/subdomain/edge-preview`; // 계정 ID만 있을 경우
    // 프리뷰 토큰을 위한 URL을 fetch
    const { exchange_url: tokenUrl } = await fetchCf(account)(initUrl);
    const { inspector_websocket: url, token } = await fetchJson()(tokenUrl);
    const { host } = new URL(url);
    const query = `cf_workers_preview_token=${token}`;
    return {
        value: token,
        host,
        inspectorUrl: new URL(`${url}?${query}`),
        prewarmUrl: new URL(`https://${host}/cdn-cgi/workers/preview/prewarm?${query}`)
    };
}
// https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid/2117523#2117523
// 랜덤 ID를 생성하는 함수 (UUID 형식)
function randomId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
// 프리뷰 토큰을 생성하는 함수
export async function previewToken(account, worker) {
    const { value, host, inspectorUrl, prewarmUrl } = await sessionToken(account);
    const { accountId, zoneId } = account;
    const scriptId = zoneId ? randomId() : host.split('.')[0]; // zoneId가 있으면 랜덤 ID 사용, 없으면 호스트 이름에서 추출
    const url = `/client/v4/accounts/${accountId}/workers/scripts/${scriptId}/edge-preview`;
    // 프리뷰 모드 설정
    const mode = zoneId ? { routes: ['*/*'] } : { workers_dev: true };
    const init = {
        method: 'POST',
        body: toFormData(worker, mode),
        headers: {
            'cf-preview-upload-config-token': value
        }
    };
    // 프리뷰 토큰을 요청하고 반환
    const { preview_token: token } = await fetchCf(account)(url, init);
    return {
        value: token,
        host,
        inspectorUrl,
        prewarmUrl
    };
}
