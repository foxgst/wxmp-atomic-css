import 'https://deno.land/x/arrays/mod.ts'
import {htmltok, TokenType} from 'https://deno.land/x/htmltok@v0.0.3/mod.ts';
import * as css from "https://deno.land/x/css@0.3.0/mod.ts";

const log = (...args: any[]) => {
    const now = new Date()
    const at = `${now.getFullYear()}-${now.getMonth()}-${now.getDate() + 1} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`
    console.log(at.padEnd(22, " "), ...args)
}

export namespace resource {

    export const primaryColor: string = "#1890ff"

    export const theme = {
        "gray":['#ffffff', '#fafafa', '#f5f5f5', '#f0f0f0', '#d9d9d9', '#bfbfbf', '#8c8c8c', '#595959', '#434343', '#262626', '#1f1f1f', '#141414', '#000000'],
        "red": ["#fff1f0", "#ffccc7", "#ffa39e", "#ff7875", "#ff4d4f", "#f5222d", "#cf1322", "#a8071a", "#820014", "#5c0011"],
        "orange": ["#fff7e6", "#ffe7ba", "#ffd591", "#ffc069", "#ffa940", "#fa8c16", "#d46b08", "#ad4e00", "#873800", "#612500"],
        "yellow": ["#feffe6", "#ffffb8", "#fffb8f", "#fff566", "#ffec3d", "#fadb14", "#d4b106", "#ad8b00", "#876800", "#614700"],
        "green": ["#f6ffed", "#d9f7be", "#b7eb8f", "#95de64", "#73d13d", "#52c41a", "#389e0d", "#237804", "#135200", "#092b00"],
        "blue": ["#e6f7ff", "#bae7ff", "#91d5ff", "#69c0ff", "#40a9ff", "#1890ff", "#096dd9", "#0050b3", "#003a8c", "#002766"],
        "purple": ["#f9f0ff", "#efdbff", "#d3adf7", "#b37feb", "#9254de", "#722ed1", "#531dab", "#391085", "#22075e", "#120338"],
        "magenta": ["#fff0f6", "#ffd6e7", "#ffadd2", "#ff85c0", "#f759ab", "#eb2f96", "#c41d7f", "#9e1068", "#780650", "#520339"],
        "cyan": ["#e6fffb", "#b5f5ec", "#87e8de", "#5cdbd3", "#36cfc9", "#13c2c2", "#08979c", "#006d75", "#00474f", "#002329"],
        "lime": ["#fcffe6", "#f4ffb8", "#eaff8f", "#d3f261", "#bae637", "#a0d911", "#7cb305", "#5b8c00", "#3f6600", "#254000"],
        "gold": ["#fffbe6", "#fff1b8", "#ffe58f", "#ffd666", "#ffc53d", "#faad14", "#d48806", "#ad6800", "#874d00", "#613400"],
        "volcano": ["#fff2e8", "#ffd8bf", "#ffbb96", "#ff9c6e", "#ff7a45", "#fa541c", "#d4380d", "#ad2102", "#871400", "#610b00"],
    }
    export const DefaultStyles = [
        {
            package: "spacing.padding.core",
            syntax: "safe-bottom",
            expr: "padding-bottom: env(safe-area-inset-bottom);"
        },
        {
            package: "spacing.padding.ext",
            syntax: "p-[U]",
            compose: ['pl-[U]', 'pr-[U]', 'pt-[U]', 'pb-[U]']
        },
        {
            package: "spacing.padding.ext",
            desc: "padding-x-axis",
            syntax: "px-[U]",
            compose: ['pl-[U]', 'pr-[U]']
        },
        {
            package: "spacing.padding.ext",
            desc: "padding-y-axis",
            syntax: "py-[U]",
            compose: ['pt-[U]', 'pb-[U]']
        },
        {
            package: "spacing.padding.ext",
            syntax: "pt-[U]",
            expr: "padding-top: var(--unit-[U]);"
        },
        {
            package: "spacing.padding.ext",
            syntax: "pb-[U]",
            expr: "padding-bottom: var(--unit-[U]);"
        },
        {
            package: "spacing.padding.ext",
            syntax: "pl-[U]",
            expr: "padding-left: var(--unit-[U]);"
        },
        {
            package: "spacing.padding.ext",
            syntax: "pr-[U]",
            expr: "padding-right: var(--unit-[U]);"
        },
        {
            package: "spacing.margin.ext",
            syntax: "m-[U]",
            compose: ['ml-[U]', 'mr-[U]', 'mt-[U]', 'mb-[U]']
        },
        {
            package: "spacing.margin.ext",
            desc: "margin-x-axis",
            syntax: "mx-[U]",
            compose: ['ml-[U]', 'mr-[U]']
        },
        {
            package: "spacing.margin.ext",
            desc: "margin-y-axis",
            syntax: "my-[U]",
            compose: ['mt-[U]', 'mb-[U]']
        },
        {
            package: "spacing.margin.ext",
            syntax: "mt-[U]",
            expr: "margin-top: var(--unit-[U]);"
        },
        {
            package: "spacing.margin.ext",
            syntax: "mb-[U]",
            expr: "margin-bottom: var(--unit-[U]);"
        },
        {
            package: "spacing.margin.ext",
            syntax: "ml-[U]",
            expr: "margin-left: var(--unit-[U]);"
        },
        {
            package: "spacing.margin.ext",
            syntax: "mr-[U]",
            expr: "margin-right: var(--unit-[U]);"
        },
        {
            package: "sizing.size.ext",
            syntax: "wh-screen",
            compose: ['w-full', 'h-full', 'pos-abs', 'top-0', 'bottom-0', 'left-0', 'right-0']
        },
        {
            package: "sizing.size.ext",
            syntax: "wh-[U]",
            compose: ['w-[U]', 'h-[U]']
        },
        {
            package: "sizing.width.ext",
            syntax: "w-[U]",
            expr: "width: var(--unit-[U]);"
        },
        {
            package: "sizing.width.ext",
            syntax: "mw-[U]",
            expr: "min-width: var(--unit-[U]);"
        },
        {
            package: "sizing.width.ext",
            syntax: "xw-[U]",
            expr: "max-width: var(--unit-[U]);"
        },
        {
            package: "sizing.height.ext",
            syntax: "h-[U]",
            expr: "height: var(--unit-[U]);"
        },
        {
            package: "sizing.height.ext",
            syntax: "mh-[U]",
            expr: "min-height: var(--unit-[U]);"
        },
        {
            package: "sizing.height.ext",
            syntax: "xh-[U]",
            expr: "max-height: var(--unit-[U]);"
        },
        {
            package: "size.gap.ext",
            syntax: "gap-[U]",
            expr: "grid-gap: var(--unit-[U]);"
        },
        {
            package: "layout.float.core",
            syntax: "pos-abs",
            expr: "position: absolute;"
        },
        {
            package: "layout.float.core",
            syntax: "pos-rel",
            expr: "position: relative;"
        },
        {
            package: "layout.float.core",
            syntax: "pos-fix",
            expr: "position: fixed;"
        },
        {
            package: "layout.float.core",
            syntax: "pos-sticky",
            expr: "position: sticky;"
        },
        {
            package: "layout.float.ext",
            desc: "top left corner",
            syntax: "pos-tl-[U]",
            compose: ['pos-abs', 'top-[U]', 'left-[U]']
        },
        {
            package: "layout.float.ext",
            desc: "top right corner",
            syntax: "pos-tr-[U]",
            compose: ['pos-abs', 'top-[U]', 'right-[U]']
        },
        {
            package: "layout.float.ext",
            desc: "bottom left corner",
            syntax: "pos-bl-[U]",
            compose: ['pos-abs', 'bottom-[U]', 'left-[U]']
        },
        {
            package: "layout.float.ext",
            desc: "bottom right corner",
            syntax: "pos-br-[U]",
            compose: ['pos-abs', 'bottom-[U]', 'right-[U]']
        },
        {
            package: "layout.float.ext",
            syntax: "top-[U]",
            expr: "top: var(--unit-[U]);"
        },
        {
            package: "layout.float.ext",
            syntax: "bottom-[U]",
            expr: "bottom: var(--unit-[U]);"
        },
        {
            package: "layout.float.ext",
            syntax: "left-[U]",
            expr: "left: var(--unit-[U]);"
        },
        {
            package: "layout.float.ext",
            syntax: "right-[U]",
            expr: "right: var(--unit-[U]);"
        },
        {
            package: "layout.float.ext",
            syntax: "z-[U]",
            expr: "z-Index: [U];"
        },
        {
            package: "layout.flex.core",
            syntax: "flex-row",
            expr: "display: -webkit-box; display: -webkit-flex; display:flex; flex-direction: row;"
        },
        {
            package: "layout.flex.core",
            syntax: "flex-col",
            expr: "display: -webkit-box; display: -webkit-flex; display:flex; flex-direction: column;"
        },
        {
            package: "layout.flex.core",
            syntax: "flex-row-r",
            expr: "display: -webkit-box; display: -webkit-flex; display:flex; flex-direction: row-reverse;"
        },
        {
            package: "layout.flex.core",
            syntax: "flex-col-r",
            expr: "display: -webkit-box; display: -webkit-flex; display:flex; flex-direction: column-reverse;"
        },
        {
            package: "layout.flex.core",
            syntax: "wrap",
            expr: "flex-wrap: wrap;"
        },
        {
            package: "layout.flex.core",
            syntax: "flex-cc",
            compose: ["flex-row", 'ai-center', 'jc-center']
        },
        {
            package: "layout.flex.core",
            syntax: "flex-lc",
            compose: ["flex-row", 'ai-center', 'jc-start']
        },
        {
            package: "layout.flex.core",
            syntax: "flex-rc",
            compose: ["flex-row", 'ai-center', 'jc-end']
        },
        {
            package: "layout.flex.core",
            syntax: "ai-start",
            expr: "-webkit-box-align: start;-webkit-align-items: flex-start;align-items: flex-start;"
        },
        {
            package: "layout.flex.core",
            syntax: "ai-center",
            expr: "-webkit-box-align: center;-webkit-align-items: center;align-items: center;"
        },
        {
            package: "layout.flex.core",
            syntax: "ai-end",
            expr: "-webkit-box-align: end;-webkit-align-items: flex-end;align-items: flex-end;"
        },
        {
            package: "layout.flex.core",
            syntax: "jc-start",
            expr: "-webkit-justify-content: flex-start; justify-content: flex-start;"
        },
        {
            package: "layout.flex.core",
            syntax: "jc-center",
            expr: "-webkit-justify-content: center; justify-content: center;"
        },
        {
            package: "layout.flex.core",
            syntax: "jc-end",
            expr: "-webkit-justify-content: flex-end; justify-content: flex-end;"
        },
        {
            package: "layout.flex.core",
            syntax: "jc-between",
            expr: "-webkit-justify-content: space-between; justify-content: space-between;"
        },
        {
            package: "layout.flex.core",
            syntax: "jc-around",
            expr: "-webkit-justify-content: space-around; justify-content: space-around;"
        },
        {
            package: "layout.flex.core",
            syntax: "jc-evenly",
            expr: "-webkit-justify-content: space-evenly; justify-content: space-evenly;"
        },
        {
            package: "layout.flex.ext",
            syntax: "c[N]",
            expr: "display:flex; -webkit-box-flex: [N]; -webkit-flex: [N]; flex: [N];"
        },
        {
            package: "layout.grid.ext",
            syntax: "grid-[N]c",
            expr: "display:grid; grid-template-columns: repeat([N], minmax(0, 1fr));"
        },
        {
            package: "text.size.ext",
            syntax: "text-[U]",
            expr: "font-size: var(--unit-[U]);"
        },
        {
            package: "text.color.core",
            syntax: "text-primary",
            expr: "color: var(--color-primary);"
        },
        {
            package: "text.color.core",
            syntax: "text-white",
            expr: "color: var(--color-white);"
        },
        {
            package: "text.color.core",
            syntax: "text-black",
            expr: "color: var(--color-black);"
        },
        {
            package: "text.color.ext",
            syntax: "text-[C]-[N]-[A]",
            expr: "color: var(--color-[C]-[N]-[A]);"
        },
        {
            package: "text.color.ext",
            syntax: "text-[C]-[N]",
            expr: "color: var(--color-[C]-[N]);"
        },
        {
            package: "text.effect.core",
            syntax: "text-left",
            expr: "text-align: left;"
        },
        {
            package: "text.effect.core",
            syntax: "text-center",
            expr: "text-align: center;"
        },
        {
            package: "text.effect.core",
            syntax: "text-right",
            expr: "text-align: right;"
        },
        {
            package: "text.effect.core",
            syntax: "text-break",
            expr: "word-wrap: break-word; word-break: break-all;"
        },
        {
            package: "text.effect.core",
            syntax: "text-bold",
            expr: "font-weight: bold;"
        },
        {
            package: "text.effect.ext",
            syntax: "text-normal",
            expr: "font-weight: normal;"
        },
        {
            package: "text.effect.core",
            syntax: "text-line",
            expr: "text-decoration: line-through;"
        },
        {
            package: "text.effect.ext",
            syntax: "text-line-p[N]",
            expr: "line-height: [N]%"
        },
        {
            package: "text.effect.ext",
            syntax: "text-space-[U]",
            expr: "letter-spacing: [U]"
        },
        {
            package: "text.effect.ext",
            syntax: "text-ellipsis",
            expr: "overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
        },
        {
            package: "text.effect.ext",
            syntax: "text-uppercase",
            expr: "text-transform: uppercase;"
        },
        {
            package: "bg.color.core",
            syntax: "bg-primary",
            expr: "background-color: var(--color-primary);"
        },
        {
            package: "bg.color.core",
            syntax: "bg-white",
            expr: "background-color: var(--color-white);"
        },
        {
            package: "bg.color.core",
            syntax: "bg-black",
            expr: "background-color: var(--color-black);"
        },
        {
            package: "bg.color.ext",
            syntax: "bg-[C]-[N]",
            expr: "background-color: var(--color-[C]-[N]);"
        },
        {
            package: "bg.color.ext",
            syntax: "bg-[C]-[N]-[A]",
            expr: "background-color: var(--color-[C]-[N]-[A]);"
        },
        {
            package: "effect.round.core",
            syntax: "round",
            expr: "border-radius: 50%; display: flex; overflow: hidden;"
        },
        {
            package: "effect.round.ext",
            syntax: "round-[U]",
            expr: "-webkit-border-radius: var(--unit-[U]); border-radius: var(--unit-[U]);"
        },
        {
            package: "effect.round.ext",
            syntax: "round-tl-[U]",
            expr: "-webkit-top-left-border-radius: var(--unit-[U]); border-top-left-radius: var(--unit-[U]);"
        },
        {
            package: "effect.round.ext",
            syntax: "round-tr-[U]",
            expr: "-webkit-top-right-border-radius: var(--unit-[U]); border-top-right-radius: var(--unit-[U]);"
        },
        {
            package: "effect.round.ext",
            syntax: "round-bl-[U]",
            expr: "-webkit-bottom-left-border-radius: var(--unit-[U]); border-bottom-left-radius: var(--unit-[U]);"
        },
        {
            package: "effect.round.ext",
            syntax: "round-br-[U]",
            expr: "-webkit-bottom-right-border-radius: var(--unit-[U]); border-bottom-right-radius: var(--unit-[U]);"
        },
        {
            package: "effect.border.core",
            syntax: "border",
            expr: "border: var(--unit-d5) solid var(--color-gray-4);",
            units: ["d5"],
            colors: ["gray-4"]
        },
        {
            package: "effect.border.core",
            syntax: "border-left",
            expr: "border-left: var(--unit-d5) solid var(--color-gray-4);",
            units: ["d5"],
            colors: ["gray-4"]
        },
        {
            package: "effect.border.core",
            syntax: "border-right",
            expr: "border-right: var(--unit-d5) solid var(--color-gray-4);",
            units: ["d5"],
            colors: ["gray-4"]
        },
        {
            package: "effect.border.core",
            syntax: "border-top",
            expr: "border-top: var(--unit-d5) solid var(--color-gray-4);",
            units: ["d5"],
            colors: ["gray-4"]
        },
        {
            package: "effect.border.core",
            syntax: "border-bottom",
            expr: "border-bottom: var(--unit-d5) solid var(--color-gray-4);",
            units: ["d5"],
            colors: ["gray-4"]
        },
        {
            package: "effect.border.ext",
            syntax: "border-dashed",
            expr: "border-style: dashed;",
        },
        {
            package: "effect.border.core",
            syntax: "border-primary",
            expr: "border-color: var(--color-primary);",
        },
        {
            package: "effect.border.core",
            syntax: "border-white",
            expr: "border-color: var(--color-white);",
        },
        {
            package: "effect.border.core",
            syntax: "border-black",
            expr: "border-color: var(--color-black);",
        },
        {
            package: "effect.border.core",
            syntax: "border-transparent",
            expr: "border-color: transparent;",
        },
        {
            package: "effect.border.ext",
            syntax: "border-[U]",
            expr: "border-width: var(--unit-[U]);",
        },
        {
            package: "effect.border.ext",
            syntax: "border-[C]-[N]",
            expr: "border-color: var(--color-[C]-[N]);",
        },
        {
            package: "effect.border.ext",
            syntax: "border-[C]-[N]-[A]",
            expr: "border-color: var(--color-[C]-[N]-[A]);",
        },
        {
            package: "effect.shadow.ext",
            syntax: "shadow",
            expr: "box-shadow: 0 var(--unit-4) var(--unit-10) var(--color-gray-5);",
            units: ["4", "10"],
            colors: ["gray-5"]
        },
        {
            package: "effect.opacity.ext",
            syntax: "opacity-[N]",
            expr: "opacity: 0.[N];"
        },
        {
            package: "transform.rotate.ext",
            syntax: "rotate-[N]",
            expr: "transform: rotate([N]deg); webkit-transform: rotate([N]deg);",
        },
    ]
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
         * 基础颜色设置
         */
        color: { [index: string]: string; }
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
        ruleNames: string[]
        themes: string[]
    }

    const DefaultConfig: CssConfig = {
        default: {
            "unit": "full,d5,1,2,4,8,10,20,24,28,32,36,48,64,72,80,96,120,144,256,512",
            "theme": Object.keys(resource.theme).join(",")
        },
        root: {
            "wx+xcx": "page"
        },
        one: {from: 1, to: 7.5, scale: 3, unit: "vmin"},
        color: {
            "primary": resource.primaryColor,
            "black": "#000000",
            "white": "#ffffff",
        },
        theme: resource.theme
    }


    export const generateCssContent = (browser: string, classExprs: string[], config: CssConfig = DefaultConfig): string => {
        try {
            const styleList: string[] = [];
            let unitList: string[] = []
            const ruleSetting = initRuleSetting(resource.DefaultStyles, Object.keys(DefaultConfig.theme));
            log(`[config] read ${ruleSetting.ruleNames.length} rules`)
            log(`[generate] prepare to generate css for ${classExprs.length} classItems`)
            const warnings: string[] = []
            classExprs.sort().forEach((classExpr: string, index: number) => {
                const {units, styles} = makeCssForExpr(classExpr, ruleSetting, warnings)
                const order = `${index + 1}/${classExprs.length}`.padStart(8, " ")
                const unitString = units.length == 0 ? "" : `units = ${units.join(",")}`
                log(`[generate] ${order}`, classExpr.padEnd(20, " "), unitString)
                unitList.push(...units)
                styleList.push(...styles)
            })
            unitList = unitList.compact().unique().sort()
            log(`[generate] find ${unitList.length} units - `, unitList.join(","))
            log(`[warning] total found ${warnings.length} warnings`)
            warnings.forEach((m: string) => log(m))
            const vars = generateVars(browser, unitList, [], config)
            return vars + "\n" + styleList.join("\n")
        } catch (e) {
            return `${e}`
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
            if (matchResult.groups["N"]) {
                para.number = matchResult.groups["N"]
            }
            if (matchResult.groups["C"]) {
                para.color = matchResult.groups["C"]
            }
            if (matchResult.groups["A"]) {
                para.color = matchResult.groups["A"]
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
            return Object.keys(ruleSetting.ruleMap).filter((syntax: string) => {
                const rule = ruleSetting.ruleMap[syntax]
                return rule.package.includes(expression) && !rule.syntaxRegex
            }).map((syntax: string) => ruleSetting.ruleMap[syntax])
        }
        // 直接查询
        let rule = ruleSetting.ruleMap[expression]
        if (rule) {
            return [rule]
        }
        // 如果包含数字，匹配动态规则
        const exprWithoutNumber = expression.replace(/\d+/g, "[]")
        rule = ruleSetting.ruleMap[exprWithoutNumber]
        if (rule) {
            return [rule]
        }
        return Object.keys(ruleSetting.ruleMap).filter((syntax: string) => {
            return ruleSetting.ruleMap[syntax]?.syntaxRegex?.test(expression)
        }).map((syntax: string) => ruleSetting.ruleMap[syntax])

    }


    const makeCssForExpr = (expression: string, ruleSetting: StyleRuleSetting, warnings: string[]): { units: string[], styles: string[] } => {
        let rules = searchRulesByExpr(expression, ruleSetting)
        if (rules == undefined || rules.length == 0) {
            warnings.push(`[warning] expression [${expression}] has no matched rules`)
            return {units: [], styles: []}
        }

        const classRuleList = rules.map((rule: AtomicStyleRule) => {
            return {classExpr: expression, rule}
        })

        const styles: string[] = []
        const units: string[] = []

        while (classRuleList.length > 0) {
            const classRule = classRuleList.shift()
            if (!classRule) {
                break
            }

            const para = extraPara(classRule.classExpr, classRule.rule)
            units.push(para?.unit || "")
            if (classRule.rule.expr) {
                units.push(...(classRule.rule?.units || []))
                const style = wrapPara(classRule.rule.expr, para)
                styles.push(style)
            } else if (classRule.rule.compose) {
                classRule.rule.compose.forEach((command: string) => {
                    const newClassExpr = wrapPara(command, para)
                    let newRules = searchRulesByExpr(newClassExpr, ruleSetting)
                    newRules?.forEach((rule: AtomicStyleRule) => {
                        units.push(...(rule?.units || []))
                        classRuleList.unshift({classExpr: newClassExpr, rule})
                    })
                })

            }
        }

        if (styles.length > 0) {
            styles.unshift(`.${expression}{`)
            styles.push("}")
        }

        return {units: units.compact().unique(), styles}
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
     * @param styles 样式规则数组
     * @param themes 主题名称
     */
    const initRuleSetting = (styles: AtomicStyleRule[], themes: string[]): StyleRuleSetting => {
        const ruleMap: { [index: string]: AtomicStyleRule } = {}
        const ruleNames: string[] = []
        styles.forEach((style: AtomicStyleRule) => {
            if (style.syntax.includes("[")) {
                // 生成动态规则名称
                const syntax = style.syntax.replace(/[C|U|N|A]/g, "")
                ruleNames.push(syntax)
                // 生成正则表达式
                const regexExpr = style.syntax
                    .replace("[U]", "(?<U>[0-9a-z]+)")
                    .replace("[C]", "(?<C>[a-z]+)")
                    .replace("[N]", "(?<N>[0-9]+)")
                    .replace("[A]", "(?<A>[0-9]+)")
                // 设置规则名称
                style.syntaxRegex = new RegExp("^" + regexExpr + "$")
                ruleMap[syntax] = style
                ruleMap[style.syntax] = style
            } else {
                ruleMap[style.syntax] = style
            }
            ruleNames.push(style.syntax)
        })
        return {ruleMap, themes, ruleNames}
    }

    /**
     * 生成变量的CSS
     * @param plat 运行环境简称
     * @param units 全部数值
     * @param colorThemes 主题色
     * @param config CSS基础配置
     */
    const generateVars = (plat: string, units: string[], colorThemes: string[], config: CssConfig): string => {
        const root = config.root[plat]
        if (!root) {
            throw Error(`missing root for ${plat}`)
        }
        if (units.length == 0) {
            units = config.default["unit"].split(",")
        } else {
            units = units.filter((m: string, index: number) => units.indexOf(m) == index)
                .sort((left: string, right: string) => {
                    return parseFloat(left.replace("d", "0.")) - parseFloat(right.replace("d", "0."))
                })
        }
        if (colorThemes.length == 0) {
            colorThemes = config.default["theme"].split(",")
        }

        const vars: string[] = []
        vars.push(`${root} {`)
        units.forEach((unit: string) => {
            vars.push(generateUnitVar(unit, config))
        })

        vars.push("")
        vars.push(`--color-primary: ${config.color?.primary};`)
        vars.push(`--color-white: ${config.color?.white};`)
        vars.push(`--color-black: ${config.color?.black};`)
        vars.push("")

        colorThemes.forEach((themeName: string) => {
            vars.push(...generateColorVarsForTheme(themeName, config))
            vars.push("")
        })
        vars.push("}")
        return vars.join("\n")
    }

    /**
     * 生成数值变量
     * @param unit 数值
     * @param config CSS基础配置
     */
    const generateUnitVar = (unit: string, config: CssConfig): string => {
        if (unit == "") {
            return ""
            throw Error("missing value")
        }
        if (unit == "full") {
            return "--unit-full: 100%;"
        }
        if (unit == "0") {
            return "--unit-0: 0;"
        }
        const oriUnit = unit
        if (unit.startsWith("d")) {
            unit = unit.replace("d", "0.")
        }
        const numberValue = Number(unit)
        if (isNaN(numberValue)) {
            throw Error(`invalid number value: ${unit}`)
        }
        const scale = Math.pow(10, config.one.scale)
        const unitValue = Math.round(numberValue * config.one.from * scale / config.one.to) / scale
        return `--unit-${oriUnit}: ${unitValue}${config.one.unit};`
    }

    /**
     * 生成主题色彩变量
     * @param themeName 主题名称
     * @param config CSS基础配置
     */
    const generateColorVarsForTheme = (themeName: string, config: CssConfig): string[] => {
        const vars: string[] = []
        if (themeName == "") {
            throw Error("missing theme name")
        }
        if (!config.theme[themeName]) {
            throw Error(`missing theme ${themeName}`)
        }
        const colors = config.theme[themeName] as string[]
        colors.forEach((color: string, index: number) => {
            vars.push(`--color-${themeName}-${index + 1}: ${color};`)
        })
        return vars
    }


}

namespace wx {

    const RootDir = "./miniprogram"
    const ConfigFileName = `${RootDir}/app.json`
    const CssOutputFileName = `${RootDir}/mini.wxss`
    const CssInputFileNames = [`${RootDir}/font.wxss`, `${RootDir}/app.wxss`]

    const extraClassItem = (className: string): string[] => {
        if (className == "" || className.length < 2) {
            return []
        }
        className = className.replace(/[a-zA-Z\d\.\s=&\[\]<>!]+\?/g, "")
        if (className.match(/^[\s\da-z-\\.]+$/)) {
            return className.trim().split(/\s+/)
        }
        const result = className.trim().match(/[\w-]+/g)
        if (!result) {
            return []
        }
        return result.filter(m => m.length > 1 && !/[A-Z]/.test(m))
    }

    const praseClassItemFromPage = (index: number, total: number, page: string, countMap: { [index: string]: number }): string[] => {
        let classList: string[] = []
        const xml = Deno.readTextFileSync(`${RootDir}/${page}.wxml`)
        let attrName = ""
        for (const token of htmltok(xml)) {
            if (token.type == TokenType.ATTR_NAME) {
                attrName = token.getValue()
            }
            if ((attrName == "class" || attrName == "hover-class" || attrName == "placeholder-class") && token.type == TokenType.ATTR_VALUE) {
                log(`[prepare] ${token.getValue()}`)
                const items = extraClassItem(token.getValue())
                items.forEach((s: string) => {
                    countMap[s] = (countMap[s] || 0) + 1
                    classList.push(s)
                })
            }
        }
        classList = classList.compact().unique()
        const order = `${index + 1}/${total})`.padStart(7, ' ')
        log(`[prepare] ${order} ${page.padEnd(45, ' ')} - prase ${classList.length} class items`)
        return classList
    }

    const readClassNamesFromCssFile = (cssFile: string): string[] => {
        const cssContent = Deno.readTextFileSync(cssFile)
        const ast = css.parse(cssContent);
        return ast.stylesheet.rules
            .filter((m: any) => m.type == "rule").map((m: any) => m.selectors).flat()
            .filter((m: any) => m.startsWith(".")).map((m: any) => m.slice(1))
    }

    export const generateCssFile = async (fileName: string = "", engine: (browserName: string, classItems: string[]) => string = style.generateCssContent) => {
        const pages = await Deno.readTextFile(ConfigFileName)
            .then((data: string) => JSON.parse(data))
            .then((app: any) => [...app.pages, ...app.subpackages.map((pkg: any) => pkg.pages.map((page: string) => `${pkg.root}/${page}`)).flat()])
        log(`[prepare] prase ${ConfigFileName}, get ${pages.length} wxmp pages`)
        const countMap: { [index: string]: number } = {}
        pages.map((page: string, index: number) => praseClassItemFromPage(index, pages.length, page, countMap)).flat().sort()
        const classItems = Object.keys(countMap)

        log(`[prepare] total ${classItems.length} class items from pages`)
        const existsClasItems: string[] = CssInputFileNames.map(readClassNamesFromCssFile).flat().compact().unique()
        log(`[prepare] found ${existsClasItems.length} class items in ${CssInputFileNames.join(",")}`)
        const missingClassItems = classItems.diff(existsClasItems)
        log(`[prepare] need to create ${missingClassItems.length} class items`)
        let cssContent = engine("wx+xcx", missingClassItems)
        await Deno.writeTextFile(fileName || CssOutputFileName, cssContent);
        log(`[save] save ${cssContent.length} chars to ${fileName || CssOutputFileName}`)
    }
}


const main = async () => {
    await wx.generateCssFile()
    log("css service started")

    const watcher = Deno.watchFs(".");
    for await (const event of watcher) {
        // log(">>>> event", event);
        if (event.kind == "modify" && event.paths.filter((m: string) => m.includes(".wxml")).length > 0) {
            wx.generateCssFile()
        }
    }
}

main()
