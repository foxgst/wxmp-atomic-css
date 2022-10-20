import {Themes} from "./data.theme.ts";
import {log} from "./util.common.ts";


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
            } else if (Themes[para.color].length == 1) {
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


export const makeCssForExpr = (expression: string, ruleSetting: StyleRuleSetting): StyleInfo => {
    const rules = searchRulesByExpr(expression, ruleSetting)
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

        const para: ExprPara | undefined = extraPara(classRule.classExpr, classRule.rule)
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
                const newRules = searchRulesByExpr(newClassExpr, ruleSetting)
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
        const numberValue: number = Number(unit)
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
    if (!Themes[themeName]) {
        throw Error(`missing theme ${themeName}`)
    }
    const colors = Themes[themeName] as string[]
    if (colors.length == 0) {
        throw Error(`theme ${themeName} is empty`)
    }
    if (!colorOrder) {
        return `rgb(${colors[0]})`
    }

    const orderValue = parseInt(colorOrder) - 1
    if (orderValue >= 0 && orderValue <= colors.length - 1) {
        if (alpha == undefined || alpha == "1") {
            return `rgb(${colors[orderValue]})`
        } else {
            return `rgba(${colors[orderValue]}, 0.${alpha})`
        }
    }

    throw Error(`invalid color value ${themeName}-${colorOrder}-${alpha}`)
}


export const generateStyleContents = (missingClassNames: string[], ruleSetting: StyleRuleSetting, showStyleTaskResult: boolean): StyleInfo[] => {
    return missingClassNames.map((classExpr: string): StyleInfo => {
        const {units, colors, styles, warnings, classNames} = makeCssForExpr(classExpr, ruleSetting)

        if (showStyleTaskResult) {
            const order = "".padStart(12, " ")
            const unitString = units.length == 0 ? "" : `units = ${units.join(",")}`
            const colorString = colors.length == 0 ? "" : `colors = ${colors.join(",")}`
            const warningString = warnings.length == 0 ? "" : `warnings = ${warnings.join(",")}`
            const classNameString = classNames.length == 0 ? "" : `classNames = ${classNames.join(",")}`
            log(`[task] ${order}`, classExpr.padEnd(20, " "), unitString, colorString, warningString, classNameString)
        }

        return {units, colors, styles, warnings, classNames}
    })
}
