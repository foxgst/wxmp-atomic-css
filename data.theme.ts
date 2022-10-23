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
}

export const readThemes = (filePath: string): Promise<ThemeMap> => readDataFile<ThemeMap>(filePath)

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
            + Object.keys(themeMap.palette[palette]).map(theme =>
            `    ${theme.padEnd(10, " ")}[${themeMap.palette[palette][theme].join(",")}]`
            ).join("\n"))
            .join("\n")
        + "\n------------------ theme end ------------------"
}