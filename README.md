# wxmp-atomic-css
atomic css for wechat mini program, instant css content generator

# usage

1 install deno

`iwr https://deno.land/install.ps1 -useb | iex`

2 open terminal and run script on the wechat mini program directory

`deno run --allow-read --allow-write https://deno.land/x/wxmp_atomic_css@v0.0.3/worker.ts .`

the result is  

```
❯ deno run --allow-read --allow-write https://deno.land/x/wxmp_atomic_css@v0.0.3/worker.ts .
2022-9-20 2:48:2.198   working directory found for app.wxss at .
2022-9-20 2:48:2.200   [check] read wechat mini program pages from config file, found [1] pages
2022-9-20 2:48:2.201   [check] missing global css file [font.wxss] and ignore
2022-9-20 2:48:2.202   [check] read global styles names, found [0] in [app.wxss]
2022-9-20 2:48:2.203   [check] found total [0] global class styles
2022-9-20 2:48:2.203   [check]    1/1) process page [index/index]
2022-9-20 2:48:2.214   [check]         parse class attribute [intro] to [intro]
2022-9-20 2:48:2.222   [check]         found page class names [1] [intro]
2022-9-20 2:48:2.223   [check]         found page style names [1] [intro]
2022-9-20 2:48:2.224   [check]         no styles to create
2022-9-20 2:48:2.224   [check] no global styles to create
2022-9-20 2:48:2.225   [task] wxmp-atomic-css service started

```

3 open any page and add class name, e.g `index/index`

the original content is `<view class="intro">欢迎使用代码片段，可在控制台查看代码片段的说明和文档</view>`

and the new content is `<view class="intro text-primary">欢迎使用代码片段，可在控制台查看代码片段的说明和文档</view>`



```text
2022-9-20 2:55:0.316   [check] read wechat mini program pages from config file, found [1] pages
2022-9-20 2:55:0.316   [check] missing global css file [font.wxss] and ignore
2022-9-20 2:55:0.317   [check] read global styles names, found [0] in [app.wxss]
2022-9-20 2:55:0.317   [check] found total [0] global class styles
2022-9-20 2:55:0.317   [check]    1/1) process page [index/index]
2022-9-20 2:55:0.318   [check]         parse class attribute [intro text-primary] to [intro,text-primary]
2022-9-20 2:55:0.318   [check]         found page class names [2] [intro,text-primary]
2022-9-20 2:55:0.318   [check]         found page style names [1] [intro]
2022-9-20 2:55:0.318   [check]         need to create [1] styles [text-primary]
2022-9-20 2:55:0.318   [check] total to create [1] global styles
2022-9-20 2:55:0.318   [check] skip style names in [mini.wxss]
2022-9-20 2:55:0.319   [task] create [1] class items [text-primary]
2022-9-20 2:55:0.319   [task] read 150 rules
2022-9-20 2:55:0.319   [task] try to generate [1] styles
2022-9-20 2:55:0.319   [task]      1/1 text-primary
2022-9-20 2:55:0.319   [task] found total [0] units []
2022-9-20 2:55:0.320   [task] save 3801 chars to ./mini.wxss
2022-9-20 2:55:0.321   [task] wxmp-atomic-css refresh 1x
```