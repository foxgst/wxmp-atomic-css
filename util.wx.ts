import {htmltok, TokenType} from "https://deno.land/x/htmltok@v0.0.3/private/htmltok.ts";
import {log, sleep} from "./util.common.ts";
import * as css from "https://deno.land/x/css@0.3.0/mod.ts";
import {Rule} from "https://deno.land/x/css@0.3.0/mod.ts";
import {Rules} from "./data.rule.ts";
import {Themes} from "./data.theme.ts";
import {UnitValueDeclaration, StyleRuleSetting, initRuleSetting, StyleInfo, generateVars} from "./util.style.ts";

export interface PageInfo {
    page: string,
    tsPath?: boolean,
    jsPath?: boolean,
    cssPath?: boolean
}

export interface WxRunningConfig {

    workDir: string

    miniProgramDir: string
    componentDir: string
    appConfigFile: string
    cssMainFile: string
    cssVarFile: string
    cssOutputFile: string
    cssInputFiles: string[]

    fileExtension: {
        page: string
        ts: string
        js: string
        css: string
    }

    cssOption: {
        rootElementName: string
        componentGlobalCss: RegExp
        one: UnitValueDeclaration
    }

    watchOptions: {
        delay: number,
        fileTypes: string[],
        refreshCount: number
    }

    debugOptions: {
        printRule: boolean
        printConfigInfo: boolean
        showPageClassNames: boolean
        showPageClassAttribute: boolean
        showCssStyleNames: boolean
        showPageTaskBegin: boolean
        showPageTaskResult: boolean
        showStyleTaskResult: boolean
        showTaskStep: boolean
        showFileContent: boolean
    }

    processOption: {
        promiseLimit: number
    }

    tempData: { [index: string]: unknown }

}

export const DefaultConfig: WxRunningConfig = {
    miniProgramDir: "miniprogram",
    componentDir: "components",
    appConfigFile: "app.json",
    cssMainFile: "app.wxss",
    cssVarFile: "var.wxss",
    cssOutputFile: "mini.wxss",
    cssInputFiles: ["font.wxss"],
    workDir: "",
    watchOptions: {
        delay: 200,
        fileTypes: [".wxml"],
        refreshCount: 0
    },

    fileExtension: {
        page: ".wxml",
        ts: ".ts",
        js: ".js",
        css: ".wxss"
    },


    cssOption: {
        rootElementName: "page",
        componentGlobalCss: /addGlobalClass:\s*true/,
        one: {from: 1, to: 7.5, precision: 3, unit: "vmin"},
    },

    debugOptions: {
        printRule: true,
        printConfigInfo: true,
        showPageClassNames: false,
        showPageClassAttribute: false,
        showCssStyleNames: false,
        showPageTaskBegin: false,
        showPageTaskResult: false,
        showStyleTaskResult: false,
        showTaskStep: false,
        showFileContent: false
    },

    processOption: {
        promiseLimit: 5
    },

    tempData: {}
}

/**
 * extract class names from class attribute value
 * e.g. get ['text-28', 'text-black'] from 'text-28 text-black'
 * @param classAttributeValue attribute value of class or as class
 */
const extractClassNames = (classAttributeValue: string): string[] => {
    // do not parse short class names
    if (classAttributeValue.length < 2) {
        return []
    }

    // clean logic expression chars
    classAttributeValue = classAttributeValue.replace(/[a-zA-Z\d\.\s=&\[\]<>!%]+\?/g, "")

    // if value is only class names, just split it
    if (classAttributeValue.match(/^[\s\da-z-\\.]+$/)) {
        return classAttributeValue.trim().split(/\s+/)
    }

    // find class names by splitting words
    const result = classAttributeValue.match(/[\w-]+/g)

    // remove short class names and uppercase class names
    return result ? result.filter(m => m.length > 1 && !/[A-Z]/.test(m)) : []
}

const parseClassItemFromPage = (page: string, config: WxRunningConfig): string[] => {
    const classNames: string[] = []
    const xml = Deno.readTextFileSync(page)
    let attrName = ""
    for (const token of htmltok(xml)) {
        if (token.type == TokenType.ATTR_NAME) {
            attrName = token.getValue()
        }
        const isValidAttr = attrName == "class" || attrName == "hover-class" || attrName == "placeholder-class"
        if (isValidAttr && token.type == TokenType.ATTR_VALUE) {
            const items = extractClassNames(token.getValue())

            if (config.debugOptions.showPageClassAttribute) {
                log(`[check]${"".padEnd(9, " ")}parse class attribute [${token.getValue()}] to [${items.join(",")}]`)
            }
            classNames.push(...items)
        }
    }
    return classNames.compact().unique()
}

