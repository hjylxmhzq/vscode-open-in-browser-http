import * as http from 'http';
import * as open from 'open';
import * as vscode from 'vscode';
import { Middleware } from './middlewares';
import cors from './middlewares/cors';
import staticFile from './middlewares/static';

const instanceMap = new Map<string, { instance: http.Server, files: Set<string> }>();

export function serveFile(baseDir: string, relativeFile: string) {

    let instanceInfo = instanceMap.get(baseDir);

    const config = vscode.workspace.getConfiguration();

    if (!instanceInfo) {

        const middlewares: Middleware[] = [
            staticFile(baseDir),
        ];

        const corsEnabled = config.get('open-in-browser-http.CORS');
        
        if (corsEnabled) {
            middlewares.unshift(cors());
        }

        const requestListener: http.RequestListener = async (req, resp) => {

            let idx = -1;

            const applyMiddlewares = async () => {
                idx++;
                if (idx === middlewares.length) {
                    return;
                }
                const m = middlewares[idx];
                await m(req, resp, applyMiddlewares);
                return undefined;
            };

            applyMiddlewares();

        };

        const instance = http.createServer(requestListener);
        instance.listen(0);
        instanceInfo = { instance, files: new Set() };
        instanceMap.set(baseDir, instanceInfo);
    } else {
        instanceInfo.files.add(relativeFile);
    }

    const bindAddress = instanceInfo.instance.address();

    const port = typeof bindAddress === 'string' ? bindAddress.split(':').pop() : bindAddress?.port;

    if (port) {
        open(`http://localhost:${port}${relativeFile}`, { wait: true, app: { name: open.apps.chrome } })
            .then(() => {
                instanceInfo?.files.delete(relativeFile);
                if (instanceInfo?.files.size === 0) {
                    vscode.window.showInformationMessage('server stopped cause browser is closed');
                    instanceInfo.instance.close();
                    instanceMap.delete(baseDir);
                }
            });
    } else {
        throw new Error('can not create http server');
    }
}

export function closeAllServer() {
    for (let instanceInfo of instanceMap.values()) {
        instanceInfo.instance.close();
    }
    instanceMap.clear();
    console.log('all server is closed');
}
