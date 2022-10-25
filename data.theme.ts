/**
 * color themes
 *
 * value ranges:
 * primary, black, white are necessary, each has only one color
 * gray have 13 colors
 * other themes have 10 colors
 *
 * usage:
 * [theme]-[order]
 * [theme]-[order]-a[alpha]
 * [theme], equals to [theme]-1, text-primary, text-black, text-white, bg-primary, bg-black, bg-white
 * [theme]-a[alpha], equals to [theme]-1-a[alpha]
 *
 */
import {readDataFile} from "./util.ts";

export interface ThemeMap {
    primary: string,
    black: string,
    white: string,
    palette: { [index: string]: { [index: string]: string[] } }
    colorAliasMap: { [index: string]: string }
}

const buildColorShortMap = (colors: string[]): { [index: string]: string } => {
    const colorMap = {"p": "primary", "b": "black", "w": "white"}
    let n = colors.length
    for (let i = 0; i < n; i++) {
        const color = colors.shift()
        const short = color.charAt(0)
        if (colorMap[short]) {
            colors.push(color)
        } else {
            colorMap[short] = color
        }
    }
    n = colors.length
    for (let i = 0; i < n; i++) {
        const color = colors.shift()
        let found = false
        for (let j = 0; j < color.length; j++) {
            const short = color.charAt(j)
            if (!colorMap[short]) {
                found = true
                colorMap[short] = color
                break
            }
        }
        if (!found) {
            colors.push(color)
        }
    }
    let cc = 0
    n = colors.length
    for (let i = 0; i < n; i++) {
        const color = colors.shift()
        for (let j = cc; j < 26; j++) {
            const short = String.fromCharCode(97 + j)
            if (colorMap[short]) {
                cc++
            } else {
                colorMap[short] = color
                break
            }
        }
    }
    const colorAliasMap = {}
    Object.keys(colorMap).forEach((short: string) => {
        colorAliasMap[colorMap[short]] = short
    })
    return colorAliasMap;
};

export const readThemes = async (filePath: string): Promise<ThemeMap> => {
    const themeMap = await readDataFile<ThemeMap>(filePath)
    const colors = Object.keys(themeMap.palette).map((p: string) => Object.keys(themeMap.palette[p])).flat().unique();
    themeMap.colorAliasMap = buildColorShortMap(colors);
    return themeMap
}

/**
 * toString() of them
 */
export const themesToString = (themeMap: ThemeMap): string => {
    const providers = Object.keys(themeMap.palette)
    return `total ${providers.length} providers\n`
        + "------------------ theme begin ------------------\n"
        + `${"primary:".padEnd(15, " ")}${themeMap.primary}\n`
        + `${"black:".padEnd(15, " ")}${themeMap.black}\n`
        + `${"white:".padEnd(15, " ")}${themeMap.white}\n`
        + `palette: \n`
        + Object.keys(themeMap.palette).map(palette =>
            `  ${palette}:\n`
            + `    ${"color".padEnd(10, " ")} ${"alias"} ${"specification".padStart(45, " ")}\n`
            + `    ${"-".padEnd(10, "-")} ${"-----"} ${"".padEnd(81, "-")}\n`
            + Object.keys(themeMap.palette[palette]).map(theme =>
                `    ${theme.padEnd(10, " ")} ${(themeMap.colorAliasMap[theme] || "").padStart(3, " ").padEnd(5, " ")} [${themeMap.palette[palette][theme].join(",")}]`
            ).join("\n")
        )
            .join("\n")
        + "\n------------------ theme end ------------------"
}