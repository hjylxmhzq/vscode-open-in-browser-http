import * as http from 'http';
import * as open from 'open';
import * as vscode from 'vscode';

const instanceMap = new Map<string, { instance: http.Server, files: Set<string> }>();

export function serveFile(baseDir: string, relativeFile: string) {

    let instanceInfo = instanceMap.get(baseDir);

    if (!instanceInfo) {
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
        open(`http://localhost:${port}/${relativeFile}`, { wait: true, app: { name: open.apps.chrome } })
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
}

const requestListener: http.RequestListener = (req, resp) => {

    resp.end('abcde');

};