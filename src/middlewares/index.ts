import { IncomingMessage, ServerResponse } from "http";

export type NextFunction = () => Promise<undefined>;

export interface Middleware {
    (req: IncomingMessage, resp: ServerResponse, next: NextFunction): Promise<undefined>;
}