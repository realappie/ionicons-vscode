import axios from "axios";
import { CompletionItem, CompletionItemProvider, MarkdownString, Position, ProgressLocation, TextDocument, Uri, window as vscodeWindow, workspace } from "vscode";
import { createFilePath, fileExists, readFile, saveFileInDir } from "./icons-files-manager";
import { iconLoader } from "./icons-loader";
import Logger from "./logger";

interface IonIconsList {
    name: string;
    version: string;
    icons: Array<{
        name: string;
        tags: string;
    }>
}

type RegexRegExpIndice = [number, number];

type RegexRegExpIndices = RegexRegExpIndice[];

export class IonIconsCompletionProvider implements CompletionItemProvider {
    private iconVersion = workspace.getConfiguration('ionicons').get<string>('iconsVersion') ?? '5.4.0';

    private get autoCompleteListUrl() {
        const url = `https://unpkg.com/ionicons@${this.iconVersion}/dist/ionicons.json`;

        return url;
    }
    
    constructor(private readonly globalStorageUriPath: string) {}

    async provideCompletionItems(document: TextDocument, position: Position) {
        const ionIconNameRegex = new RegExp(/<ion-icon name=["|']([\w- ]*)/, 'd');

        const htmlContent = document.lineAt(position).text

        const matches = ionIconNameRegex.exec(htmlContent);

        if (!matches) {
            return [];
        }

        const indices: RegexRegExpIndices = (matches as any)['indices'];

        if (indices[1] == null) {
            return;
        }

        const [, [ionIconValueStartIndex, ionIconValueEndIndex]] = indices;

        console.log(ionIconValueStartIndex);

        console.log(`start ${ionIconValueStartIndex} end ${ionIconValueEndIndex}`);

        const caretInNameAttribute = position.character >= ionIconValueStartIndex && position.character <= ionIconValueEndIndex;

        if ( !caretInNameAttribute ) {
            return [];
        }


        let autoCompleteList: IonIconsList|null = null; 
        
        try {
            autoCompleteList = await this.fetchAutoCompleteList();;
        } catch (error) {
            console.error('[ionicons:provideCompletionItems] fetchAutoCompleteList', error);
            Logger.appendLine(`fetchAutoCompleteList failed from ${this.autoCompleteListUrl} error=${error}`, 'resolveCompletionItem', false);
        }

        if (autoCompleteList == null) {
            return;
        }


        const autoCompleteItems = autoCompleteList.icons.map( (ionicon) => {
            const autoCompleteItem = new CompletionItem(ionicon.name);

            return autoCompleteItem;
        });


        return autoCompleteItems;
    }


    async resolveCompletionItem(item: CompletionItem): Promise<CompletionItem> {

        await vscodeWindow.withProgress({
            location: ProgressLocation.Window,
            cancellable: false,
            title: 'Loading icons'
        }, async (progress) => {
            
            progress.report({  increment: 0 });
            
            const iconName = item.label;

            const iconPath = this.createFilePathForIconName(iconName);

            // We need to figure out why this doesnt work
            const iconUri = Uri.parse(iconPath);

            const markdown = new MarkdownString(`![${iconName}](${iconUri})`);

            item.documentation = markdown

            if (!fileExists(iconPath)) {
                try {
                    const svgIconText = await iconLoader(item.label, false);

                    saveFileInDir(svgIconText.darkMode, iconPath);
                } catch (error) {
                    console.error('[ionicons:resolveCompletionItem] resolveCompletionItem', error);
                    Logger.appendLine(`Failed to load ionicon svg with name=${iconName} reason=${error}`, 'resolveCompletionItem', false);
                    item.documentation = 'Failed to load icon preview, see output => ionicons for error';
                }
            }
            
            progress.report({ increment: 100 });    
        });

        return item;
    }

    private async fetchAutoCompleteList(): Promise<IonIconsList> {
        const ioniconsJsonPath = createFilePath({
            globalStorageUri: this.globalStorageUriPath,
            dirName: "icons-folder",
            fileName: 'ionicons.json',
        });

        if ( fileExists(ioniconsJsonPath) ) {
            const fileContent = await readFile(ioniconsJsonPath);

            return JSON.parse(fileContent.toString()) as IonIconsList;
        }

        return axios.get(this.autoCompleteListUrl).then( response => {        
            const autoCompleteList: IonIconsList = response.data;

            saveFileInDir(JSON.stringify(autoCompleteList, null, 4), ioniconsJsonPath);
            
            return autoCompleteList;
        });
    }

    /** will create a local path for an icon */
    private createFilePathForIconName(iconName: string) {
        return createFilePath({
            globalStorageUri: this.globalStorageUriPath,
            dirName: "icons-folder",
            fileName: `${iconName}.svg`,
        });
    }
}