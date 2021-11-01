// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { IonIconsCompletionProvider } from './icons-completion-provider';
import { IonIconsDecorations } from './ion-icons-decorations';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	const statusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		100,
	);

	statusBarItem.text = 'Toggle icon';
	statusBarItem.command = 'extension.downloadIcons';
	
	if (vscode.window.activeTextEditor?.document.languageId === 'html') {
		statusBarItem.show();
	}

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((e) => {
			if (e?.document.languageId === 'html') {
				statusBarItem.show();
			} else {
				statusBarItem.hide();
			}
		})
	);

	const iconDisposable = new IonIconsDecorations(context.globalStorageUri.path);
	context.subscriptions.push(iconDisposable);
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.downloadIcons', () => {
			iconDisposable.update();
		})
	);

	const iconCompletionProvider = new IonIconsCompletionProvider(context.globalStorageUri.path);

	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider('html', iconCompletionProvider)
	);

	return context;
}

// this method is called when your extension is deactivated
export function deactivate() {}
