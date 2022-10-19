import "https://deno.land/x/arrays/mod.ts";
import "https://deno.land/std/fs/mod.ts";
import {htmltok, TokenType} from 'https://deno.land/x/htmltok@v0.0.3/mod.ts';
import * as css from "https://deno.land/x/css@0.3.0/mod.ts";
import {theme} from "./theme.ts";
import {rule} from "./rule.ts"

const log = (...args: any[]) => {
    const now = new Date()
    const at = `${now.getFullYear()}-${now.getMonth()}-${now.getDate() + 1} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`
    console.log(at.padEnd(22, " "), ...args)
}


export namespace style {

    /**
     * 表示数值，有些值不能整除，使用 from/to/scale 进行描述
     */
    interface ValueRange {
        from: number
        to: number
        scale: number
        unit: string
    }

    /**
     * CSS 基础配置
     */
    interface CssConfig {
        /**
         * 默认值
         */
        default: { [index: string]: string; }
        /**
         * 根元素，用于声明变量
         */
        root: { [index: string]: string; },
        /**
         * 单位一的表示
         */
        one: ValueRange
        /**
         * 主题设置
         */
        theme: { [index: string]: string[]; }
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
         * 类名语法规则，允许使用[U]-数值,[C]-颜色,[N]-数
         */
        syntax: string
        /**
         * 如果由其他规则组合而成，填写其他规则的 syntax
         */
        compose?: string[]
        /**
         * 如果是直接表示规则，填写具体到样式信息
         */
        expr?: string,
        /**
         * 如果规则涉及到数值，填写数值
         */
        units?: string[],
        /**
         * 如果规则涉及到颜色，填写数值
         */
        colors?: string[],
        /**
         * 动态规则的匹配表达式
         */
        syntaxRegex?: RegExp
    }


    interface ExprPara {
        unit?: string
        number?: string
        color?: string
        alpha?: string
    }

    interface StyleRuleSetting {
        ruleMap: { [index: string]: AtomicStyleRule, }
        // ruleNames: string[]
        rules: AtomicStyleRule[]
        themes: string[]
    }

    const DefaultConfig: CssConfig = {
        default: {
            "unit": "full,d5,1,2,4,8,10,20,24,28,32,36,48,64,72,80,96,120,144,256,512",
            "theme": Object.keys(theme.Themes).join(",")
        },
        root: {
            "wx+xcx": "page"
        },
        one: {from: 1, to: 7.5, scale: 3, unit: "vmin"},
        theme: theme.Themes
    }


    export const generateCssContent = (browser: string, classExprs: string[], config: CssConfig = DefaultConfig): { varContent: string, styleContent: string, warnings: string[] } => {
        try {
            const styleList: string[] = [];

            let unitList: string[] = []
            let colorList: string[] = []

            const ruleSetting = initRuleSetting(rule.DefaultStyles, Object.keys(DefaultConfig.theme));
            log(`[task] read ${ruleSetting.rules.length} rules`)
            log(`[task] try to generate [${classExprs.length}] styles`)

            const warnings: string[] = []
            classExprs.sort().forEach((classExpr: string, index: number) => {
                const {units, colors, styles} = makeCssForExpr(classExpr, ruleSetting, warnings)

                const order = `${index + 1}/${classExprs.length}`.padStart(8, " ")
                const unitString = units.length == 0 ? "" : `units = ${units.join(",")}`
                const colorString = colors.length == 0 ? "" : `colors = ${colors.join(",")}`
                log(`[task] ${order}`, classExpr.padEnd(20, " "), unitString, colorString)

                unitList.push(...units)
                colorList.push(...colors)
                styleList.push(...styles)
            })
            unitList = unitList.compact().unique().sort()
            log(`[task] found total [${unitList.length}] units [${unitList.join(",")}]`)
            colorList = colorList.compact().unique().sort()
            const vars = generateVars(browser, unitList, colorList, config)

            if (warnings.length == classExprs.length) {
                return {varContent: "", styleContent: "", warnings}
            }

            return {varContent: vars, styleContent: styleList.join("\n"), warnings}
        } catch (e) {
            console.error(e)
            return {varContent: "", styleContent: `${e}`, warnings: [e.toString()]}
        }
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
                    para.number = 1
                } else if (theme.Themes[para.color].length == 1) {
                    para.alpha = para.number
                    para.number = 1
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
        let rule = ruleSetting.ruleMap[expression]
        if (rule) {
            return [rule]
        }
        return ruleSetting.rules.filter((rule: AtomicStyleRule) => {
            return rule.syntaxRegex?.test(expression)
        })
    }


