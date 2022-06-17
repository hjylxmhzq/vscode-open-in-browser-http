import { IncomingMessage, ServerResponse } from "http";

export default function cors() {
    return async (req: IncomingMessage, resp: ServerResponse, next: () => Promise<undefined>) => {

        const origin = req.headers.origin;
        const requestHeaders = req.headers["access-control-request-headers"];
        const requestMethod = req.headers["access-control-request-method"];
        resp.setHeader('access-control-allow-origin', origin || '*');
        resp.setHeader('access-control-allow-methods', requestMethod || 'POST, GET, OPTIONS');
        resp.setHeader('access-control-max-age', '3600');
        requestHeaders && resp.setHeader('access-control-allow-headers', requestHeaders);
        
        await next();
        return undefined;
    };

}
