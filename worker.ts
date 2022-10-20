import "https://deno.land/x/arrays/mod.ts";
import "https://deno.land/std/fs/mod.ts";
import {log, promiseLimit, timing} from "./util.common.ts"
import * as style from "./util.style.ts";
import * as wx from "./util.wx.ts";


const mainProcess = (config: wx.WxRunningConfig): Promise<number> => {
    const time = timing()
    return Promise.all([
        wx.parseGlobalStyleNames(config),
        wx.parseCssOutputFileStyleNames(config),
        wx.parseMiniProgramPages(config)
            .then((pages: string[]): Promise<string[]> =>
                promiseLimit("parse-page-class-names", pages.length,
                    config.processOption.promiseLimit, config.debugOptions.showTaskStep,
                    (taskIndex: number): Promise<string[]> => {
                        return wx.parsePageClassNames(config, pages[taskIndex])
                    }).then((classNames: string[][]) => classNames.flat().compact().unique())
            ),
        wx.parseComponentPages(config)
            .then((componentPages: wx.PageInfo[]): Promise<string[]> =>
                promiseLimit("parse-component-class-names", componentPages.length,
                    config.processOption.promiseLimit, config.debugOptions.showTaskStep,
                    (taskIndex: number): Promise<string[]> => {
                        return wx.parseComponentClassNames(componentPages[taskIndex], config)
                    }).then((classNames: string[][]) => classNames.flat().compact().unique())
            ),
    ])
        .then((values: Awaited<string[]>[]) => wx.mergeTargetClassNames(values))
        .then((missingClassNames: string[]) => style.generateStyleContents(missingClassNames, wx.getRuleSetting(config), config.debugOptions.showStyleTaskResult))
        .then((classResultList: style.StyleInfo[]): Promise<number> => wx.save(classResultList, config))
        .then((result: number) => {
            log(`[data] job done, cost ${time.es()} ms, result = ${result}`)
            return Promise.resolve(0)
        })
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
            if (config.debugOptions.printConfigInfo) {
                log("[data] config: ", config)
            }

            log("[task] start auto generation after started");

            mainProcess(config)
                .then(() => log("service ready, Press Ctrl-C to exit"))
                .then(() => wx.watchMiniProgramPageChange(config, mainProcess))

        }).catch((e: unknown) => log(`error: ${e}`))
})()


