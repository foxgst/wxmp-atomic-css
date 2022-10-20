import "https://deno.land/x/arrays/mod.ts";
import "https://deno.land/std/fs/mod.ts";
import {htmltok, TokenType} from 'https://deno.land/x/htmltok@v0.0.3/mod.ts';
import * as css from "https://deno.land/x/css@0.3.0/mod.ts";
import {theme} from "./theme.ts";
import {rule} from "./rule.ts";

const log = (...args: any[]) => {
    const now = new Date()
    const at = `${now.getFullYear()}-${now.getMonth()}-${now.getDate() + 1} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`
    console.log(at.padEnd(22, " "), ...args)
}

export namespace util {

    /**
     * 延时函数
     * @param delay 延时毫秒数
     */
    export const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

    /**
     * mark a timestamp and return escaped time
     */
    export const timing = (): number => {
        const at = new Date().getTime()
        return {at, es: () => new Date().getTime() - at}
    }

    export const promiseLimit = async (taskName: string, taskCount: number, limit: number, showTaskStep: boolean, process: (taskIndex: number) => Promise<T>): T[] => {
        const result: T[] = []

        log(`[task] [${taskName}] begin ${taskCount} tasks`)
        for (let i = 0; i < taskCount; i += limit) {
            const currentTasks: Promise<string[]> = []
            for (let j = 0; j < limit && i + j < taskCount; j++) {
                const taskIndex = i + j
                if (showTaskStep) {
                    log(`[task] [${taskName}] ${taskIndex + 1}/${taskCount}`)
                }
                currentTasks.push(process(taskIndex))
            }
            const taskResult = await Promise.all(currentTasks)
            result.push(...taskResult)
        }
        log(`[task] [${taskName}] finish ${taskCount} tasks`)
        return result
    };

}

export namespace style {

    /**
     * 表示数值，有些值不能整除，使用 from/to/scale 进行描述
     */
    export interface ValueRange {
        from: number
        to: number
        scale: number
        unit: string
    }


    /**
     * 原子样式规则
     */
    interface AtomicStyleRule {
        /**
         * 包名
         */
        package: string
        /**
         * 规则描述
         */
        desc?: string
        /**
         * class name syntax, could use vars, [U]-unit, [C]-color, [N]-number,
         * [A]-alpha number, with decimal point as prefix is the true value
         */
        syntax: string
        /**
         * classes name which in global css file and compose to the new style
         */
        compose?: string[]
        /**
         * style declaration for class names, required if compose is undefined or empty
         */
        expr?: string,
        /**
         * dependencies of style names
         */
        dependencies?: string[],
        /**
         * units includes by expr, effected on running
         */
        units?: string[],
        /**
         * colors includes by expr, effected on running
         */
        colors?: string[],
        /**
         * regExtp for dynamic expr, which includes [, effected on running
         */
        syntaxRegex?: RegExp
    }

    export interface StyleInfo {
        // ref units
        units: string[],
        // ref colors
        colors: string[],
        // final declaration of the style
        styles: string[],
        // warnings occurs on generating style info
        warnings: string[],
        // dependencies of classNames, e.g. keyframes
        classNames: string[]
    }


    interface ExprPara {
        unit?: string
        number?: string
        color?: string
        alpha?: string
    }

    export interface StyleRuleSetting {
        ruleMap: { [index: string]: AtomicStyleRule, }
        rules: AtomicStyleRule[]
        themes: string[]
    }

    const extraPara = (expression: string, rule: AtomicStyleRule | undefined): ExprPara | undefined => {
        if (rule == undefined || rule.syntaxRegex == undefined) {
            return undefined
        }
        const para: ExprPara = {
            unit: undefined,
            number: undefined,
            color: undefined,
            alpha: undefined
        }
        const matchResult = expression.match(rule.syntaxRegex)
        if (matchResult && matchResult.groups) {
            if (matchResult.groups["U"]) {
                para.unit = matchResult.groups["U"]
            }
            if (matchResult.groups["C"]) {
                para.color = matchResult.groups["C"]
            }
            if (matchResult.groups["N"]) {
                para.number = matchResult.groups["N"]
            }
            if (matchResult.groups["A"]) {
                para.alpha = matchResult.groups["A"]
            }
            if (para.color) {
                if (para.number == undefined) {
                    para.number = "1"
                } else if (theme.Themes[para.color].length == 1) {
                    para.alpha = para.number
                    para.number = "1"
                }
            }
        }
        return para
    }

