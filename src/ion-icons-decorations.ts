import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import axios from "axios";
import {
  createFilePath,
  fileExists,
  saveFileInDir,
} from "./icons-files-manager";
import Logger from "./logger";
import { iconLoader } from "./icons-loader";

interface SetDecorationsOpts {
  darkModeIconPath: string;
  lightModeIconPath: string;
  positionIndex: number;
}

export class IonIconsDecorations implements vscode.Disposable {
  private readonly subscriptions: vscode.Disposable[] = [];

  private activeEditor?: vscode.TextEditor;

  private updateTimeout?: NodeJS.Timeout;

  constructor(private readonly globalStorageUriPath: string) {
    this.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        if (this.activeEditor && e.document === this.activeEditor.document) {
          // Delay this so if we're getting lots of updates we don't flicker.
          if (this.updateTimeout) clearTimeout(this.updateTimeout);
          this.updateTimeout = setTimeout(() => this.update(), 1000);
        }
      })
    );
    this.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor((e) => {
        this.setTrackingFile(e);
        this.update();
      })
    );
    if (vscode.window.activeTextEditor) {
      this.setTrackingFile(vscode.window.activeTextEditor);
      this.update();
    }
  }

  update() {
    if (!this.activeEditor) {
      return;
    }

    const text = vscode.window.activeTextEditor?.document.getText();
    const matches = Array.from(
      text!.matchAll(
        /(ion-icon|IonIcon) (.*)(name|icon)=["|'|{]([\w- ]*)/g
      )
    );

    // TODO figure out a cleaner way to find ion-icons elements
    // see https://github.com/microsoft/vscode/issues/59921
    //
    matches.forEach((match) => {

      // The last match should be the icon name
      const rawIconName = match[match.length - 1];

      // Convert camel case (i.e. "alarmOutline") to kebab case (i.e. "alarm-outline")
      const iconName = rawIconName.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

      const lightIconFileName = `${iconName}.svg`;
      const darkIconFileName = `${iconName}-dark-mode.svg`;

      const lightModeIconPath = createFilePath({
        globalStorageUri: this.globalStorageUriPath,
        dirName: "icons-folder",
        fileName: lightIconFileName,
      });

      const darkModeIconPath = createFilePath({
        globalStorageUri: this.globalStorageUriPath,
        dirName: "icons-folder",
        fileName: darkIconFileName,
      });

      const lightIconExist = fileExists(lightModeIconPath);

      const darkIconExists = fileExists(darkModeIconPath);

      if (lightIconExist && darkIconExists) {
        Logger.appendLine(
          `Skipping icon loading of ${iconName} as they already exist`,
          "icon-loader",
		  false
        );

        this.setDecorations({
          darkModeIconPath,
          lightModeIconPath,
          positionIndex: match.index!,
        });

        return;
      }

      iconLoader(iconName)
        .then((svgIconText) => {
          Logger.appendLine("Fetching icons", "icon-loader", false);

          saveFileInDir(svgIconText.darkMode, darkModeIconPath);

          saveFileInDir(svgIconText.lightMode, lightModeIconPath);

          this.setDecorations({
            darkModeIconPath,
            lightModeIconPath,
            positionIndex: match.index!,
          });
        })
        .catch((error) => {
          const message = 

          console.error(`error getting svg named ${iconName}..`, error);

          Logger.appendLine(`error getting svg named ${iconName}..`, 'icon-loader', false);
        });
    });
  }

  private setTrackingFile(editor: vscode.TextEditor | undefined) {
    if (editor && this.isAnalyzable(editor.document)) {
      this.activeEditor = editor;
    } else {
      this.activeEditor = undefined;
    }
  }

  public dispose() {
    this.activeEditor = undefined;

    this.subscriptions.forEach((subscription) => {
      try {
        subscription.dispose();
      } catch (error) {
        console.error("error in disposing subscription");
      }
    });
  }

  /** we dont want to be handling all files */
  isAnalyzable(textDocument: vscode.TextDocument): boolean {
    const analyzableLanguages = ['html', 'vue', 'javascriptreact', 'typescriptreact'];
    return analyzableLanguages.includes(textDocument.languageId);
  }

  setDecorations({
    darkModeIconPath,
    lightModeIconPath,
    positionIndex: index,
  }: SetDecorationsOpts) {
    // We don't want to re-create decorations we have already created before
    //
    const decoration = vscode.window.createTextEditorDecorationType({
      gutterIconSize: "75%",
      dark: {
        gutterIconPath: darkModeIconPath,
      },
      light: {
        gutterIconPath: lightModeIconPath,
      },
    });

    vscode.window.activeTextEditor?.setDecorations(decoration, [
      new vscode.Range(
        vscode.window.activeTextEditor.document.positionAt(index!),
        vscode.window.activeTextEditor.document.positionAt(index!)
      ),
    ]);
  }
}

export const setDecorations = ({
  darkModeIconPath,
  lightModeIconPath,
  positionIndex: index,
}: SetDecorationsOpts) => {
  const decoration = vscode.window.createTextEditorDecorationType({
    gutterIconSize: "75%",
    dark: {
      gutterIconPath: darkModeIconPath,
    },
    light: {
      gutterIconPath: lightModeIconPath,
    },
  });

  vscode.window.activeTextEditor?.setDecorations(decoration, [
    new vscode.Range(
      vscode.window.activeTextEditor.document.positionAt(index!),
      vscode.window.activeTextEditor.document.positionAt(index!)
    ),
  ]);
};
