import {arrayMap, readDataFile} from "./util.ts";

/**
 * atomic style rule
 */
export interface AtomicStyleRule {
    /**
     * package name to manage rules
     */
    package: string
    /**
     * describe the rule, if syntax is not normal
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

/**
 * read rules from remote or local file
 * @param filePath
 */
const readRules = (filePath: string): Promise<AtomicStyleRule[]> => readDataFile<AtomicStyleRule[]>(filePath)


export interface StyleRuleSetting {
    ruleMap: { [index: string]: AtomicStyleRule, }
    rules: AtomicStyleRule[]
}

/**
 * read rules from file and init as map
 * @param filePath rule file path
 */
export const readAndInitRuleSetting = async (filePath: string): Promise<StyleRuleSetting> => {
    const rules: AtomicStyleRule[] = await readRules(filePath)
    const ruleMap: { [index: string]: AtomicStyleRule } = {}
    rules.forEach((rule: AtomicStyleRule) => {

        // auto extract dependent units and colors
        if (rule.expr) {
            if (rule.expr.includes("--unit")) {
                const units = rule.expr.match(/--unit-([0-9dp]+)/g)
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

        // detect if syntax includes dynamic rule keyword
        if (rule.syntax.includes("[")) {

            // get pure rule name without placeholder chars
            const ruleMapName = rule.syntax.replace(/[CUNA]/g, "")

            // generate regex for placeholder
            const regexExpr = rule.syntax
                .replace("[U]", "(?<U>[0-9|d|p]+)")
                .replace("[C]", "(?<C>[a-z]+)")
                .replace("[N]", "(?<N>[0-9]+)")
                .replace("[A]", "(?<A>[0-9]+)")
            rule.syntaxRegex = new RegExp("^" + regexExpr + "$")

            ruleMap[ruleMapName] = rule
        } else {
            ruleMap[rule.syntax] = rule
        }
    })
    return {ruleMap, rules}
}

/**
 * toString() of Rules
 */
export const rulesToString = (rules: AtomicStyleRule[]): string => {
    const rulesMap = arrayMap(rules, m => m.package)
    return `total ${rulesMap.keys.length} package and ${rules.length} rules\n`
        + "------------------ rules begin ------------------\n"
        + rulesMap.keys.map((pkg, index) => `${(index + 1).toString().padStart(2, " ")})`
            + ` package = ${pkg}, syntax = [${rulesMap.map[pkg].map(m => m.syntax).join(",")}]`).join("\n")
        + "\n------------------ rules end ------------------"
}