const readClassNamesFromCssFile = (cssFilePath: string): string[] | undefined => {
    try {
        const fileInfo = Deno.lstatSync(cssFilePath);
        if (fileInfo.isFile) {
            const cssContent = Deno.readTextFileSync(cssFilePath)
            const ast = css.parse(cssContent);
            return ast.stylesheet.rules
                .filter((m: Rule) => m.type == "rule").map((m: Rule) => m.selectors).flat().unique()
                .filter((m: string) => m.startsWith(".")).map((m: string) => m.slice(1))
        }
        return undefined
    } catch (e: unknown) {
        log(`[error] occurs on readClassNamesFromCssFile`, e)
        return undefined
    }
}

export const parseComponentClassNames = (pageInfo: PageInfo, config: WxRunningConfig): Promise<string[]> => {

    if (config.debugOptions.showPageTaskBegin) {
        log(`[task] process component page ${pageInfo.page}`)
    }
    let jsFileName = ""
    if (pageInfo.tsPath) {
        jsFileName = pageInfo.page.replace(config.fileExtension.page, config.fileExtension.ts)
    } else if (pageInfo.jsPath) {
        jsFileName = pageInfo.page.replace(config.fileExtension.page, config.fileExtension.js)
    }
    if (!jsFileName) {
        return Promise.resolve([])
    }

    const pageContent: string = Deno.readTextFileSync(jsFileName)

    if (!config.cssOption.componentGlobalCss.test(pageContent)) {
        if (config.debugOptions.showPageTaskResult) {
            log(`[data] ignore ${pageInfo.page} without global class option`)
        }
        return Promise.resolve([])
    }

    const classNames: string[] = parseClassItemFromPage(pageInfo.page, config)
    if (config.debugOptions.showPageClassNames) {
        log(`[data] found ${classNames.length} class names in ${pageInfo.page}`)
    }

    let styleNames: string[] = []
    if (pageInfo.cssPath) {
        const cssPage = pageInfo.page.replace(config.fileExtension.page, config.fileExtension.css)

        styleNames = readClassNamesFromCssFile(cssPage) || []
        if (config.debugOptions.showCssStyleNames) {
            log(`[data] found ${styleNames.length} styles names in ${pageInfo.page}`)
        }
    }

    const toCreateClassNames = classNames.diff(styleNames)
    if (config.debugOptions.showPageTaskResult) {
        log(`[data] add create styles task, [${toCreateClassNames.length}] class names, [${toCreateClassNames.join(",")}] from ${pageInfo.page}`)
    }
    return Promise.resolve(toCreateClassNames)
}

export const parseComponentPages = async (config: WxRunningConfig): Promise<PageInfo[]> => {
    // read all components files
    const componentsStack: string[] = [`${config.workDir}/${config.componentDir}`]
    const componentsPages: string[] = []

    while (componentsStack.length > 0) {
        const curDir = componentsStack.shift()
        if (curDir == undefined) {
            continue
        }
        for await (const dirEntry of Deno.readDir(curDir)) {
            if (dirEntry.isDirectory) {
                componentsStack.unshift(`${curDir}/${dirEntry.name}`)
            } else if (dirEntry.isFile) {
                componentsPages.push(`${curDir}/${dirEntry.name}`)
            }
        }
    }

    const pageInfos = componentsPages.filter((page: string) => page.endsWith(config.fileExtension.page))
        .map((page: string): PageInfo => {
            return {
                page,
                jsPath: componentsPages.indexOf(page.replace(config.fileExtension.page, config.fileExtension.js)) > -1,
                tsPath: componentsPages.indexOf(page.replace(config.fileExtension.page, config.fileExtension.ts)) > -1,
                cssPath: componentsPages.indexOf(page.replace(config.fileExtension.page, config.fileExtension.css)) > -1,
            }
        })
    return Promise.resolve(pageInfos)
}

