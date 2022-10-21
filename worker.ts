import "https://deno.land/x/arrays/mod.ts";
import "https://deno.land/std/fs/mod.ts";
import {error, log, timing} from "./util.ts"
import {OptionalRunningConfig, WxRunningConfig} from "./data.config.ts";
import * as wx from "./mod.wx.ts";

const mainProcess = (config: WxRunningConfig): Promise<number> => {
    const time = timing()
    return Promise.all([
        wx.parseGlobalStyleNames(config),
        wx.parseMiniProgramPages(config).then(wx.batchPromise(wx.parsePageClassNames, config)),
        wx.parseComponentPages(config).then(wx.batchPromise(wx.parseComponentClassNames, config)),
    ]).then(wx.mergeTargetClassNames)
        .then(wx.generateContent(config))
        .then(wx.saveContent(config))
        .then(wx.finishAndPrintCostTime(time))
}

(function () {
    log("==========================================================");
    log("   wxmp-atomic-css: wechat mini program atomic css kit");
    log("==========================================================");
    log("starting wxmp-atomic-css");

    const sigIntHandler = () => {
        log("wxmp-atomic-css service closed");
        Deno.exit();
    };
    Deno.addSignalListener("SIGINT", sigIntHandler);

    wx.readRunningConfig("data/config.json", {
        debugOption: {printRule: true, printThemes: true, showTaskStep: true}
    } as OptionalRunningConfig)
        .then(wx.ensureWorkDir)
        .then(wx.printRunningConfig)
        .then((config: WxRunningConfig) => {
            log("[task] start auto generation after started");
            mainProcess(config)
                .then(() => log("service ready, Press Ctrl-C to exit"))
                .then(() => wx.watchMiniProgramPageChange(config, mainProcess))
        }).catch((e: unknown) => error(`unknown error: `, e))
})()