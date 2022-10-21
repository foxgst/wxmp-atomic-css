import "https://deno.land/x/arrays/mod.ts";
import "https://deno.land/std/fs/mod.ts";
import {log, error, promiseLimit, timing} from "./util.ts"
import {rulesToString} from "./data.rule.ts";
import {themesToString} from "./data.theme.ts";
import {OptionalRunningConfig, StyleInfo, WxRunningConfig} from "./data.config.ts";
import * as style from "./mod.style.ts";
import * as wx from "./mod.wx.ts";

const mainProcess = (config: WxRunningConfig): Promise<number> => {
    const time = timing()
    return Promise.all([
        wx.parseGlobalStyleNames(config),
        wx.parseCssOutputFileStyleNames(config),
        wx.parseMiniProgramPages(config)
            .then((pages: string[]): Promise<string[]> =>
                promiseLimit("parse-page-class-names", pages.length, (taskIndex: number): Promise<string[]> => {
                    return wx.parsePageClassNames(config, pages[taskIndex])
                }, config.processOption.promiseLimit, config.debugOption.showTaskStep).then((classNames: string[][]) => classNames.flat().compact().unique())
            ),
        wx.parseComponentPages(config)
            .then((componentPages: wx.PageInfo[]): Promise<string[]> =>
                promiseLimit("parse-component-class-names", componentPages.length, (taskIndex: number): Promise<string[]> => {
                    return wx.parseComponentClassNames(componentPages[taskIndex], config)
                }, config.processOption.promiseLimit, config.debugOption.showTaskStep).then((classNames: string[][]) => classNames.flat().compact().unique())
            ),
    ])
        .then((values: Awaited<string[]>[]) => wx.mergeTargetClassNames(values))
        .then(async (missingClassNames: string[]) => style.generateStyleContents(missingClassNames,
            await wx.getRuleSetting(config), await wx.getThemeMap(config), config.debugOption.showStyleTaskResult))
        .then((classResultList: StyleInfo[]): Promise<number> => wx.save(classResultList, config))
        .then((result: number) => {
            log(`[data] job done, cost ${time.es()} ms, result = ${result}`)
            return Promise.resolve(0)
        })
}

(function () {

    // log( "p-[U]".replace(/\[U]/g, "36"))
    //
    // return

    log("==========================================================");
    log("   wxmp-atomic-css: wechat mini program atomic css kit");
    log("==========================================================");
    log("starting wxmp-atomic-css");

    const sigIntHandler = () => {
        console.log("wxmp-atomic-css service closed");
        Deno.exit();
    };
    Deno.addSignalListener("SIGINT", sigIntHandler);


    wx.readRunningConfig("data/config.json", {
        debugOption: {printRule: true, printThemes: true}
    } as OptionalRunningConfig)
        .then((config: WxRunningConfig) => wx.ensureWorkDir(config))
        .then(async (config: WxRunningConfig) => {
            if (config.debugOption.printConfigInfo) {
                log("[data] config: ", config)
            }
            const themeMap = await wx.getThemeMap(config)
            if (config.debugOption.printThemes) {
                log("[data] themes: ", themesToString(themeMap))
            }
            const ruleSetting = await wx.getRuleSetting(config)
            if (config.debugOption.printRule) {
                log("[data] rules: ", rulesToString(ruleSetting.rules))
            }

            log("[task] start auto generation after started");

            mainProcess(config)
                .then(() => log("service ready, Press Ctrl-C to exit"))
                .then(() => wx.watchMiniProgramPageChange(config, mainProcess))

        }).catch((e: unknown) => error(`unknown error: `, e))
})()


