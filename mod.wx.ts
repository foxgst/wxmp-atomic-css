import {htmltok, TokenType} from "https://deno.land/x/htmltok@v0.0.3/private/htmltok.ts";
import * as css from "https://deno.land/x/css@0.3.0/mod.ts";
import {Rule} from "https://deno.land/x/css@0.3.0/mod.ts";
import {withoutAll} from "https://deno.land/std@0.160.0/collections/without_all.ts";
import {getScriptParentPath, isAbsolutePath, log, promiseLimit, sleep, Timing} from "./util.ts";
import {readAndInitRuleSetting, rulesToString, StyleRuleSetting} from "./data.rule.ts";
import {readThemes, ThemeMap, themesToString} from "./data.theme.ts";
import {OptionalRunningConfig, readConfig, StyleInfo, WxRunningConfig} from "./data.config.ts";
import * as style from "./mod.style.ts";
import * as Colors from "https://deno.land/std/fmt/colors.ts";

export interface PageInfo {
    page: string,
    tsPath: boolean,
    jsPath: boolean,
    cssPath: boolean
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
    classAttributeValue = classAttributeValue.replace(/[a-zA-Z\d\\.\s=&\[\]<>!%]+\?/g, "")

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

            if (config.debugOption.showPageClassAttribute) {
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
        log(Colors.red(`[error] occurs on readClassNamesFromCssFile`, e))
        return undefined
    }
}

