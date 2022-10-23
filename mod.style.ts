import {log} from "./util.ts";
import {AtomicStyleRule, StyleRuleSetting} from "./data.rule.ts";
import {CssOption, StyleInfo, UnitValueDeclaration} from "./data.config.ts";
import {ThemeMap} from "./data.theme.ts";

/**
 * parameters used a property value
 */
export interface PropertyValueParameter {
    /**
     * unit number or expression, placeholder is [U]
     * support three formats
     * first, only integer, [N], 0<=N
     * e.g. 1=1, 2=1
     * second, decimal value, d[N], 0<=N
     * e.g. d5=0.5, d05=0.05, d50=0.50, d005=0.005
     * third, percent value, p[N], 0<=N<=100
     * e.g. p100=100%, p50=50%
     */
    unit?: string
    /**
     * integer used in expression, placeholder is [N]
     * always means order, such as color sequence order
     */
    number?: string
    /**
     * color name, placeholder is [C]
     * value in Themes(see @theme.Themes) is valid
     */
    color?: string
    /**
     * the decimal part of color alpha value, placeholder is [A] with prefix "a"
     * only support integer
     * e.g. a5 mean 0.5, a05 means 0.05
     */
    alpha?: string
}

const extraPara = (expression: string, rule: AtomicStyleRule | undefined): PropertyValueParameter | undefined => {
    if (rule == undefined || rule.syntaxRegex == undefined) {
        return undefined
    }
    const para: PropertyValueParameter = {
        unit: undefined,
        number: undefined,
        color: undefined,
        alpha: undefined
    }
    const matchResult = expression.match(rule.syntaxRegex)
    if (matchResult && matchResult.groups) {
        para.unit = matchResult.groups["U"]
        para.color = matchResult.groups["C"]
        para.number = matchResult.groups["N"]
        para.alpha = matchResult.groups["A"]
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


export const makeCssForExpr = (expression: string, ruleSetting: StyleRuleSetting, cssOption: CssOption): StyleInfo => {
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

        const para: PropertyValueParameter | undefined = extraPara(classRule.classExpr, classRule.rule)
        if (para != undefined) {
            if (para.unit) {
                units.push(para.unit)
            }
            if (para.color) {
                if (para.alpha == undefined) {
                    if (para.number) {
                        colors.push(`${para.color}-${para.number}`)
                    } else {
                        colors.push(`${para.color}`)
                    }
                } else {
                    if (para.number) {
                        colors.push(`${para.color}-${para.number}-${para.alpha}`)
                    } else {
                        colors.push(`${para.color}-${para.alpha}`)
                    }
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
            styles.push(`${cssOption.minify ? "" : "    "}${style}${cssOption.minify ? "" : "\n"}`)
        }
        if (classRule.rule.dependencies) {
            classNames.push(...classRule.rule.dependencies)
        }
    }

    if (styles.length > 0) {
        styles.unshift(`.${expression}${cssOption.minify ? "" : " "}{${cssOption.minify ? "" : "\n"}`)
        styles.push(`}${cssOption.minify ? "" : "\n"}`)
    }

    return {units: units.compact().unique(), colors: colors.compact().unique(), styles, warnings: [], classNames}
}

const wrapPara = (expression: string, para?: PropertyValueParameter | undefined): string => {
    if (expression == "" || para == undefined) {
        return expression || ""
    }
    if (para.unit != undefined) {
        expression = expression.replace(/\[U]/g, para.unit)
    }
    if (para.number != undefined) {
        expression = expression.replace(/\[N]/g, para.number)
    }
    if (para.color != undefined) {
        expression = expression.replace(/\[C]/g, para.color)
    }
    if (para.alpha != undefined) {
        expression = expression.replace(/\[A]/g, para.alpha)
    }
    return expression
}


/**
 * generate unit and color variables
 * @param units all units
 * @param colors all colors
 * @param cssOption css option
 * @param themeMap the theme map
 */
export const generateVars = (units: string[], colors: string[], cssOption: CssOption, themeMap: ThemeMap): string => {

    const clearFunctions = [
        {rule: /d/g, value: "0."},
        {rule: /p/g, value: "0.000"},
    ]
    const getUnitNumber = (v: string) => parseFloat(v.replace(clearFunctions[0].rule, clearFunctions[0].value)
        .replace(clearFunctions[1].rule, clearFunctions[1].value))
    units = units.sort((left: string, right: string) => getUnitNumber(left) - getUnitNumber(right))

    const vars: string[] = []
    vars.push(`${cssOption.rootElementName}${cssOption.minify ? "" : " "}{`)
    units.forEach((unit: string) => {
        vars.push(`${cssOption.minify ? "" : cssOption.styleIndent}--${cssOption.varPrefix}unit-${unit}:${cssOption.minify ? "" : " "}${calcUnitValue(unit, cssOption.one)};`)
    })

    colors.forEach((color: string) => {
        const colorInfo = color.match(/(?<theme>[a-z]+)(-(?<order>\d+))?(-(?<alpha>\d+))?/)?.groups
        if (!colorInfo) {
            throw Error(`invalid color ${color}`)
        }

        const {theme, order, alpha} = colorInfo
        vars.push(`${cssOption.minify ? "" : cssOption.styleIndent}--${cssOption.varPrefix}color-${color}:${cssOption.minify ? "" : " "}${generateColorVar(cssOption.palette, theme, order, alpha, themeMap)};`)
    })


    vars.push("}")
    return vars.join(cssOption.minify ? "" : "\n")
}

/**
 * calc unit value
 * @param unit unit number value or percent value
 * @param one unit one's config
 */
const calcUnitValue = (unit: string, one: UnitValueDeclaration): string => {
    // zero means nothing without rpx or vm etc.
    if (unit == "0") {
        return "0"
    }

    // transform decimal value, "d" means "0.", "d5" means "0.5"
    unit = unit.replace("d", "0.")

    // number value
    if (/^([\d\\.]+)$/.test(unit)) {
        const numberValue = Number(unit)
        const scale = Math.pow(10, one.precision)
        return Math.round(numberValue * one.from * scale / one.to) / scale + one.unit
    }

    // percent value
    if (/^p(\d+)$/.test(unit)) {
        return unit.replace(/^p(\d+)$/, "$1%")
    }

    throw Error(`invalid unit value: ${unit}`)
}

/**
 * generate color variables
 * @param palette color palette name
 * @param themeName theme name
 * @param colorOrder color order
 * @param alpha alpha value
 * @param themeMap the theme map
 */
const generateColorVar = (palette: string, themeName: string, colorOrder: string, alpha: string, themeMap: ThemeMap): string => {
    if (themeName == "") {
        throw Error("missing theme name")
    }

    if (themeMap[themeName]) {
        alpha = colorOrder
        if (alpha == undefined || alpha == "1") {
            return `${themeMap[themeName]}`
        } else {
            return `${appendAlpha(themeMap[themeName], alpha)}`
        }
    }
    if (!themeMap.palette[palette]) {
        throw Error(`missing palette ${palette}`)
    }
    if (!themeMap.palette[palette][themeName]) {
        throw Error(`missing theme ${themeName}`)
    }
    const colors = themeMap.palette[palette][themeName]
    if (colors.length == 0) {
        throw Error(`palette ${palette} theme ${themeName} is empty`)
    }
    if (!colorOrder) {
        return `${colors[0]}`
    }

    const orderValue = parseInt(colorOrder) - 1
    if (orderValue >= 0 && orderValue <= colors.length - 1) {
        if (alpha == undefined || alpha == "1") {
            return `${colors[orderValue]}`
        } else {
            return `${appendAlpha(colors[orderValue], alpha)}`
        }
    }

    throw Error(`invalid color value ${themeName}-${colorOrder}-${alpha}`)
}

const appendAlpha = (color: string, alpha: number) => `${color}${Math.round(alpha * 2.56).toString(16)}`


/**
 * generate style contents for class names
 * @param missingClassNames class names
 * @param ruleSetting rules
 * @param cssOption css option
 * @param showStyleTaskResult flag if show style task result
 */
export const generateStyleContents = (missingClassNames: string[], ruleSetting: StyleRuleSetting, cssOption: CssOption, showStyleTaskResult: boolean): StyleInfo[] => {
    return missingClassNames.map((classExpr: string): StyleInfo => {
        const {units, colors, styles, warnings, classNames} = makeCssForExpr(classExpr, ruleSetting, cssOption)

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