    const searchRulesByExpr = (expression: string, ruleSetting: StyleRuleSetting): AtomicStyleRule[] | undefined => {
        if (expression == "") {
            return undefined
        }
        // 通过包名引入静态规则
        if (expression.includes(".")) {
            return ruleSetting.rules.filter((rule: AtomicStyleRule) => {
                return rule.package.includes(expression) && !rule.syntaxRegex
            })
        }
        // 直接查询
        const rule = ruleSetting.ruleMap[expression]
        if (rule) {
            return [rule]
        }
        return ruleSetting.rules.filter((rule: AtomicStyleRule) => {
            return rule.syntaxRegex?.test(expression)
        })
    }


    export const makeCssForExpr = (expression: string, ruleSetting: StyleRuleSetting): style.StyleInfo => {
        let rules = searchRulesByExpr(expression, ruleSetting)
        if (rules == undefined || rules.length == 0) {
            return {units: [], colors: [], styles: [], warnings: [expression], classNames: []}
        }

        const classRuleStack = rules.map((rule: AtomicStyleRule) => {
            return {classExpr: expression, rule}
        })

        const styles: string[] = []
        const units: string[] = []
        const colors: string[] = []
        const classNames: string[] = []

        while (classRuleStack.length > 0) {
            const classRule = classRuleStack.shift()
            if (!classRule) {
                break
            }

            const para: ExprPara = extraPara(classRule.classExpr, classRule.rule)
            if (para != undefined) {
                if (para.unit) {
                    units.push(para.unit)
                }
                if (para.color) {
                    if (para.alpha == undefined) {
                        colors.push(`${para.color}-${para.number || 0}`)
                    } else {
                        colors.push(`${para.color}-${para.number || 0}-${para.alpha || ""}`)
                    }
                }
            }
            if (classRule.rule.compose) {
                classRule.rule.compose.forEach((command: string) => {
                    const newClassExpr = wrapPara(command, para)
                    let newRules = searchRulesByExpr(newClassExpr, ruleSetting)
                    newRules?.forEach((rule: AtomicStyleRule) => {
                        units.push(...(rule?.units || []))
                        colors.push(...(rule?.colors || []))
                        classRuleStack.unshift({classExpr: newClassExpr, rule})
                    })
                })
            }
            if (classRule.rule.expr) {
                units.push(...(classRule.rule?.units || []))
                colors.push(...(classRule.rule?.colors || []))
                const style = wrapPara(classRule.rule.expr, para)
                styles.push(style)
            }
            if (classRule.rule.dependencies) {
                classNames.push(...classRule.rule.dependencies)
            }
        }

        if (styles.length > 0) {
            styles.unshift(`.${expression}{`)
            styles.push("}")
        }

        return {units: units.compact().unique(), colors: colors.compact().unique(), styles, warnings: [], classNames}
    }

    const wrapPara = (expression: string, para?: ExprPara | undefined): string => {
        if (expression == "" || para == undefined) {
            return expression || ""
        }
        if (para.unit != undefined) {
            expression = expression.replace(/\[U\]/g, para.unit)
        }
        if (para.number != undefined) {
            expression = expression.replace(/\[N\]/g, para.number)
        }
        if (para.color != undefined) {
            expression = expression.replace(/\[C\]/g, para.color)
        }
        if (para.alpha != undefined) {
            expression = expression.replace(/\[A\]/g, para.alpha)
        }
        return expression
    }