export const parseComponentClassNames = (pageInfo: PageInfo, config: WxRunningConfig): Promise<string[]> => {

    if (config.debugOption.showPageTaskBegin) {
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

    if (!new RegExp(config.cssOption.componentGlobalCss).test(pageContent)) {
        if (config.debugOption.showPageTaskResult) {
            log(`[data] ignore ${pageInfo.page} without global class option`)
        }
        return Promise.resolve([])
    }

    const classNames: string[] = parseClassItemFromPage(pageInfo.page, config)
    if (config.debugOption.showPageClassNames) {
        log(`[data] found ${classNames.length} class names in ${pageInfo.page}`)
    }

    let styleNames: string[] = []
    if (pageInfo.cssPath) {
        const cssPage = pageInfo.page.replace(config.fileExtension.page, config.fileExtension.css)

        styleNames = readClassNamesFromCssFile(cssPage) || []
        if (config.debugOption.showCssStyleNames) {
            log(`[data] found ${styleNames.length} styles names in ${pageInfo.page}`)
        }
    }

    const toCreateClassNames = classNames.diff(styleNames)
    if (config.debugOption.showPageTaskResult) {
        log(`[data] add create styles task, [${toCreateClassNames.length}] class names, [${toCreateClassNames.join(",")}] from ${pageInfo.page}`)
    }

    config.tempData.pageClassNameMap[pageInfo.page] = toCreateClassNames
    return Promise.resolve(toCreateClassNames)
}

export const parseComponentPages = async (config: WxRunningConfig): Promise<PageInfo[]> => {
    // read all components files
    const componentsStack: string[] = [`${config.workDir}/${config.fileStructure.componentDir}`]
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
        .map((page: string): PageInfo => makePageInfo(page, componentsPages, config))
    return Promise.resolve(pageInfos)
}

export const parseMiniProgramPages = async (config: WxRunningConfig): Promise<string[]> => {

    interface AppSubpackage {
        root: string,
        pages: string[]
    }

    interface AppJson {
        pages: string[],
        subpackages?: AppSubpackage[]
    }

    const pages = await Deno.readTextFile(`${config.workDir}/${config.fileStructure.appConfigFile}`)
        .then((data: string) => {
            const app = JSON.parse(data) as AppJson
            return [...app.pages, ...(app.subpackages || [])
                .map((pkg: AppSubpackage) => pkg.pages.map((page: string) => `${pkg.root}/${page}`)).flat()]
        })
    log(`[task] read wechat mini program pages from config file, found [ ${Colors.cyan(pages.length.toString())} ] pages`)
    return pages.map((page: string) => `${config.workDir}/${page}.wxml`)
}

export const parseGlobalStyleNames = async (config: WxRunningConfig): Promise<string[]> => {
    const classNames = await [...config.fileStructure.cssInputFiles, config.fileStructure.cssMainFile].map((filename: string) => {
        const result = readClassNamesFromCssFile(`${config.workDir}/${filename}`)
        if (result == undefined) {
            log(`[task] missing global css file [${filename}] and ignore`)
        } else {
            log(`[task] parse global styles names, found [ ${Colors.cyan(result.length.toString())} ] in [${filename}]`)
        }
        return result
    }).flat().compact().unique()
    config.tempData.globalClassNames = classNames
    return classNames
}

export const parsePageClassNames = (pagePath: string, config: WxRunningConfig): Promise<string[]> => {

    const pageEmpty = "".padEnd(9, " ")

    if (config.debugOption.showPageTaskBegin) {
        log(`[check] process page [${pagePath}]`)
    }

    const classNames: string[] = parseClassItemFromPage(pagePath, config)
    if (config.debugOption.showPageClassNames) {
        log(`[check]${pageEmpty}found page class names [ ${Colors.cyan(classNames.length.toString())} ] [${classNames.join(",")}]`)
    }

    const cssFilePath = pagePath.replace(".wxml", ".wxss")
    const styleNames = readClassNamesFromCssFile(cssFilePath)
    if (styleNames == undefined) {
        if (config.debugOption.showPageTaskResult) {
            log(`[check]${pageEmpty}missing page class file [${cssFilePath}] and ignore`)
        }
    } else {
        if (config.debugOption.showPageTaskResult) {
            log(`[check]${pageEmpty}found page style names [ ${Colors.cyan(styleNames.length.toString())} ] [${styleNames.join(",")}]`)
        }
    }

    const missingStyleNames = classNames.diff(styleNames)
    if (missingStyleNames.length == 0) {
        if (config.debugOption.showPageTaskResult) {
            log(`[check]${pageEmpty}no styles to create`)
        }
    } else {
        if (config.debugOption.showPageTaskResult) {
            log(`[check]${pageEmpty}need to create [ ${Colors.cyan(missingStyleNames.length.toString())} ] styles [${missingStyleNames.join(",")}]`)
        }
    }
    config.tempData.pageClassNameMap[pagePath] = missingStyleNames || []
    return Promise.resolve(missingStyleNames)
}

export const readRunningConfig = async (filePath: string, customConfig?: OptionalRunningConfig): Promise<WxRunningConfig> => {
    const isAbsolutePath = filePath.startsWith("http") || filePath.startsWith("/") || filePath.includes(":");
    const trueFilePath = isAbsolutePath ? filePath : `${getScriptParentPath()}/${filePath}`
    const runningConfig = await readConfig(trueFilePath)
    const config: WxRunningConfig = Object.assign({}, runningConfig, customConfig || {})
    config.configSource = getScriptParentPath(filePath)
    return Promise.resolve(config)
}

export const printRunningConfig = async (config: WxRunningConfig): Promise<WxRunningConfig> => {
    if (config.debugOption.printConfigInfo) {
        log("[data] config: ", config)
    }
    const themeMap = await getThemeMap(config)
    if (config.debugOption.printThemes) {
        log("[data] themes: ", themesToString(themeMap))
    }
    const ruleSetting = await getRuleSetting(config)
    if (config.debugOption.printRule) {
        log("[data] rules: ", rulesToString(ruleSetting.rules))
    }
    return config
}


export const ensureWorkDir = async (config: WxRunningConfig): Promise<WxRunningConfig> => {
    const workDir = Deno.args.length > 0 ? Deno.args[0] : "."
    for await (const dirEntry of Deno.readDir(workDir)) {
        if (dirEntry.name == config.fileStructure.miniProgramDir) {
            log(`[task] working directory found for ${config.fileStructure.miniProgramDir} at ${workDir}`)
            config.workDir = `${workDir}/${config.fileStructure.miniProgramDir}`
            return Promise.resolve(config)
        }
        if (dirEntry.name == config.fileStructure.cssMainFile) {
            log(`[task] working directory found for ${config.fileStructure.cssMainFile} at ${workDir}`)
            config.workDir = workDir
            return Promise.resolve(config)
        }
    }

    log(Colors.red(`[task] invalid working directory, can not found ${config.fileStructure.cssMainFile} or ${config.fileStructure.miniProgramDir} directory`))
    return Promise.reject({code: -1, msg: "should set working directory to wechat mini program dir"})
}

export const watchMiniProgramPageChange = async (config: WxRunningConfig, refreshEvent: (config: WxRunningConfig, fileEvents: string[]) => Promise<number>) => {
    const watcher = Deno.watchFs(config.workDir);
    let refreshCount = 0
    let refreshWorking = false
    let fileEventStack: string[] = new Array<string>()

    for await (const event of watcher) {
        // log(">>>> event", event);

        // to add events
        const fileEvents = event.paths.map((path: string) => {
            const fileExtension = path.slice(path.lastIndexOf("."))
            const fileMatched = config.watchOption.fileTypes.indexOf(fileExtension) > -1
            return fileMatched ? `${event.kind == "remove" ? "-" : "*"}${path}` : undefined
        }).compact().unique()

        fileEventStack = [...fileEventStack, ...fileEvents].unique()

        // if refreshing is pending, prevent to refresh
        if (refreshWorking || fileEventStack.length == 0) {
            continue
        }

        refreshWorking = true

        sleep(config.watchOption.delay)
            .then(() => {
                const processEvents = [...fileEventStack]
                fileEventStack = fileEventStack.slice(processEvents.length)
                log(Colors.bgYellow(Colors.white(`[file changed] ${processEvents.join(",")}`)))
                return refreshEvent(config, processEvents)
            })
            .then(() => {
                log(Colors.green(Colors.bold(`[task] wxmp-atomic-css refresh ${++refreshCount}x`)))
            }).finally(() => {
            refreshWorking = false
        })
    }
}

export const getRuleSetting = async (config: WxRunningConfig): Promise<StyleRuleSetting> => {
    if (config.tempData.ruleSetting == undefined) {
        let filePath = config.dataOption.ruleFile
        if (!isAbsolutePath(filePath)) {
            filePath = `${config.configSource}/${filePath}`
        }
        config.tempData.ruleSetting = await readAndInitRuleSetting(filePath)
        log(`[task] read ${Colors.cyan(config.tempData.ruleSetting.rules.length.toString())} rules`)
    }
    return config.tempData.ruleSetting;
}


export const getThemeMap = async (config: WxRunningConfig): Promise<ThemeMap> => {
    if (config.tempData.themeMap == undefined) {
        let filePath = config.dataOption.themeFile
        if (!isAbsolutePath(filePath)) {
            filePath = `${config.configSource}/${filePath}`
        }
        config.tempData.themeMap = await readThemes(filePath)
        log(`[task] read ${Colors.cyan(Object.keys(config.tempData.themeMap).length.toString())} themes`)
    }
    return config.tempData.themeMap;
}

export const mergeTargetClassNames = (config: WxRunningConfig) => (values: Awaited<string[]>[]): Promise<string[]> => {
    const globalStyleNames = values[0] as string[]
    const pageClassNames = values[1] as string[]
    const componentPageClassNames = values[2] as string[]

    log(`[data] total found [ ${Colors.cyan(globalStyleNames.length.toString())} ] global style names`)
    log(`[data] total found [ ${Colors.cyan(pageClassNames.length.toString())} ] class names from pages`)
    log(`[data] total found [ ${Colors.cyan(componentPageClassNames.length.toString())} ] class names from components`)

    const missingClassNames: string[] = [].merge(pageClassNames).merge(componentPageClassNames)
        .diff(globalStyleNames).compact().unique().sort()

    const toRemoveClassNames: string[] = [].merge(globalStyleNames)
        .diff(pageClassNames).diff(componentPageClassNames).compact().unique().sort()

    if (toRemoveClassNames.length > 0) {
        log(`[data] [ ${Colors.cyan(toRemoveClassNames.length.toString())} ] class names to remove, [${toRemoveClassNames.join(",")}]`)
    }

    if (missingClassNames.length == 0) {
        log(`[data] no class names to create`)
        return Promise.reject({code: 1, msg: "class names has no update"})
    }

    config.tempData.tempGlobalClassNames = missingClassNames
    log(`[data] new task for generate [ ${Colors.cyan(missingClassNames.length.toString())} ] class names = [${missingClassNames.join(",")}]`)
    return Promise.resolve(missingClassNames)
}


export const batchPromise = <T>(handler: (task: T, config: WxRunningConfig) => Promise<string[]>,
                                config: WxRunningConfig) => (tasks: T[]): Promise<string[]> => {
    return promiseLimit(handler.name, tasks.length,
        (taskIndex: number): Promise<string[]> => handler(tasks[taskIndex], config),
        config.processOption.promiseLimit, config.debugOption.showTaskStep)
        .then((classNames: string[][]) => classNames.flat().compact().unique())
}

export const generateContent = (config: WxRunningConfig) => async (classNames: string[]): Promise<StyleInfo[]> => {
    log(`[data] new task to create [ ${Colors.cyan(classNames.length.toString())} ] class names`)
    return style.generateStyleContents(classNames, await getRuleSetting(config), config.cssOption,
        config.debugOption.showStyleTaskResult);
}

export const saveContent = (config: WxRunningConfig) => async (classResultList: StyleInfo[]): Promise<number> => {
    const styles = classResultList.map((m: StyleInfo) => m.styles).flat()


    const warnings = classResultList.map((m: StyleInfo) => m.warnings).flat().compact().unique().sort()
    if (warnings.length > 0) {
        log(Colors.yellow(`[warn] ${warnings.length} class names not matched, ${warnings.join(",")}`))
        if (styles.length == 0) {
            log(`[data] no updates with warnings`)
            return Promise.resolve(2)
        }
    }

    const units = classResultList.map((m: StyleInfo) => m.units).flat().compact().unique().sort()
    log(`[data] new task to create [ ${Colors.cyan(units.length.toString())} ] unit vars, [${units.join(",")}]`)

    const colors = classResultList.map((m: StyleInfo) => m.colors).flat().compact().unique().sort()
    log(`[data] new task to create [ ${Colors.cyan(colors.length.toString())} ] color vars, [${colors.join(",")}]`)

    log(`[task] begin to write output file`)

    const themeMap = await getThemeMap(config)
    let varsContent = style.generateVars(units, colors, config.cssOption, themeMap)
    if (config.debugOption.showFileContent) {
        log(`[data] varsContent=${varsContent}`)
    }
    if (config.cssOption.minify) {
        varsContent = varsContent.replace(/;}/g, "}")
    }
    Deno.writeTextFileSync(`${config.workDir}/${config.fileStructure.cssVarFile}`, varsContent)
    log(`[task] save ${Colors.cyan(varsContent.length.toString())} chars to ${config.fileStructure.cssVarFile}`)

    let styleContent = classResultList.map((m: StyleInfo) => m.styles).flat().join("")
    if (config.cssOption.varPrefix) {
        styleContent = styleContent.replace(/--color-/g, `--${config.cssOption.varPrefix}color-`)
        styleContent = styleContent.replace(/--unit-/g, `--${config.cssOption.varPrefix}unit-`)
    }
    if (config.cssOption.minify) {
        styleContent = styleContent.replace(/\s+/g, "").replace(/;}/g, "}")
    }
    if (config.debugOption.showFileContent) {
        log(`[data] styleContent=${styleContent}`)
    }
    Deno.writeTextFileSync(`${config.workDir}/${config.fileStructure.cssOutputFile}`, styleContent)
    log(`[task] save ${Colors.cyan(styleContent.length.toString())} chars to ${config.fileStructure.cssOutputFile}`)

    // config.tempData.globalClassNames = config.tempData.tempGlobalClassNames

    return Promise.resolve(0)
}