export const parseMiniProgramPages = async (config: WxRunningConfig): Promise<string[]> => {
    const pages = await Deno.readTextFile(`${config.workDir}/${config.appConfigFile}`)
        .then((data: string) => {
            const app = JSON.parse(data)
            return [...app.pages, ...(app.subpackages || []).map((pkg: any) => pkg.pages.map((page: string) => `${pkg.root}/${page}`)).flat()]
        })
    log(`[task] read wechat mini program pages from config file, found [${pages.length}] pages`)
    return pages.map((page: string) => `${config.workDir}/${page}.wxml`)
}

export const parseGlobalStyleNames = async (config: WxRunningConfig): Promise<string[]> => {
    return await [...config.cssInputFiles, config.cssMainFile].map((filename: string) => {
        const result = readClassNamesFromCssFile(`${config.workDir}/${filename}`)
        if (result == undefined) {
            log(`[task] missing global css file [${filename}] and ignore`)
        } else {
            log(`[task] parse global styles names, found [${result.length}] in [${filename}]`)
        }
        return result
    }).flat().compact().unique()
}

export const parsePageClassNames = (config: WxRunningConfig, pagePath: string): Promise<string[]> => {

    const pageEmpty = "".padEnd(9, " ")

    if (config.debugOptions.showPageTaskBegin) {
        log(`[check] process page [${pagePath}]`)
    }

    const classNames: string[] = parseClassItemFromPage(pagePath, config)
    if (config.debugOptions.showPageClassNames) {
        log(`[check]${pageEmpty}found page class names [${classNames.length}] [${classNames.join(",")}]`)
    }

    const cssFilePath = pagePath.replace(".wxml", ".wxss")
    const styleNames = readClassNamesFromCssFile(cssFilePath)
    if (styleNames == undefined) {
        if (config.debugOptions.showPageTaskResult) {
            log(`[check]${pageEmpty}missing page class file [${cssFilePath}] and ignore`)
        }
    } else {
        if (config.debugOptions.showPageTaskResult) {
            log(`[check]${pageEmpty}found page style names [${styleNames.length}] [${styleNames.join(",")}]`)
        }
    }

    const missingStyleNames = classNames.diff(styleNames)
    if (missingStyleNames.length == 0) {
        if (config.debugOptions.showPageTaskResult) {
            log(`[check]${pageEmpty}no styles to create`)
        }
    } else {
        if (config.debugOptions.showPageTaskResult) {
            log(`[check]${pageEmpty}need to create [${missingStyleNames.length}] styles [${missingStyleNames.join(",")}]`)
        }
    }
    return Promise.resolve(missingStyleNames)
}

export const parseCssOutputFileStyleNames = (config: WxRunningConfig): Promise<string[]> => {
    //if (config.watchOptions.refreshCount++ == 0) {
    return Promise.resolve([])
    //}
    // const cssOutputFileName = `${config.workDir}/${config.cssOutputFile}`
    // let styleNames: string[] = (readClassNamesFromCssFile(cssOutputFileName) || []).compact().unique()
    // log(`[task] parse style names from [${cssOutputFileName}]`)
    // return styleNames
}


export const setMiniProgramOptions = (customConfig?: WxRunningConfig): Promise<WxRunningConfig> => {
    const config: WxRunningConfig = Object.assign({}, DefaultConfig, customConfig || {})
    return Promise.resolve(config)
}


export const ensureWorkDir = async (config: WxRunningConfig): Promise<WxRunningConfig> => {

    const workDir = Deno.args.length > 0 ? Deno.args[0] : "."
    for await (const dirEntry of Deno.readDir(workDir)) {
        if (dirEntry.name == config.miniProgramDir) {
            log(`[task] working directory found for ${config.miniProgramDir} at ${workDir}`)
            config.workDir = `${workDir}/${config.miniProgramDir}`
            return Promise.resolve(config)
        }
        if (dirEntry.name == config.cssMainFile) {
            log(`[task] working directory found for ${config.cssMainFile} at ${workDir}`)
            config.workDir = workDir
            return Promise.resolve(config)
        }
    }

    log(`[task] invalid working directory, can not found ${config.cssMainFile} or ${config.miniProgramDir} directory`)
    return Promise.reject("should set working directory to wechat mini program dir")
}


