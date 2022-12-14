import "https://deno.land/x/arrays@v1.0.21/mod.ts";
import "https://deno.land/std@0.160.0/fs/mod.ts";
import {log, printError, timing} from "./util.ts"
import {OptionalRunningConfig, WxRunningConfig} from "./data.config.ts";
import * as wx from "./mod.wx.ts";

const fullBuild = (config: WxRunningConfig): Promise<number> => {
    const time = timing()
    log("[task] start auto generation after started")
    return Promise.all([
        wx.parseGlobalStyleNames(config),
        wx.parseMiniProgramPages(config).then(wx.batchPromise(wx.parsePageClassNames, config)),
        wx.parseComponentPages(config).then(wx.batchPromise(wx.parseComponentClassNames, config)),
    ]).then(wx.mergeTargetClassNames(config))
        .then(wx.generateContent(config))
        .then(wx.saveContent(config))
        .then(wx.finishAndPrintCostTime(config, time))
        .catch(printError(time))
}

const partiallyUpdate = (config: WxRunningConfig, fileEvents: string[]): Promise<number> => {
    const time = timing()
    return wx.generateClassNamesFromFileEvents(config, fileEvents)
        .then(wx.generateContent(config))
        .then(wx.saveContent(config))
        .then(wx.finishAndPrintCostTime(config, time))
        .catch(printError(time))
}

const countClassNames = (outputFilePath: string) => (config: WxRunningConfig) => {
    log("[task] start generating report...");
    const time = timing()
    Promise.all([
        wx.parseGlobalStyleNames(config),
        wx.parseMiniProgramPages(config).then(wx.batchCountPromise(wx.countPageClassNames, config)),
        wx.parseComponentPages(config).then(wx.batchCountPromise(wx.countComponentClassNames, config)),
    ]).then(wx.countTargetClassNames(config, outputFilePath))
        .catch(printError(time))
}

(function () {
    log("==========================================================");
    log("   wxmp-atomic-css: wechat mini program atomic css kit");
    log("==========================================================");
    log("starting wxmp-atomic-css");

    Deno.addSignalListener("SIGINT", () => {
        log("wxmp-atomic-css service closed");
        Deno.exit();
    });

    wx.readRunningConfig("data/config.json", {
        // debugOption: {printConfigInfo: true, printThemes: true, printRule: true},
        processOption: {promiseLimit: 1}
    } as OptionalRunningConfig)
        .then(wx.ensureWorkDir)
        .then(wx.printRunningConfig)
        .then(wx.executeCommands({
            "count": countClassNames("report.md"),
            "default": (config) => fullBuild(config).then(() => wx.watchPageChanges(config, partiallyUpdate))
        }))
        .catch((e: unknown) => log(e))
})()