export const finishAndPrintCostTime = (config: WxRunningConfig, time: Timing) => (result: number) => {
    config.tempData.globalClassNames = config.tempData.tempGlobalClassNames
    config.tempData.tempGlobalClassNames = []
    log(Colors.green(`[data] job done, cost ${time.es()} ms, result = ${result}`))
    return Promise.resolve(0)
};

export const generateClassNamesFromFileEvents = async (config: WxRunningConfig, fileEvents: string[]): Promise<string[]> => {

    let updated = 0
    for (const fileEvent of fileEvents) {
        const removed = fileEvent.charAt(0) == "-"
        const path = fileEvent.slice(1)
        if (removed) {
            if (config.tempData.pageClassNameMap[path]) {
                delete config.tempData.pageClassNameMap[path]
            }
        } else {
            if (path.includes(config.fileStructure.componentDir)) {
                const pageInfo = await generatePageInfo(config, path)
                const classNames = await parseComponentClassNames(pageInfo, config)
                config.tempData.pageClassNameMap[path] = classNames
                log(`[task] component page [${path}] - [${classNames}]`)
                if (withoutAll(classNames, config.tempData.globalClassNames).length > 0) {
                    updated = 1
                }
            } else {
                const classNames = await parsePageClassNames(path, config)
                config.tempData.pageClassNameMap[path] = classNames
                log(`[task] page [${path}] - [${classNames}]`)

                // log(`classNames`, classNames.join(","))
                // log(`config.tempData.globalClassNames`, config.tempData.globalClassNames.join(","))
                // log(`withoutAll(classNames, config.tempData.globalClassNames)`, withoutAll(classNames, config.tempData.globalClassNames).join(","))
                if (withoutAll(classNames, config.tempData.globalClassNames).length > 0) {
                    updated = 1
                }
            }
        }
    }

    if (updated == 0) {
        return Promise.reject({code: 1, msg: "page class names already generated"})
    }

    const allClassNames: string[] = Object.keys(config.tempData.pageClassNameMap)
        .map((page: string) => config.tempData.pageClassNameMap[page])
        .flat().compact().unique()

    // if (allClassNames.filter((m: string) => config.tempData.globalClassNames.indexOf(m) == -1).length == 0) {
    //     return Promise.reject({code: 1, msg: "page class names already generated"})
    // }
    config.tempData.tempGlobalClassNames = allClassNames
    return allClassNames
}

const makePageInfo = (page: string, componentsPages: string[], config: WxRunningConfig) => ({
    page,
    jsPath: componentsPages.indexOf(page.replace(config.fileExtension.page, config.fileExtension.js)) > -1,
    tsPath: componentsPages.indexOf(page.replace(config.fileExtension.page, config.fileExtension.ts)) > -1,
    cssPath: componentsPages.indexOf(page.replace(config.fileExtension.page, config.fileExtension.css)) > -1,
});

export const generatePageInfo = async (config: WxRunningConfig, page: string): Promise<PageInfo> => {
    const curDir = page.slice(0, page.lastIndexOf("/"))
    const componentsPages: string[] = []
    for await (const dirEntry of Deno.readDir(curDir)) {
        if (dirEntry.isFile) {
            componentsPages.push(`${curDir}/${dirEntry.name}`)
        }
    }
    return makePageInfo(page, componentsPages, config)
}