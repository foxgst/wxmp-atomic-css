import {PropertyOptional, readDataFile} from "./util.ts";

/**
 * value representation, value equals to from / to,
 * e.g 0.5 = 1/2
 */
export interface UnitValueDeclaration {
    /**
     *  dividend
     */
    from: number
    /**
     * divisor
     */
    to: number
    /**
     * precision, number of chars after decimal point
     */
    precision: number
    /**
     * unit with number, e.g. vmin, rpx, em
     */
    unit: string
}


/**
 * Style information for one class name
 */
export interface StyleInfo {
    /**
     * ref units, used to generate css vars
     */
    units: string[],
    /**
     * ref colors, used to generate css vars
     */
    colors: string[],
    /**
     * final declaration of the style, merged in to the global style file
     */
    styles: string[],
    /**
     * warnings occurs on generating style info
     */
    warnings: string[],
    /**
     * dependencies of class names, which name and declaration should merge to the global style file
     * e.g. keyframes
     */
    classNames: string[]
}

export interface DebugOption {
    printConfigInfo: boolean
    printRule: boolean
    printThemes: boolean
    showPageClassNames: boolean
    showPageClassAttribute: boolean
    showCssStyleNames: boolean
    showPageTaskBegin: boolean
    showPageTaskResult: boolean
    showStyleTaskResult: boolean
    showTaskStep: boolean
    showFileContent: boolean
}

export interface DataOption {
    themeFile: string;
    ruleFile: string;
}

export interface WatchOption {
    delay: number;
    fileTypes: string[];
    refreshCount: number;
}

export interface ProcessOption {
    promiseLimit: number;
}

export interface CssOption {
    rootElementName: string;
    componentGlobalCss: string;
    one: UnitValueDeclaration;
    singleColorThemes: string[];
}

export interface FileExtension {
    /**
     * the html/xml page file extension, default value is ".wxml"
     */
    page: string;
    /**
     * the main logic file, typescript file extension, default value is ".ts"
     */
    ts: string;
    /**
     * the main logic file, javascript file extension, default value is ".js"
     */
    js: string;
    /**
     * the css file extension, default value is ".wxss"
     */
    css: string;
}

export interface FileStructure {

    /**
     * the mini program directory name
     */
    miniProgramDir: string;
    /**
     * the component directory under mini program directory
     */
    componentDir: string;
    /**
     * the global config file, default value is "app.json"
     */
    appConfigFile: string;
    /**
     * the global css file, default value is "app.wxss"
     */
    cssMainFile: string;
    /**
     * the css var file, default value is "var.wxss"
     */
    cssVarFile: string;
    /**
     * the css style file, default value is "min.wxss"
     */
    cssOutputFile: string;
    /**
     * the other css files, default value is ["font.wxss", "reset.wxss"]
     */
    cssInputFiles: string[];
}

export interface WxRunningConfig {

    /**
     * working dir, default value is ".", should detect if contains correct contents
     */
    workDir: string

    /**
     * temp data, which store global rules and themes
     */
    tempData: { [index: string]: unknown }

    /**
     * mini program file structure
     */
    fileStructure: FileStructure

    /**
     * mini program file extension
     */
    fileExtension: FileExtension

    /**
     * css options
     */
    cssOption: CssOption

    /**
     * debug options, each default value is false
     */
    debugOption: DebugOption

    /**
     * data file or uri
     */
    dataOption: DataOption

    /**
     * watch options
     */
    watchOption: WatchOption

    /**
     * process options, e.g. promise
     */
    processOption: ProcessOption

}

export interface OptionalRunningConfig {
    fileStructure?: PropertyOptional<FileStructure>
    fileExtension?: PropertyOptional<FileExtension>
    cssOption?: PropertyOptional<CssOption>
    debugOption?: PropertyOptional<DebugOption>
    dataOption?: PropertyOptional<DataOption>
    watchOption?: PropertyOptional<WatchOption>
    processOption?: PropertyOptional<ProcessOption>
}

/**
 * read config file
 * @param filePath file config path
 */
export const readConfig = (filePath: string): Promise<WxRunningConfig> => readDataFile<WxRunningConfig>(filePath)