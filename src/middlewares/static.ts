import { IncomingMessage, ServerResponse } from "http";
import * as path from 'path';
import * as fs from 'fs';

export default function staticFile(baseDir: string) {
    return async (req: IncomingMessage, resp: ServerResponse, next: () => Promise<undefined>) => {

        const file = req.url;
        if (file) {
            const absFile = path.join(baseDir, file);
            const resolvedFile = resolveFiles(absFile);
            if (resolvedFile) {
                const rs = fs.createReadStream(resolvedFile);
                rs.pipe(resp);
                await next();
            } else {
                resp.statusCode = 404;
                resp.end('file does not exist');
            }
        } else {
            resp.statusCode = 404;
            resp.end('file does not exist');
        }

        return undefined;
    };

}

function resolveFiles(absFile: string, defaultExt = ['.html', '.htm', '/index.html']) {
    const isExactFile = /\.\w+$/;
    if (isExactFile.test(absFile)) {
        if (fs.existsSync(absFile)) {
            return absFile;
        } else {
            return undefined;
        }
    } else {
        for (const ext of defaultExt) {
            const absFileWithExt = absFile + ext;
            if (fs.existsSync(absFileWithExt)) {
                return absFileWithExt;
            }
        }
    }
    return undefined;
}