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
    [index: string]: string[]
}

export const readThemes = (filePath: string): Promise<ThemeMap> => readDataFile<ThemeMap>(filePath)

/**
 * toString() of them
 */
export const themesToString = (themeMap: ThemeMap): string => {
    const themeNames = Object.keys(themeMap)
    return `total ${themeNames.length} themes\n`
        + "------------------ theme begin ------------------\n"
        + themeNames.map((themeName, index) => `${(index + 1).toString().padStart(2, " ")})`
            + ` theme = ${themeName}, colors = [${themeMap[themeName].join(",")}]`).join("\n")
        + "\n------------------ theme end ------------------"
}