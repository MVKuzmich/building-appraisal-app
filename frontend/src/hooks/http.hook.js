// http.hook.js
import { useState, useCallback } from "react";

export const useHttp = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = useCallback(
        async (
            url,
            method = 'GET',
            body = null,
            headers = {'Content-Type': 'application/json'},
            params = {},
            responseType = 'json'
        ) => {
        setLoading(true);

        try {
            let requestUrl = url;
            if (method === 'GET' && Object.keys(params).length > 0) {
                const queryParams = new URLSearchParams(params).toString();
                requestUrl += `?${queryParams}`;
            }

            const options = {
                method,
                headers: { ...headers }
            };

            if (body && method !== 'GET') {
                if (body instanceof FormData) {
                    delete options.headers['Content-Type'];
                    options.body = body;
                } else {
                    options.body = JSON.stringify(body);
                }
            }

            const response = await fetch(requestUrl, options);

            if (!response.ok) {
                console.error('Response error:', {
                    status: response.status,
                    statusText: response.statusText,
                });
                throw new Error('Что-то пошло не так');
            }

            let data;
            if (responseType === 'blob') {
                data = await response.blob();
            } else if (responseType === 'text') {
                data = await response.text();
            } else {
                data = await response.json();
            }

            setLoading(false);
            return data;
        } catch (e) {
            console.error('Request error:', e);
            setLoading(false);
            setError(e.message);
            throw e;
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return {loading, request, error, clearError};
};