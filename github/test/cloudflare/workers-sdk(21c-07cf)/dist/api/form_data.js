// https://stackoverflow.com/questions/9267899/how-can-i-convert-an-arraybuffer-to-a-base64-encoded-string/9458996#9458996
function toBase64(source) {
    let result = '';
    const buffer = source instanceof ArrayBuffer ? source : source.buffer;
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        result += String.fromCharCode(bytes[i]);
    }
    return btoa(result);
}
// 주어진 변수를 Cloudflare 바인딩 형식으로 변환하는 함수
function toBinding(name, variables) {
    if (typeof name !== 'string') {
        // 단순한 문자열 타입일 경우
        return { name, type: 'plain_text', text: variable };
    }
    // KvNamespace인 경우
    const { namespaceId } = variable;
    if (namespaceId) {
        return { name, type: 'kv_namespace', namespaceId: namespaceId };
    }
    // CryptoKey인 경우
    const { format, algorithm, usages, data } = variable;
    if (format) {
        let key_base64;
        let key_jwk;
        if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
            key_base64 = toBase64(data); // ArrayBuffer 데이터는 Base64로 변환
        }
        else {
            key_jwk = data; // JWK 형식으로 저장
        }
        return { name, type: 'secret_key', format, algorithm, usages, key_base64, key_jwk };
    }
    // 지원하지 않는 변수 유형에 대해서는 오류 발생
    throw new TypeError('Unsupported variable: ' + variable);
}
// 주어진 모듈 타입을 MINE 타입으로 변환하는 함수 
export function toMimeType(type) {
    switch (type) {
        case 'esm': return 'application/javascript+module';
        case 'commonjs': return 'application/javascript';
        case 'compiled-wasm': return 'application/wasm';
        case 'buffer': return 'application/octet-stream';
        case 'text': return 'text/plain';
    }
    // 지원하지 않는 모듈 타입에 대해서는 오류 발생
    throw new TypeError('Unsupported module: ' + type);
}
// 주어진 모듈을 MINE 타입에 맞는 Blob으로 변환하는 함수 
function toModule(module, entryType) {
    const { type: moduleType, content } = module;
    const type = toMimeType(moduleType ?? entryType); // MIME 타입을 결정
    return new Blob([content], { type });
}
// `CfWorkerInit` 객체에서 `FormData` 객체를 생성하는 함수 (Cloudflare API에 worker를 업로드할 때 사용)
export function toFormData(worker, preview) {
    const formData = new FormData();
    const { main, modules, variables } = worker;
    const { name, type: mainType } = main;
    const bindings = [];
    for (const [name, variable] of Object.entries(variables ?? {})) {
        const binding = toBinding(name, variable);
        bindings.push(binding);
    }
    const singleton = mainType === 'commonjs';
    const metadata = {
        main_module: singleton ? undefined : name,
        body_part: singleton ? name : undefined,
        bindings
    };
    formData.set('metadata', JSON.stringify(metadata)); // 메타데이터 설정
    if (singleton && modules) {
        throw new TypeError('More than one module can only be specified when type = \'esm\''); // `commonjs`일 때 모듈이 두 개 이상 있을 수 없음
    }
    // main 모듈과 다른 모듈들 처리 
    for (const module of [main].concat(modules ?? [])) {
        const { name } = module;
        const blob = toModule(module, mainType ?? 'esm');
        formData.set(name, blob, name);
    }
    // preview 설정이 있으면 추가
    if (preview) {
        formData.set('wrangler-session-config', JSON.stringify(preview));
    }
    return formData;
}