    /**
     * 将样式规则数组转换为字典，便于快速读取
     * @param rules 样式规则数组
     * @param themes 主题名称
     */
    export const initRuleSetting = (rules: AtomicStyleRule[], themes: string[]): StyleRuleSetting => {
        const ruleMap: { [index: string]: AtomicStyleRule } = {}
        rules.forEach((rule: AtomicStyleRule) => {

            // auto extract dependent units and colors
            if (rule.expr) {
                if (rule.expr.includes("--unit")) {
                    const units = rule.expr.match(/--unit-([0-9|d|p]+)/g)
                    if (units) {
                        rule.units = units.map((m: string) => m.replace("--unit-", ""))
                    }
                }
                if (rule.expr.includes("--color")) {
                    const units = rule.expr.match(/--color-([a-z]+)(-[0-9]+(-a[0-9]+)?)?/g)
                    if (units) {
                        rule.colors = units.map((m: string) => m.replace("--color-", ""))
                    }
                }
                // if(rule.units && rule.units.length) {
                //     console.log("=====", rule.syntax, rule.units, rule.colors)
                // }
            }

            if (rule.syntax.includes("[")) {
                // 生成动态规则名称
                const ruleMapName = rule.syntax.replace(/[C|U|N|A]/g, "")
                // 生成正则表达式
                const regexExpr = rule.syntax
                    .replace("[U]", "(?<U>[0-9|d|p]+)")
                    .replace("[C]", "(?<C>[a-z]+)")
                    .replace("[N]", "(?<N>[0-9]+)")
                    .replace("[A]", "(?<A>[0-9]+)")
                // 设置规则名称
                rule.syntaxRegex = new RegExp("^" + regexExpr + "$")
                ruleMap[ruleMapName] = rule
            } else {
                ruleMap[rule.syntax] = rule
            }
        })
        return {ruleMap, themes, rules}
    }

    /**
     * 生成变量的CSS
     * @param units 全部数值
     * @param colors
     * @param rootElementName
     * @param one
     */
    export const generateVars = (units: string[], colors: string[], rootElementName: string, one: ValueRange): string => {

        const clearFunctions = [
            {rule: /d/g, value: "0."},
            {rule: /p/g, value: "0.000"},
        ]
        const getUnitNumber = (v: string) => parseFloat(v.replace(clearFunctions[0].rule, clearFunctions[0].value)
            .replace(clearFunctions[1].rule, clearFunctions[1].value))
        units = units.sort((left: string, right: string) => getUnitNumber(left) - getUnitNumber(right))

        const vars: string[] = []
        vars.push(`${rootElementName} {`)
        units.forEach((unit: string) => {
            vars.push(`--unit-${unit}: ${calcUnitValue(unit, one)};`)
        })

        colors.forEach((color: string) => {
            const colorInfo = color.match(/(?<theme>[a-z]+)-(?<order>\d+)(-(?<alpha>\d+))?/)?.groups
            if (!colorInfo) {
                throw Error(`invalid color ${color}`)
            }

            const {theme, order, alpha} = colorInfo
            vars.push(`--color-${color}: ${generateColorVar(theme, order, alpha)};`)
        })


        vars.push("}")
        return vars.join("\n")
    }

    /**
     * calc unit value
     * @param unit unit number value or percent value
     * @param one unit one's config
     */
    const calcUnitValue = (unit: string, one: ValueRange): string => {
        // zero means nothing without rpx or vm etc.
        if (unit == "0") {
            return "0"
        }

        // alias full means "100%", equals to "p100"
        if (unit == "full") {
            return "100%"
        }

        // transform decimal value, "d" means "0.", "d5" means "0.5"
        unit = unit.replace("d", "0.")

        // number value
        if (/^([\d\\.]+)$/.test(unit)) {
            const numberValue: Number = Number(unit)
            const scale = Math.pow(10, one.scale)
            return Math.round(numberValue * one.from * scale / one.to) / scale + one.unit
        }

        // percent value
        if (/^p(\d+)$/.test(unit)) {
            return unit.replace(/^p(\d+)$/, "$1%")
        }

        throw Error(`invalid unit value: ${unit}`)
    }

