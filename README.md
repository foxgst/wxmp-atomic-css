# wxmp-atomic-css
atomic css for wechat mini program, instant global css content generator

features

- support pages in main package and subpackages
- support component pages with global css
- with page class names cache and promise, speed up to 20 ms
- watching wechat mini program directory, auto generated by 200 ms delay
- with two color palettes, over 15 themes, which colors come from ant-design
- with 100+ common css style rules
- minify css content

roadmap

- count style name usage in all pages


# usage

1 install deno

```bash
iwr https://deno.land/install.ps1 -useb | iex
```

2 open terminal and run script on the wechat mini program directory

```bash
deno run --allow-read --allow-write --allow-net https://deno.land/x/wxmp_atomic_css@v0.0.9/worker.ts .
```

or

```bash
deno run --allow-read --allow-write --allow-net https://raw.githubusercontent.com/foxgst/wxmp-atomic-css/main/worker.ts .
```

the result is  

![image](https://user-images.githubusercontent.com/431807/197428669-131de319-d7da-4e02-bd5e-c38f293edd34.png)


3 open any page and add class name, e.g `index/index`

the original content is `<view class="intro">欢迎使用代码片段，可在控制台查看代码片段的说明和文档</view>`

and the new content is `<view class="intro text-primary">欢迎使用代码片段，可在控制台查看代码片段的说明和文档</view>`


add some code with class names to the wxml file

```text
2022-10-23 11:02:17.339 [file changed] *D:\xxx\yyy\miniprogram\pages\index\zzz.wxml
2022-10-23 11:02:17.341 [task] page [D:\xxx\yyy\miniprogram\pages\index\zzz.wxml] - [wh-screen,z-1,flex-col,py-20,c1,mh-200,text-32,text-black,px-32,px-37,flex-row,ai-center,jc-center,h-96,wh-64,text-30,text-orange-6,mx-20,my-20,shadow,round-20,gap-32,duration-1000,delay-1000,ease-in,my-10,text
-36,text-bold,text-center,wh-144,text-primary,bg-gray-2,round-10,text-gray-7,wh-256,h-20,mt-32,bg-orange-3-a10,jc-around,wh-72,h-36,bg-red-3-a10,safe-bottom]
2022-10-23 11:02:17.342 [data] new task to create [193] class names
2022-10-23 11:02:17.346 [warnings] 23 class names not matched, -a,active-bg,active-text-day,active-text-week,currency,day,disable-text,ff-n,g-,normal-bg,normal-text,number,pop-full,pos-tr,round-10m,theme,themes,type,userinfo,userinfo-avatar,userinfo-nickname,wrap,z-
2022-10-23 11:02:17.347 [data] new task to create [29] unit vars, [0,1,10,12,120,144,150,2,20,200,24,256,28,3,30,32,36,37,4,48,6,64,72,8,80,90,96,d5,p100]
2022-10-23 11:02:17.347 [data] new task to create [26] color vars, [black-1,black-1-50,blue-1,blue-6,gray-1,gray-10,gray-2,gray-3,gray-4,gray-5,gray-5-a05,gray-6,gray-7,gray-9,green-6,green-7,orange-3-10,orange-6,orange-6-30,primary-1,primary-1-10,red-3-10,red-6,red-7,red-7-10,white-1]
2022-10-23 11:02:17.347 [task] begin to write output file
2022-10-23 11:02:17.349 [task] save 1756 chars to var.wxss
2022-10-23 11:02:17.350 [task] save 10819 chars to mini.wxss
2022-10-23 11:02:17.350 [data] job done, cost 11 ms, result = 0
2022-10-23 11:02:17.351 [task] wxmp-atomic-css refresh 1x

```


add some code without class names to the wxml file

```text
2022-10-23 11:02:24.870 [file changed] *D:\xxx\yyy\miniprogram\pages\index\zzz.wxml
2022-10-23 11:02:24.873 [task] page [D:\xxx\yyy\miniprogram\pages\index\zzz.wxml] - [wh-screen,z-1,flex-col,py-20,c1,mh-200,text-32,text-black,px-32,px-37,flex-row,ai-center,jc-center,h-96,wh-64,text-30,text-orange-6,text-36,mx-20,my-20,shadow,round-20,gap-32,duration-1000,delay-1000,ease-in,my
-10,text-bold,text-center,wh-144,text-primary,bg-gray-2,round-10,text-gray-7,wh-256,h-20,mt-32,bg-orange-3-a10,jc-around,wh-72,h-36,bg-red-3-a10,safe-bottom]
2022-10-23 11:02:24.874 [data] job terminated, cost 3 ms { code: 1, msg: "page class names already generated" }
2022-10-23 11:02:24.876 [task] wxmp-atomic-css refresh 2x

```


and add some code with class names to the wxml file


```text
2022-10-23 11:02:41.979 [file changed] *D:\xxx\yyy\miniprogram\pages\index\zzz.wxml
2022-10-23 11:02:41.985 [task] page [D:\xxx\yyy\miniprogram\pages\index\zzz.wxml] - [wh-screen,z-1,flex-col,py-20,c1,mh-200,text-32,text-black,px-32,px-37,flex-row,ai-center,jc-center,h-96,wh-64,text-30,text-orange-6,text-36,text-red-5,mx-20,my-20,shadow,round-20,gap-32,duration-1000,delay-1000
,ease-in,my-10,text-bold,text-center,wh-144,text-primary,bg-gray-2,round-10,text-gray-7,wh-256,h-20,mt-32,bg-orange-3-a10,jc-around,wh-72,h-36,bg-red-3-a10,safe-bottom]
2022-10-23 11:02:41.986 [data] new task to create [194] class names
2022-10-23 11:02:41.990 [warnings] 23 class names not matched, -a,active-bg,active-text-day,active-text-week,currency,day,disable-text,ff-n,g-,normal-bg,normal-text,number,pop-full,pos-tr,round-10m,theme,themes,type,userinfo,userinfo-avatar,userinfo-nickname,wrap,z-
2022-10-23 11:02:41.991 [data] new task to create [29] unit vars, [0,1,10,12,120,144,150,2,20,200,24,256,28,3,30,32,36,37,4,48,6,64,72,8,80,90,96,d5,p100]
2022-10-23 11:02:41.991 [data] new task to create [27] color vars, [black-1,black-1-50,blue-1,blue-6,gray-1,gray-10,gray-2,gray-3,gray-4,gray-5,gray-5-a05,gray-6,gray-7,gray-9,green-6,green-7,orange-3-10,orange-6,orange-6-30,primary-1,primary-1-10,red-3-10,red-5,red-6,red-7,red-7-10,white-1]
2022-10-23 11:02:41.991 [task] begin to write output file
2022-10-23 11:02:41.994 [task] save 1791 chars to var.wxss
2022-10-23 11:02:41.996 [task] save 10865 chars to mini.wxss
2022-10-23 11:02:41.996 [data] job done, cost 17 ms, result = 0
2022-10-23 11:02:41.996 [task] wxmp-atomic-css refresh 3x
```

# the result file
- `app.wxss` should import `var.wxss` and `mini.wxss`
- `var.wxss` auto generated, only contains page element with css variables
- `mini.wxss` auto generated, contains all class names which not defined and following by the rules in all pages and component pages with global css

# data files

- `data/config.json` running configuration

```json
{
  "fileStructure": {
    "miniProgramDir": "miniprogram",
    "componentDir": "components",
    "appConfigFile": "app.json",
    "cssMainFile": "app.wxss",
    "cssVarFile": "var.wxss",
    "cssOutputFile": "mini.wxss",
    "cssInputFiles": [
      "font.wxss"
    ]
  },
  "workDir": "",
  "watchOption": {
    "delay": 200,
    "fileTypes": [
      ".wxml"
    ],
    "refreshCount": 0
  },
  "fileExtension": {
    "page": ".wxml",
    "ts": ".ts",
    "js": ".js",
    "css": ".wxss"
  },
  "cssOption": {
    "varPrefix": "mp-",
    "minify": false,
    "palette": "ant-design",
    "rootElementName": "page",
    "componentGlobalCss": "addGlobalClass:\\s*true",
    "one": {
      "from": 1,
      "to": 7.5,
      "precision": 3,
      "unit": "vmin"
    },
    "singleColorThemes": [
      "primary",
      "white",
      "black"
    ],
    "styleIndent": "    "
  },
  "dataOption": {
    "themeFile": "themes.json",
    "ruleFile": "rules.json"
  },
  "debugOption": {
    "printConfigInfo": false,
    "printRule": false,
    "printThemes": false,
    "showPageClassNames": false,
    "showPageClassAttribute": false,
    "showCssStyleNames": false,
    "showPageTaskBegin": false,
    "showPageTaskResult": false,
    "showStyleTaskResult": false,
    "showTaskStep": false,
    "showFileContent": false
  },
  "processOption": {
    "promiseLimit": 5
  },
  "tempData": {
    "pageClassNameMap": {},
    "globalClassNames": []
  }
}

```

- `data/rules.json` css style rules

partially content

```json
[
  {
    "package": "spacing.padding.core",
    "syntax": "safe-bottom",
    "expr": "padding-bottom: env(safe-area-inset-bottom);"
  },
  {
    "package": "spacing.padding.ext",
    "syntax": "p-[U]",
    "compose": [
      "pl-[U]",
      "pr-[U]",
      "pt-[U]",
      "pb-[U]"
    ]
  },
  {
    "package": "spacing.padding.ext",
    "desc": "padding-x-axis",
    "syntax": "px-[U]",
    "compose": [
      "pl-[U]",
      "pr-[U]"
    ]
  },
  {
    "package": "spacing.padding.ext",
    "desc": "padding-y-axis",
    "syntax": "py-[U]",
    "compose": [
      "pt-[U]",
      "pb-[U]"
    ]
  },
  {
    "package": "spacing.padding.ext",
    "syntax": "pt-[U]",
    "expr": "padding-top: var(--unit-[U]);"
  },
  {
    "package": "spacing.padding.ext",
    "syntax": "pb-[U]",
    "expr": "padding-bottom: var(--unit-[U]);"
  },
  {
    "package": "spacing.padding.ext",
    "syntax": "pl-[U]",
    "expr": "padding-left: var(--unit-[U]);"
  },
  {
    "package": "spacing.padding.ext",
    "syntax": "pr-[U]",
    "expr": "padding-right: var(--unit-[U]);"
  }
]

```

- `data/themes.json` css color themes

```json
{
  "primary": "#4686eb",
  "black":  "#000000",
  "white": "#ffffff",
  "palette": {
    "ant-design": {
      "gray": ["#ffffff","#fafafa","#f5f5f5","#f0f0f0","#d9d9d9","#bfbfbf","#8c8c8c","#595959","#434343","#262626","#1f1f1f","#141414","#000000"],
      "red": ["#fff1f0","#ffccc7","#ffa39e","#ff7875","#ff4d4f","#f5222d","#cf1322","#a8071a","#820014","#5c0011" ],
      "orange": ["#fff7e6","#ffe7ba","#ffd591","#ffc069","#ffa940","#fa8c16","#d46b08","#ad4e00","#873800","#612500"],
      "yellow": ["#feffe6","#ffffb8","#fffb8f","#fff566","#ffec3d","#fadb14","#d4b106","#ad8b00","#876800","#614700"],
      "green": ["#f6ffed","#d9f7be","#b7eb8f","#95de64","#73d13d","#52c41a","#389e0d","#237804","#135200","#092b00"],
      "blue": ["#e6f7ff","#bae7ff","#91d5ff","#69c0ff","#40a9ff","#1890ff","#096dd9","#0050b3","#003a8c","#002766"],
      "purple": ["#f9f0ff","#efdbff","#d3adf7","#b37feb","#9254de","#722ed1","#531dab","#391085","#22075e","#120338"],
      "magenta": ["#fff0f6","#ffd6e7","#ffadd2","#ff85c0","#f759ab","#eb2f96","#c41d7f","#9e1068","#780650","#520339"],
      "cyan": ["#e6fffb","#b5f5ec","#87e8de","#5cdbd3","#36cfc9","#13c2c2","#08979c","#006d75","#00474f","#002329"],
      "lime": ["#fcffe6","#f4ffb8","#eaff8f","#d3f261","#bae637","#a0d911","#7cb305","#5b8c00","#3f6600","#254000"],
      "gold": ["#fffbe6","#fff1b8","#ffe58f","#ffd666","#ffc53d","#faad14","#d48806","#ad6800","#874d00","#613400"],
      "volcano": ["#fff2e8","#ffd8bf","#ffbb96","#ff9c6e","#ff7a45","#fa541c","#d4380d","#ad2102","#871400","#610b00"]
    },
    "t-design": {
      "gray": ["#f3f3f3","#eeeeee","#e7e7e7","#dcdcdc","#c5c5c5","#a6a6a6","#8b8b8b","#777777","#5e5e5e","#4b4b4b","#383838","#2c2c2c","#242424","#181818"],
      "red": ["#fdecee","#f9d7d9","#f8b9be","#f78d94","#f36d78","#e34d59","#c9353f","#b11f26","#951114","#680506"],
      "orange": ["#fef3e6","#f9e0c7","#f7c797","#f2995f","#ed7b2f","#d35a21","#ba431b","#9e3610","#842b0b","#5a1907"],
      "yellow": ["#fff8b8","#ffe478","#fbca25","#ebb105","#d29c00","#ba8700","#a37200","#8c5f00","#754c00","#5e3a00"],
      "green": ["#e8f8f2","#bcebdc","#85dbbe","#48c79c","#00a870","#078d5c","#067945","#056334","#044f2a","#033017"],
      "blue": ["#ecf2fe","#d4e3fc","#bbd3fb","#96bbf8","#699ef5","#4787f0","#266fe8","#0052d9","#0034b5","#001f97"],
      "purple": ["#f3e0ff","#e6c4ff","#d8abff","#c68cff","#ae78f0","#9963d8","#834ec2","#6d3bac","#572796","#421381"],
      "pink": ["#ffe9ff","#ffd1fc","#ffb2f2","#ff8fe1","#ff66cc","#ed49b4","#d42c9d","#bc0088","#9b006b","#7b0052"],
      "cyan":  ["#d6f7ff","#b2ecff","#85daff","#5cc5fc","#31adfb","#0594fa","#007edf","#0068c0","#00549e","#00417d"]
    }
  }
}
```


# rule 
## rule variables
- `[U]` width/height/text unit value, `p` means percent, `d` means decimal, `p5`=5%, `p50`=50%, `d5`=0.5, `d05`=0.05 
- `[C]` color name, as theme name
- `[N]` order number for colors or others, only number
- `[A]` color alpha, also means opacity, `a5` means 0.5, `a05` means 0.05


## rule syntax

| order | package              | syntax list                                                                                                                                                                                                                    |
|:-----:|----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|   1   | spacing.padding.core | `safe-bottom`                                                                                                                                                                                                                  |
|   2   | spacing.padding.ext  | `p-[U]`   `px-[U]`   `py-[U]`   `pt-[U]`   `pb-[U]`   `pl-[U]`   `pr-[U]`                                                                                                                                                      |
|   3   | spacing.margin.ext   | `m-[U]`   `mx-[U]`   `my-[U]`   `mt-[U]`   `mb-[U]`   `ml-[U]`   `mr-[U]`                                                                                                                                                      |
|   4   | sizing.size.ext      | `wh-screen`   `wh-full`   `wh-[U]`                                                                                                                                                                                             |
|   5   | sizing.width.ext     | `w-full`   `w-[U]`   `mw-[U]`   `xw-[U]`                                                                                                                                                                                       |
|   6   | sizing.height.ext    | `h-full`   `h-[U]`   `mh-[U]`   `xh-[U]`                                                                                                                                                                                       |
|   7   | size.gap.ext         | `gap-[U]`   `gap-x-[U]`   `gap-y-[U]`                                                                                                                                                                                          |
|   8   | layout.float.core    | `pos-abs`   `pos-rel`   `pos-fix`   `pos-sticky`                                                                                                                                                                               |
|   9   | layout.float.ext     | `pos-tl-[U]`   `pos-tr-[U]`   `pos-bl-[U]`   `pos-br-[U]`   `top-[U]`   `bottom-[U]`   `left-[U]`   `right-[U]`   `z-[U]`                                                                                                      |
|  10   | layout.flex.core     | `flex-row`   `flex-col`   `flex-row-r`   `flex-col-r`   `flex-wrap`   `flex-cc`   `flex-lc`   `flex-rc`   `ai-start`   `ai-center`   `ai-end`   `jc-start`   `jc-center`   `jc-end`   `jc-between`   `jc-around`   `jc-evenly` |
|  11   | layout.flex.ext      | `c[N]`   `order-[N]`                                                                                                                                                                                                           |
|  12   | layout.grid.ext      | `grid-[N]c`   `col-span-full`   `col-span-[N]`   `col-start-[N]`   `col-end-[N]`   `grid-[N]r`   `row-span-full`   `row-span-[N]`   `row-start-[N]`   `row-end-[N]`                                                            |
|  13   | layout.display.ext   | `in-block`   `block`   `inline`                                                                                                                                                                                                |
|  14   | layout.overflow.ext  | `overflow-auto`   `overflow-hidden`                                                                                                                                                                                            |
|  15   | text.size.ext        | `text-[U]`                                                                                                                                                                                                                     |
|  16   | text.color.ext       | `text-[C]-[N]-[A]`   `text-[C]-a[A]`   `text-[C]-[N]`   `text-[C]`                                                                                                                                                             |
|  17   | text.effect.core     | `text-left`   `text-center`   `text-right`   `text-break`   `text-bold`   `text-line`                                                                                                                                          |
|  18   | text.effect.ext      | `text-normal`   `text-line-p[N]`   `text-space-[U]`   `text-ellipsis`   `text-uppercase`                                                                                                                                       |
|  19   | bg.color.ext         | `bg-[C]-[N]-a[A]`   `bg-[C]-[N]`   `bg-[C]-a[A]`   `bg-[C]`                                                                                                                                                                    |
|  20   | effect.round.core    | `round`                                                                                                                                                                                                                        |
|  21   | effect.round.ext     | `round-[U]`   `round-top-[U]`   `round-bottom-[U]`   `round-left-[U]`   `round-right-[U]`   `round-tl-[U]`   `round-tr-[U]`   `round-bl-[U]`   `round-br-[U]`                                                                  |
|  22   | effect.border.core   | `border`   `border-left`   `border-right`   `border-top`   `border-bottom`   `border-transparent`                                                                                                                              |
|  23   | effect.border.ext    | `border-dashed`   `border-[U]`   `border-[C]-[N]-a[A]`   `border-[C]-[N]`   `border-[C]`                                                                                                                                       |
|  24   | effect.shadow.ext    | `shadow`   `shadow-1`   `shadow-2`   `shadow-3`   `shadow-4`   `shadow-5`                                                                                                                                                      |
|  25   | effect.opacity.ext   | `opacity-[N]`                                                                                                                                                                                                                  |
|  26   | transform.rotate.ext | `rotate-[N]`                                                                                                                                                                                                                   |
