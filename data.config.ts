import {PropertyOptional, readDataFile} from "./util.ts";
import {StyleRuleSetting} from "./data.rule.ts";
import {ThemeMap} from "./data.theme.ts";

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

/**
 * debug option
 */
export interface DebugOption {
    /**
     * print configuration
     */
    printConfigInfo: boolean
    /**
     * print rules
     */
    printRule: boolean
    /**
     * print themes
     */
    printThemes: boolean
    /**
     * show page files' class names
     */
    showPageClassNames: boolean
    /**
     * show page class attributes
     */
    showPageClassAttribute: boolean
    /**
     * show css files' style names
     */
    showCssStyleNames: boolean
    /**
     * show the beginning of page task
     */
    showPageTaskBegin: boolean
    /**
     * show the result of page task
     */
    showPageTaskResult: boolean
    /**
     * show style task result
     */
    showStyleTaskResult: boolean
    /**
     * show batch task step
     */
    showTaskStep: boolean
    /**
     * show the generated content
     */
    showFileContent: boolean
}

/**
 * data file option
 */
export interface DataOption {
    /**
     * theme configuration file
     */
    themeFile: string;
    /**
     * rule configuration file
     */
    ruleFile: string;
}

/**
 * watch option
 */
export interface WatchOption {
    /**
     * refresh duration after the file changes
     */
    delay: number;
    /**
     * extensions of files which could update global css file
     */
    fileTypes: string[];
    /**
     * refresh order count
     */
    refreshCount: number;
}

/**
 * process option
 */
export interface ProcessOption {
    /**
     * promise concurrent limit
     */
    promiseLimit: number;
}

/**
 * css option
 */
export interface CssOption {
    /**
     * variables prefix
     */
    varPrefix: string;
    /**
     * flag if minify
     */
    minify: boolean;
    /**
     * palette provider
     */
    palette: string;
    /**
     * root element name for declaration css variables
     */
    rootElementName: string;
    /**
     * is component file using global css
     */
    componentGlobalCss: string;
    /**
     * unit one declaration
     */
    one: UnitValueDeclaration;
    /**
     * single color, e.g. primary, black, white
     */
    singleColorThemes: string[];
    /**
     * CSS style content line indent
     */
    styleIndent: string;
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

/**
 * temp data
 */
interface TempData {
    /**
     * effected rule setting cache
     */
    ruleSetting?: StyleRuleSetting;
    /**
     * effected theme map cache
     */
    themeMap?: ThemeMap;
    /**
     * page class names dictionary
     */
    pageClassNameMap: { [index: string]: string[] };
    /**
     * global style names
     */
    globalClassNames: string[]
    /**
     * global style names
     */
    tempGlobalClassNames: string[]
}

export interface WxRunningConfig {

    /**
     * config file source, from remote repo or local directory
     */
    configSource: string

    /**
     * is windows
     */
    isWindows: boolean

    /**
     * working dir, default value is ".", should detect if contains correct contents
     */
    workDir: string

    /**
     * temp data, which store global rules and themes
     */
    tempData: TempData

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