    /**
     * 生成主题色彩变量
     * @param themeName 主题名称
     * @param colorOrder
     * @param alpha
     */
    const generateColorVar = (themeName: string, colorOrder: string, alpha: string): string => {
        if (themeName == "") {
            throw Error("missing theme name")
        }
        if (!theme.Themes[themeName]) {
            throw Error(`missing theme ${themeName}`)
        }
        const colors = theme.Themes[themeName] as string[]
        if (colors.length == 0) {
            throw Error(`theme ${themeName} is empty`)
        }
        if (!colorOrder) {
            return `rgb(${colors[0]})`
        }

        const orderValue = parseInt(colorOrder) - 1
        if (orderValue >= 0 && orderValue <= colors.length - 1) {
            if (alpha == undefined || alpha == 1) {
                return `rgb(${colors[orderValue]})`
            } else {
                return `rgba(${colors[orderValue]}, 0.${alpha})`
            }
        }

        throw Error(`invalid color value ${themeName}-${colorOrder}-${alpha}`)
    }


    export const generateStyleContents = (missingClassNames: string[], ruleSetting: style.StyleRuleSetting, showStyleTaskResult: boolean): StyleInfo[] => {
        return missingClassNames.map((classExpr: string): style.StyleInfo => {
            const {units, colors, styles, warnings} = style.makeCssForExpr(classExpr, ruleSetting)

            if (showStyleTaskResult) {
                const order = "".padStart(12, " ")
                const unitString = units.length == 0 ? "" : `units = ${units.join(",")}`
                const colorString = colors.length == 0 ? "" : `colors = ${colors.join(",")}`
                const warningString = warnings.length == 0 ? "" : `warnings = ${warnings.join(",")}`
                log(`[task] ${order}`, classExpr.padEnd(20, " "), unitString, colorString, warningString)
            }

            return {units, colors, styles, warnings}
        })
    }


}

namespace wx {

    export interface PageInfo {
        page: string,
        tsPath?: string,
        jsPath?: string,
        cssPath?: string
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
            one: style.ValueRange
        }

        watchOptions: {
            delay: number,
            fileTypes: string[],
            refreshCount: number
        }

        debugOptions: {
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

        tempData: { [index: string]: any }

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
            one: {from: 1, to: 7.5, scale: 3, unit: "vmin"},
        },

