import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useEffect, useRef, useCallback } from 'react';
import { HTTPRequest, HTTPResponse, HTTPService } from '@domain/ports/out/api/HTTPService';
import { merge } from 'lodash';
import { IAuthorizationPort } from '@domain/ports/in/IAuthorizationPort';

export const useAuthorizedAxiosHTTPClient = (auth: IAuthorizationPort, config?: Partial<HTTPRequest<any>>): HTTPService => {
    const { token, logout } = auth; // Get the token from the authorization context
    const httpConfigRef = useRef(mapToAxiosConfig(config || {}, token ?? undefined)); // Initialize the configuration
    const axiosInstanceRef = useRef<AxiosInstance>(axios.create(httpConfigRef.current)); // Crear instancia de Axios

    // Update configuration and create a new Axios instance if the token changes
    useEffect(() => {
        httpConfigRef.current = mapToAxiosConfig(merge(httpConfigRef.current, config), token ?? undefined);
        axiosInstanceRef.current = axios.create(httpConfigRef.current);

        // Agregar interceptor para manejar errores de respuesta
        const interceptor = axiosInstanceRef.current.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    console.warn('Unauthorized: Token expired or invalid. Logging out...');
                    logout(); // Call the logout function
                }
                return Promise.reject(error); // Rechazar el error para que pueda ser manejado aguas abajo
            }
        );

        return () => {
            axiosInstanceRef.current.interceptors.response.eject(interceptor);
        };
    }, [token, logout]);

    // Function to manually update the configuration
    const setConfig = useCallback((config: Partial<HTTPRequest<any>>) => {
        const updatedConfig = mapToAxiosConfig(merge(httpConfigRef.current, config), token ?? undefined);
        httpConfigRef.current = updatedConfig;
        axiosInstanceRef.current = axios.create(updatedConfig);
    }, [token]);

    // HTTP request function
    const request = useCallback(async <T>(config: HTTPRequest<T>): Promise<HTTPResponse<T>> => {
        const axiosConfig = mapToAxiosConfig(merge(httpConfigRef.current, config), token ?? undefined);

        try {
            const response: AxiosResponse<T> = await axiosInstanceRef.current(axiosConfig);

            return {
                data: response.data,
                status: response.status,
                statusText: response.statusText,
                headers: convertHeaders(response.headers),
                config,
                request: response.request,
            };
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw {
                    data: error.response.data,
                    status: error.response.status,
                    statusText: error.response.statusText,
                    headers: convertHeaders(error.response.headers),
                    config,
                    request: error.request,
                };
            } else {
                console.error('useAuthorizedAxiosHTTPClient Error:', error);
                throw {
                    type: 'UnexpectedError',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    originalError: error,
                };
            }
        }
    }, [token]); // Escuchar cambios en el token

    return {
        setConfig,
        request,
    };
};

// Function to map the HTTP client configuration
function mapToAxiosConfig<T>(
    config: Partial<HTTPRequest<T>>,
    token?: string | null
): AxiosRequestConfig {
    return {
        baseURL: config.baseURL || undefined,
        method: config.method || 'GET',
        url: config.url,
        headers: {
            ...config.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        data: config.body,
        params: config.query || config.params,
        responseType: config.responseType || 'json',
        timeout: config.timeout,
        withCredentials: config.withCredentials,
        transformRequest: config.transformRequest,
        transformResponse: config.transformResponse,
    };
}


// Function to convert headers to a flat format
function convertHeaders(headers: any): Record<string, string> {
    const result: Record<string, string> = {};
    if (headers) {
        Object.keys(headers).forEach((key) => {
            result[key] = headers[key] as string;
        });
    }
    return result;
}
