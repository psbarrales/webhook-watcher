export interface HTTPRequest<T> {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
    url?: string;
    baseURL?: string;
    headers?: Record<string, string>;
    body?: any;
    params?: Record<string, any>;
    query?: Record<string, string>;
    responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
    timeout?: number;
    withCredentials?: boolean;
    transformRequest?: (data: any) => any;
    transformResponse?: (data: any) => T;
}

export interface HTTPResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: HTTPRequest<T>;
    request?: any;
}

export interface HTTPService {
    /**
     * Performs a generic HTTP request.
     * @param config HTTP request configuration.
     * @returns Una promesa que se resuelve con una respuesta HTTP.
     */
    request<T>(config: HTTPRequest<T>): Promise<HTTPResponse<T>>;

    /**
     * Allows updating the HTTPService instance configuration.
     * @param config Partial configuration to apply.
     */
    setConfig(config: HTTPRequest<any>): void;
}