        debugOptions: {
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
        let classNames: string[] = []
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
                    .filter((m: any) => m.type == "rule").map((m: any) => m.selectors).flat()
                    .filter((m: any) => m.startsWith(".")).map((m: any) => m.slice(1))
            }
            return undefined
        } catch (e) {
            return undefined
        }
    }

    export const parseComponentClassNames = (pageInfo: PageInfo, componentsPages: string[], config: wx.WxRunningConfig): string[] => {

        if (config.debugOptions.showPageTaskBegin) {
            log(`[task] process component page ${page}`)
        }
        let jsFileName = ""
        if (pageInfo.tsPath) {
            jsFileName = pageInfo.page.replace(config.fileExtension.page, config.fileExtension.ts)
        } else if (pageInfo.jsPath) {
            jsFileName = pageInfo.page.replace(config.fileExtension.page, config.fileExtension.js)
        }
        if (!jsFileName) {
            return []
        }

        const pageContent: string = Deno.readTextFileSync(jsFileName)

        if (!config.cssOption.componentGlobalCss.test(pageContent)) {
            if (config.debugOptions.showPageTaskResult) {
                log(`[data] ignore ${page} without global class option`)
            }
            return []
        }

        const classNames: string[] = parseClassItemFromPage(pageInfo.page, config)
        if (config.debugOptions.showPageClassNames) {
            log(`[data] found ${classNames.length} class names in ${page}`)
        }

        let styleNames: string[] = []
        if (pageInfo.cssPath) {
            const cssPage = pageInfo.page.replace(config.fileExtension.page, config.fileExtension.css)

            styleNames = readClassNamesFromCssFile(cssPage) || []
            if (config.debugOptions.showCssStyleNames) {
                log(`[data] found ${styleNames.length} styles names in ${page}`)
            }
        }

        const toCreateClassNames = classNames.diff(styleNames)
        if (config.debugOptions.showPageTaskResult) {
            log(`[data] add create styles task, [${toCreateClassNames.length}] class names, [${toCreateClassNames.join(",")}] from ${page}`)
        }
        return toCreateClassNames
    }

    export const parseComponentPages = async (config: wx.WxRunningConfig): PageInfo[] => {
        // read all components files
        const componentsStack: string[] = [`${config.workDir}/${config.componentDir}`]
        const componentsPages: string[] = []

        while (componentsStack.length > 0) {
            const curDir = componentsStack.shift()
            for await (const dirEntry of Deno.readDir(curDir)) {
                if (dirEntry.isDirectory) {
                    componentsStack.unshift(`${curDir}/${dirEntry.name}`)
                } else if (dirEntry.isFile) {
                    componentsPages.push(`${curDir}/${dirEntry.name}`)
                }
            }
        }

        return componentsPages.filter((page: string) => page.endsWith(config.fileExtension.page))
            .map((page: string): PageInfo => {
                return {
                    page,
                    jsPath: componentsPages.indexOf(page.replace(config.fileExtension.page, config.fileExtension.js)) > -1,
                    tsPath: componentsPages.indexOf(page.replace(config.fileExtension.page, config.fileExtension.ts)) > -1,
                    cssPath: componentsPages.indexOf(page.replace(config.fileExtension.page, config.fileExtension.css)) > -1,
                }
            })
    }

    export const parseMiniProgramPages = async (config: WxRunningConfig): string[] => {
        const pages = await Deno.readTextFile(`${config.workDir}/${config.appConfigFile}`)
            .then((data: string) => JSON.parse(data))
            .then((app: any) => [...app.pages, ...(app.subpackages || []).map((pkg: any) => pkg.pages.map((page: string) => `${pkg.root}/${page}`)).flat()])
        log(`[task] read wechat mini program pages from config file, found [${pages.length}] pages`)
        return pages.map((page: string) => `${config.workDir}/${page}.wxml`)
    }

    export const parseGlobalStyleNames = async (config: wx.WxRunningConfig): string[] => {
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

    export const parsePageClassNames = async (config: WxRunningConfig, pagePath: string): string[] => {

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
        return missingStyleNames
    }

    export const parseCssOutputFileStyleNames = (config: WxRunningConfig): string[] => {
        //if (config.watchOptions.refreshCount++ == 0) {
        return []
        //}
        // const cssOutputFileName = `${config.workDir}/${config.cssOutputFile}`
        // let styleNames: string[] = (readClassNamesFromCssFile(cssOutputFileName) || []).compact().unique()
        // log(`[task] parse style names from [${cssOutputFileName}]`)
        // return styleNames
    }


    export const setMiniProgramOptions = async (customConfig?: WxRunningConfig = {}): WxRunningConfig => {
        const config: WxRunningConfig = Object.assign({}, DefaultConfig, customConfig)
        return Promise.resolve(config)
    }


    export const ensureWorkDir = async (config: WxRunningConfig): WxRunningConfig => {

        let workDir = Deno.args.length > 0 ? Deno.args[0] : "."
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


    export const watchMiniProgramPageChange = async (config: WxRunningConfig, refreshEvent: (config: WxRunningConfig) => Promise<number>): WxRunningConfig => {

        let watcher = Deno.watchFs(config.workDir);
        let refreshCount: number = 0
        let refreshWorking: boolean = false

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

                util.sleep(config.watchOptions.delay)
                    .then(() => refreshEvent(config))
                    .then(() => {
                        refreshWorking = false
                        log(`[task] wxmp-atomic-css refresh ${++refreshCount}x`)
                    })
            }
        }
    }

    export const getRuleSetting = (config: wx.WxRunningConfig): style.StyleRuleSetting => {
        if (config.tempData["ruleSetting"]) {
            return config.tempData["ruleSetting"] as style.StyleRuleSetting
        }
        const ruleSetting = style.initRuleSetting(rule.DefaultStyles, Object.keys(theme.Themes));
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


    export const save = (classResultList: style.StyleInfo[], config: wx.WxRunningConfig): number => {
        const styles = classResultList.map((m: any) => m.styles).flat()

        const warnings = classResultList.map((m: any) => m.warnings).flat().compact().unique().sort()
        if (warnings.length > 0 && styles.length == 0) {
            log(`[data] no updates with warnings`)
            return Promise.resolve(2)
        }

        const units = classResultList.map((m: any) => m.units).flat().compact().unique().sort()
        log(`[data] new task to create [${units.length}] unit vars, [${units.join(",")}]`)

        const colors = classResultList.map((m: any) => m.colors).flat().compact().unique().sort()
        log(`[data] new task to create [${colors.length}] color vars, [${colors.join(",")}]`)

        log(`[task] begin to write output file`)

        const varsContent = style.generateVars(units, colors, config.cssOption.rootElementName, config.cssOption.one)
        if (config.debugOptions.showFileContent) {
            log(`[data] varsContent=${varsContent}`)
        }
        Deno.writeTextFileSync(`${config.workDir}/${config.cssVarFile}`, varsContent)
        log(`[task] save ${varsContent.length} chars to ${config.cssVarFile}`)

        const styleContent = classResultList.map((m: any) => m.styles).flat().join("\n")
        if (config.debugOptions.showFileContent) {
            log(`[data] styleContent=${styleContent}`)
        }
        Deno.writeTextFileSync(`${config.workDir}/${config.cssOutputFile}`, styleContent)
        log(`[task] save ${styleContent.length} chars to ${config.cssOutputFile}`)

        return Promise.resolve(0)
    }

}