    const makeCssForExpr = (expression: string, ruleSetting: StyleRuleSetting, warnings: string[]): { units: string[], colors: string[], styles: string[] } => {
        let rules = searchRulesByExpr(expression, ruleSetting)
        if (rules == undefined || rules.length == 0) {
            warnings.push(expression)
            return {units: [], colors: [], styles: []}
        }

        const classRuleStack = rules.map((rule: AtomicStyleRule) => {
            return {classExpr: expression, rule}
        })

        const styles: string[] = []
        const units: string[] = []
        const colors: string[] = []

        while (classRuleStack.length > 0) {
            const classRule = classRuleStack.shift()
            if (!classRule) {
                break
            }

            const para: ExprPara = extraPara(classRule.classExpr, classRule.rule)
            // if (para?.color) {
            //     console.log("colors result", classRule.classExpr, para)
            // }
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
            if (classRule.rule.expr) {
                units.push(...(classRule.rule?.units || []))
                colors.push(...(classRule.rule?.colors || []))
                const style = wrapPara(classRule.rule.expr, para)
                styles.push(style)
            } else if (classRule.rule.compose) {
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
        }

        if (styles.length > 0) {
            styles.unshift(`.${expression}{`)
            styles.push("}")
        }

        return {units: units.compact().unique(), colors: colors.compact().unique(), styles}
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
    const initRuleSetting = (rules: AtomicStyleRule[], themes: string[]): StyleRuleSetting => {
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
     * @param plat 运行环境简称
     * @param units 全部数值
     * @param colors
     * @param config CSS基础配置
     */
    const generateVars = (plat: string, units: string[], colors: string[], config: CssConfig): string => {
        const root = config.root[plat]
        if (!root) {
            throw Error(`missing root for ${plat}`)
        }

        const clearFunctions = [
            {rule: /d/g, value: "0."},
            {rule: /p/g, value: "0.000"},
        ]
        const getUnitNumber = (v: string) => parseFloat(v.replace(clearFunctions[0].rule, clearFunctions[0].value)
            .replace(clearFunctions[1].rule, clearFunctions[1].value))
        units = units.sort((left: string, right: string) => getUnitNumber(left) - getUnitNumber(right))

        const vars: string[] = []
        vars.push(`${root} {`)
        units.forEach((unit: string) => {
            vars.push(`--unit-${unit}: ${calcUnitValue(unit, config)};`)
        })

        // vars.push("")
        // vars.push(`--color-primary: rgb(${theme.Colors.primary});`)
        // vars.push(`--color-white: rgb(${theme.Colors.white});`)
        // vars.push(`--color-black: rgb(${theme.Colors.black});`)
        // vars.push("")

        colors.forEach((color: string) => {
            // color = color.replace("primary", "primary-1")
            //     .replace("white", "white-1")
            //     .replace("black", "black-1")
            const colorInfo = color.match(/(?<theme>[a-z]+)-(?<order>\d+)(-(?<alpha>\d+))?/)?.groups
            if (!colorInfo) {
                throw Error(`invalid color ${color}`)
            }

            const {theme, order, alpha} = colorInfo
            vars.push(`--color-${color}: ${generateColorVar(theme, order, alpha, config)};`)
        })


        vars.push("}")
        return vars.join("\n")
    }

    /**
     * calc unit value
     * @param unit unit number value or percent value
     * @param config unit one's config
     */
    const calcUnitValue = (unit: string, config: CssConfig): string => {
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
            const scale = Math.pow(10, config.one.scale)
            return Math.round(numberValue * config.one.from * scale / config.one.to) / scale + config.one.unit
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
     * @param config CSS基础配置
     */
    const generateColorVar = (themeName: string, colorOrder: string, alpha: string, config: CssConfig): string => {
        if (themeName == "") {
            throw Error("missing theme name")
        }
        if (!config.theme[themeName]) {
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


}

namespace wx {

    export interface FileConfig {
        miniProgramDir: string
        componentDir: string
        appConfigFile: string
        cssMainFile: string
        cssVarFile: string
        cssOutputFile: string
        cssInputFiles: string[]
    }

    const Config: FileConfig = {
        miniProgramDir: "miniprogram",
        componentDir: "components",
        appConfigFile: "app.json",
        cssMainFile: "app.wxss",
        cssVarFile: "var.wxss",
        cssOutputFile: "mini.wxss",
        cssInputFiles: ["font.wxss"]
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

    const parseClassItemFromPage = (page: string): string[] => {
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
                log(`[check]${"".padEnd(9, " ")}parse class attribute [${token.getValue()}] to [${items.join(",")}]`)
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

    const parseComponentClassNames =  (page: string, componentsPages: string[], config: wx.FileConfig): string[] => {
        if (page.endsWith(".wxml")) {
            log(`[check] process component page ${page}`)
            let jsFileName = ""
            const tsPage = page.replace(".wxml", ".ts")
            if (componentsPages.indexOf(tsPage) == -1) {
                const jsPage = page.replace(".wxml", ".js")
                if (componentsPages.indexOf(jsPage) == -1) {
                    return
                }
                jsFileName = jsPage
            } else {
                jsFileName = tsPage
            }

            const pageContent: string =  Deno.readTextFileSync(jsFileName)

            if (/addGlobalClass:\s*true/.test(pageContent)) {
                log(`[check]    detect global class`)
                const cssPage = page.replace(".wxml", ".wxss")
                if (componentsPages.indexOf(cssPage) > -1) {
                    const classNames: string[] = parseClassItemFromPage(page)
                    const styleNames: string[] = readClassNamesFromCssFile(cssPage) || []
                    const toCreateClassNames = classNames.diff(styleNames)

                    log("[check]    find xxx", toCreateClassNames)
                    return toCreateClassNames
                }
            }
        }
        return []
    }

    const parseComponentGlobalClassNames = async (workDir: string, config: wx.FileConfig): string[] => {
        // read all components files
        const componentsDirs: string[] = [`${workDir}/${config.componentDir}`]
        const componentsPages: string[] = []

        while (componentsDirs.length > 0) {
            const curDir = componentsDirs.shift()
            for await (const dirEntry of Deno.readDir(curDir)) {
                if (dirEntry.isDirectory) {
                    componentsDirs.unshift(`${curDir}/${dirEntry.name}`)
                } else if (dirEntry.isFile) {
                    componentsPages.push(`${curDir}/${dirEntry.name}`)
                }
            }
        }
        console.log("componentsPages", componentsPages)

        let classNames: string[] = componentsPages.map((page: string) => parseComponentClassNames(page, componentsPages, config))
        classNames = classNames.flat().compact().unique()

        console.log("classNames", classNames)
        return classNames
    }

    export const generateCssFile = async (workDir: string, generateCount: number = false, config: FileConfig = Config, engine: (browserName: string, classItems: string[]) => string = style.generateCssContent): number => {

        const pages = await Deno.readTextFile(`${workDir}/${config.appConfigFile}`)
            .then((data: string) => JSON.parse(data))
            .then((app: any) => [...app.pages, ...(app.subpackages || []).map((pkg: any) => pkg.pages.map((page: string) => `${pkg.root}/${page}`)).flat()])
        log(`[check] read wechat mini program pages from config file, found [${pages.length}] pages`)

        const globalClassStyleNames: string[] = await [...config.cssInputFiles, config.cssMainFile].map((filename: string) => {
            const result = readClassNamesFromCssFile(`${workDir}/${filename}`)
            if (result == undefined) {
                log(`[check] missing global css file [${filename}] and ignore`)
            } else {
                log(`[check] read global styles names, found [${result.length}] in [${filename}]`)
            }
            return result
        }).flat().compact().unique()
        log(`[check] found total [${globalClassStyleNames.length}] global class styles`)

        let componentClassNames: string[] = await parseComponentGlobalClassNames(workDir, config)
        log(`[check] components found [${componentClassNames.length}] class names [${componentClassNames.join(",")}]`)

        let missingClassNames: string[] = [...componentClassNames]
        pages.forEach((page: string, index: number) => {
            const order = `${index + 1}/${pages.length})`.padStart(7, ' ')
            const pageEmpty = "".padEnd(9, " ")

            log(`[check] ${order} process page [${page}]`)

            const classNames: string[] = parseClassItemFromPage(`${workDir}/${page}.wxml`)
            log(`[check]${pageEmpty}found page class names [${classNames.length}] [${classNames.join(",")}]`)

            const styleNames = readClassNamesFromCssFile(`${workDir}/${page}.wxss`)
            if (styleNames == undefined) {
                log(`[check]${pageEmpty}missing page class file [${page}.wxss] and ignore`)
            } else {
                log(`[check]${pageEmpty}found page style names [${styleNames.length}] [${styleNames.join(",")}]`)
            }

            const missingStyleNames = classNames.diff(styleNames).diff(globalClassStyleNames)
            if (missingStyleNames.length == 0) {
                log(`[check]${pageEmpty}no styles to create`)
            } else {
                log(`[check]${pageEmpty}need to create [${missingStyleNames.length}] styles [${missingStyleNames.join(",")}]`)
                missingClassNames.push(...missingStyleNames)
            }
        })

        const cssOutputFileName = `${workDir}\\${config.cssOutputFile}`

        missingClassNames = missingClassNames.unique()
        if (missingClassNames.length == 0) {
            log(`[check] no global styles to create`)
            return Promise.resolve(1)
        }

        log(`[check] total to create [${missingClassNames.length}] global styles`)


        let generatedClasItems: string[] = []
        if (generateCount > 0) {
            generatedClasItems = (readClassNamesFromCssFile(cssOutputFileName) || []).compact().unique()
            log(`[check] found [${generatedClasItems.length}] style items in [${config.cssOutputFile}]`)
        } else {
            log(`[check] skip style names in [${config.cssOutputFile}]`)
        }

        const newClassNames = missingClassNames.diff(generatedClasItems)
        if (newClassNames.length == 0) {
            log(`[check] no class items to create`)
            return Promise.resolve(2)
        }

        log(`[task] create [${newClassNames.length}] class items [${newClassNames.join(",")}]`)

        if (generateCount > 0) {
            let {content, warnings} = engine("wx+xcx", newClassNames)
            if (warnings.length == newClassNames.length) {
                log(`[task] no updates with warnings`)
                return Promise.resolve(4)
            }
        }
        let {varContent, styleContent, warnings} = engine("wx+xcx", missingClassNames)

        if (warnings.length > 0) {
            log(`[warning] total found ${warnings.length} class names without rules, ${warnings.join(",")}`)
        }
        if (styleContent.length == 0) {
            log(`[task] no updates`)
            return Promise.resolve(3)
        }
        if (warnings.length == newClassNames.length) {
            log(`[task] no updates with warnings`)
            return Promise.resolve(4)
        }

        log(`[task] begin to write output file`)
        Deno.writeTextFileSync(config.cssVarFile, varContent)
        log(`[task] save ${varContent.length} chars to ${config.cssVarFile}`)
        Deno.writeTextFileSync(cssOutputFileName, styleContent)
        log(`[task] save ${styleContent.length} chars to ${cssOutputFileName}`)
        return Promise.resolve(0)
    }


    export const getWorkDir = async (): string => {

        let workDir = Deno.args.length > 0 ? Deno.args[0] : "."
        for await (const dirEntry of Deno.readDir(workDir)) {
            if (dirEntry.name == Config.miniProgramDir) {
                log(`working directory found for ${Config.miniProgramDir} at ${workDir}`)
                return Promise.resolve(`${workDir}\\${Config.miniProgramDir}`)
            }
            if (dirEntry.name == Config.cssMainFile) {
                log(`working directory found for ${Config.cssMainFile} at ${workDir}`)
                return Promise.resolve(workDir)
            }
        }

        log(`invalid working directory, can not found ${Config.cssMainFile} or ${Config.miniProgramDir} directory`)
        return Promise.reject("should set working directory to wechat mini program dir")
    }
}

/**
 * 延时函数
 * @param delay 延时毫秒数
 */
const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

const main = async (workDir: string) => {
    let count = 0

    wx.generateCssFile(workDir, count++)
    log("[task] wxmp-atomic-css service started")

    let watcher = Deno.watchFs(workDir);

    let working: boolean = false

    for await (const event of watcher) {
        log(">>>> event", event);

        if (working) {
            continue
        }

        if (event.paths.filter((m: string) => m.endsWith(".wxml")).length > 0) {

            if (!working) {
                working = true
                // watcher.close()

                sleep(200).then(() => {
                    return wx.generateCssFile(workDir, 1)
                }).then((result: number) => {
                    // sleep(200).then(() => {
                    //     watcher = Deno.watchFs(workDir);
                    // })
                    working = false
                    log(`[task] wxmp-atomic-css refresh ${count++}x, result=${result}`)
                })
            }
            // log(">>>> event", event);

            // await wx.generateCssFile(workDir, 0)
        }
    }
}

wx.getWorkDir().then(main)