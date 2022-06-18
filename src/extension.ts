import * as vscode from 'vscode';
import * as path from 'path';
import { closeAllServer, serveFile } from './utils';

export function activate(context: vscode.ExtensionContext) {

	console.log('"open-in-browser-http" is now active!');
	let disposable = vscode.commands.registerCommand('open-in-browser-http.openInBrowser', () => {
		
		const workspace = vscode.workspace.workspaceFolders?.[0].uri.path;
		vscode.window.showInformationMessage('Hello World from open in browser(http)!');
		const fileOrUndefined = vscode.window.activeTextEditor?.document.fileName;
		if (fileOrUndefined && workspace) {
			const relativeFile = fileOrUndefined.replace(workspace, '');
			serveFile(workspace, relativeFile);
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
	closeAllServer();
}
