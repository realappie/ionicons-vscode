import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as path from 'path'
import {IonIconsCompletionProvider} from '../../icons-completion-provider';

const testFolderLocation = '../../../../test-data/';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

suite('ion-icon completion provider test suite', () => {
	let ionIconsCompletionProvider: IonIconsCompletionProvider;
	suiteSetup(async () => {
		const ext = vscode.extensions.getExtension('realappie.ionicons');
		const myExtensionContext: vscode.ExtensionContext = await ext?.activate();

		ionIconsCompletionProvider = new IonIconsCompletionProvider(myExtensionContext.globalStorageUri.path);
	});

	test('Autocompletion in existing filled name attribute should be triggered', async () => {
		vscode.window.showInformationMessage('Start all tests.');

		const uri = vscode.Uri.file(
			path.join(__dirname + testFolderLocation + 'angular-test.html')
		  )
	
		const document = await vscode.workspace.openTextDocument(uri);

		const editor = await vscode.window.showTextDocument(document);

		const shouldReturnAutoComplete = ionIconsCompletionProvider.shouldProvideAutoCompletion(
			editor.document, new vscode.Position(0, 19)
		);

		assert.strictEqual(shouldReturnAutoComplete, true);
	});

	test('Autocompletion in empty quotes should be triggered', async () => {
		vscode.window.showInformationMessage('Start all tests.');

		const uri = vscode.Uri.file(
			path.join(__dirname + testFolderLocation + 'angular-test.html')
		  )
	
		const document = await vscode.workspace.openTextDocument(uri);

		const editor = await vscode.window.showTextDocument(document);

		const shouldReturnAutoComplete = ionIconsCompletionProvider.shouldProvideAutoCompletion(
			editor.document, new vscode.Position(1, 16)
		);

		assert.strictEqual(shouldReturnAutoComplete, true);
	});
	test('Autocompletion in ion-icon with muliple attributes should be triggered', async () => {
		vscode.window.showInformationMessage('Start all tests.');

		const uri = vscode.Uri.file(
			path.join(__dirname + testFolderLocation + 'angular-test.html')
		  )
	
		const document = await vscode.workspace.openTextDocument(uri);

		const editor = await vscode.window.showTextDocument(document);

		const shouldReturnAutoComplete = ionIconsCompletionProvider.shouldProvideAutoCompletion(
			editor.document, new vscode.Position(2, 42)
		);

		assert.strictEqual(shouldReturnAutoComplete, true);
	});

	test('Autocompletion shouldnt be triggered', async () => {
		vscode.window.showInformationMessage('Start all tests.');

		const uri = vscode.Uri.file(
			path.join(__dirname + testFolderLocation + 'angular-test.html')
		  )
	
		const document = await vscode.workspace.openTextDocument(uri);

		const editor = await vscode.window.showTextDocument(document);

		const shouldReturnAutoComplete = ionIconsCompletionProvider.shouldProvideAutoCompletion(
			editor.document, new vscode.Position(4, 19)
		);

		assert.strictEqual(shouldReturnAutoComplete, false);
	});
});