const mainProcess = (config: wx.WxRunningConfig): Promise<number> => {
    let time = util.timing()
    return Promise.all([
        wx.parseGlobalStyleNames(config),
        wx.parseCssOutputFileStyleNames(config),
        wx.parseMiniProgramPages(config).then((pages: string[]): Promise<string[]> =>
            util.promiseLimit("parse-page-class-names", pages.length,
                config.processOption.promiseLimit, config.debugOptions.showTaskStep,
                (taskIndex: number) => {
                    return wx.parsePageClassNames(config, pages[taskIndex])
                }).then((classNames: string[]) => classNames.flat().compact().unique())
        ),
        wx.parseComponentPages(config).then((componentPages: wx.PageInfo[]): Promise<string[]> =>
            util.promiseLimit("parse-component-class-names", componentPages.length,
                config.processOption.promiseLimit, config.debugOptions.showTaskStep,
                (taskIndex: number) => {
                    return wx.parseComponentClassNames(componentPages[taskIndex], componentPages, config)
                }).then((classNames: string[]) => classNames.flat().compact().unique())
        ),
    ])
        .then((values: Awaited<string[]>[]) => wx.mergeTargetClassNames(values))
        .then((missingClassNames: string[]) => style.generateStyleContents(missingClassNames, wx.getRuleSetting(config), config.debugOptions.showStyleTaskResult))
        .then((classResultList: style.StyleInfo[]): number => wx.save(classResultList, config))
        .then((result: number) => log(`[data] job done, cost ${time.es()} ms, result = ${result}`))
}


(function () {

    log("==========================================================");
    log("   wxmp-atomic-css: wechat mini program atomic css kit");
    log("==========================================================");
    log("starting wxmp-atomic-css");

    const sigIntHandler = () => {
        console.log("wxmp-atomic-css service closed");
        Deno.exit();
    };
    Deno.addSignalListener("SIGINT", sigIntHandler);

    wx.setMiniProgramOptions()
        .then((config: wx.WxRunningConfig) => wx.ensureWorkDir(config))
        .then((config: wx.WxRunningConfig) => {
            if(config.debugOptions.printConfigInfo) {
                log("[data] config: ", config)
            }

            log("[task] start auto generation after started");

            mainProcess(config)
                .then(() => log("service ready, Press Ctrl-C to exit"))
                .then(() => wx.watchMiniProgramPageChange(config, mainProcess))

        }).catch((e: any) => log(`error: ${e}`))
})()