export const watchMiniProgramPageChange = async (config: WxRunningConfig, refreshEvent: (config: WxRunningConfig) => Promise<number>) => {

    const watcher = Deno.watchFs(config.workDir);
    let refreshCount = 0
    let refreshWorking = false

    for await (const event of watcher) {
        // log(">>>> event", event);

        if (refreshWorking) {
            continue
        }

        const needRefresh: boolean = event.paths.map((path: string) => path.slice(path.lastIndexOf(".")))
            .filter((fileExtension: string) => config.watchOptions.fileTypes.indexOf(fileExtension) > -1)
            .length > 0
        if (needRefresh && !refreshWorking) {
            refreshWorking = true

            log(`[file changed] ${event.paths.join(";")}`)

            sleep(config.watchOptions.delay)
                .then(() => refreshEvent(config))
                .then(() => {
                    refreshWorking = false
                    log(`[task] wxmp-atomic-css refresh ${++refreshCount}x`)
                })
        }
    }
}

export const getRuleSetting = (config: WxRunningConfig): StyleRuleSetting => {
    if (config.tempData["ruleSetting"]) {
        return config.tempData["ruleSetting"] as StyleRuleSetting
    }
    const ruleSetting = initRuleSetting(Rules, Object.keys(Themes));
    config.tempData["ruleSetting"] = ruleSetting
    log(`[task] read ${ruleSetting.rules.length} rules`)
    return ruleSetting;
}

export const mergeTargetClassNames = (values: Awaited<string[]>[]): Promise<string[]> => {
    const globalStyleNames = values[0] as string[]
    const generatedStyleNames = values[1] as string[]
    const pageClassNames = values[2] as string[]
    const componentPageClassNames = values[3] as string[]

    log(`[data] total found [${globalStyleNames.length}] global style names`)
    log(`[data] total found [${generatedStyleNames.length}] generated style names`)
    log(`[data] total found [${pageClassNames.length}] class names from pages`)
    log(`[data] total found [${componentPageClassNames.length}] class names from components`)

    const missingClassNames: string[] = [].merge(pageClassNames).merge(componentPageClassNames)
        .diff(globalStyleNames).diff(generatedStyleNames).compact().unique().sort()

    const toRemoveClassNames: string[] = [].merge(globalStyleNames).merge(generatedStyleNames)
        .diff(pageClassNames).diff(componentPageClassNames).compact().unique().sort()

    if (toRemoveClassNames.length > 0) {
        log(`[data] [${toRemoveClassNames.length}] class names to remove, [${toRemoveClassNames.join(",")}]`)
    }

    if (missingClassNames.length == 0) {
        log(`[data] no class names to create`)
        return Promise.reject(1)
    }

    log(`[data] new task for generate [${missingClassNames.length}] class names = [${missingClassNames.join(",")}]`)
    return Promise.resolve(missingClassNames)
}


export const save = (classResultList: StyleInfo[], config: WxRunningConfig): Promise<number> => {
    const styles = classResultList.map((m: StyleInfo) => m.styles).flat()

    const warnings = classResultList.map((m: StyleInfo) => m.warnings).flat().compact().unique().sort()
    if (warnings.length > 0 && styles.length == 0) {
        log(`[data] no updates with warnings`)
        return Promise.resolve(2)
    }

    const units = classResultList.map((m: StyleInfo) => m.units).flat().compact().unique().sort()
    log(`[data] new task to create [${units.length}] unit vars, [${units.join(",")}]`)

    const colors = classResultList.map((m: StyleInfo) => m.colors).flat().compact().unique().sort()
    log(`[data] new task to create [${colors.length}] color vars, [${colors.join(",")}]`)

    log(`[task] begin to write output file`)

    const varsContent = generateVars(units, colors, config.cssOption.rootElementName, config.cssOption.one)
    if (config.debugOptions.showFileContent) {
        log(`[data] varsContent=${varsContent}`)
    }
    Deno.writeTextFileSync(`${config.workDir}/${config.cssVarFile}`, varsContent)
    log(`[task] save ${varsContent.length} chars to ${config.cssVarFile}`)

    const styleContent = classResultList.map((m: StyleInfo) => m.styles).flat().join("\n")
    if (config.debugOptions.showFileContent) {
        log(`[data] styleContent=${styleContent}`)
    }
    Deno.writeTextFileSync(`${config.workDir}/${config.cssOutputFile}`, styleContent)
    log(`[task] save ${styleContent.length} chars to ${config.cssOutputFile}`)

    return Promise.resolve(0)
}