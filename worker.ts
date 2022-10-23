import "https://deno.land/x/arrays@v1.0.21/mod.ts";
import "https://deno.land/std@0.160.0/fs/mod.ts";
import {printError, log, timing} from "./util.ts"
import {OptionalRunningConfig, WxRunningConfig} from "./data.config.ts";
import * as wx from "./mod.wx.ts";

const fullBuild = (config: WxRunningConfig): Promise<number> => {
    log("[task] start auto generation after started");
    const time = timing()
    return Promise.all([
        wx.parseGlobalStyleNames(config),
        wx.parseMiniProgramPages(config).then(wx.batchPromise(wx.parsePageClassNames, config)),
        wx.parseComponentPages(config).then(wx.batchPromise(wx.parseComponentClassNames, config)),
    ]).then(wx.mergeTargetClassNames(config))
        .then(wx.generateContent(config))
        .then(wx.saveContent(config))
        .then(wx.finishAndPrintCostTime(config, time))
        .then(() => log("service ready, Press Ctrl-C to exit"))
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

(function () {
    log("==========================================================");
    log("   wxmp-atomic-css: wechat mini program atomic css kit");
    log("==========================================================");
    log("starting wxmp-atomic-css");

    Deno.addSignalListener("SIGINT", () => {
        log("wxmp-atomic-css service closed");
        Deno.exit();
    });

    const isWindows = Deno.build.os === "windows";
    let scriptPath = new URL(import.meta.url).pathname
    const isLocal = scriptPath.startsWith("/")
    scriptPath = scriptPath.replaceAll("/", isWindows && isLocal ? "\\" : "/").substring(isWindows ? 1 : 0);
    scriptPath = scriptPath.substring(0, scriptPath.lastIndexOf(isWindows && isLocal ? "\\" : "/"));

    log("scriptPath", scriptPath)
    wx.readRunningConfig(scriptPath, "data/config.json", {
        debugOption: {printConfigInfo: true, printThemes: true, printRule: true},
        processOption: {promiseLimit: 1}
    } as OptionalRunningConfig)
        .then(wx.ensureWorkDir)
        .then(wx.printRunningConfig)
        .then((config: WxRunningConfig) => fullBuild(config)
            .then(() => wx.watchMiniProgramPageChange(config, partiallyUpdate)))
        .catch((e: unknown) => log(e))
})()