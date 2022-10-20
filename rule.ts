export namespace rule {
    export const DefaultStyles = [
        {
            package: "component.tip.core",
            syntax: "tip-warn",
            compose: ['bg-orange-2', 'px-20', 'py-20', 'round-10', "flex-row", "ai-center", "gap-20"],
            units: ["20", "10"],
            colors: ["orange-2"]
        },
        {
            package: "component.tip.core",
            syntax: "tip-info",
            compose: ['bg-blue-2', 'px-20', 'py-20', 'round-10', "flex-row", "ai-center", "gap-20"],
            units: ["20", "10"],
            colors: ["blue-2"]
        },
        {
            package: "component.tip.core",
            syntax: "tip-error",
            compose: ['bg-red-2', 'px-20', 'py-20', 'round-10', "flex-row", "ai-center", "gap-20"],
            units: ["20", "10"],
            colors: ["red-2"]
        },
        {
            package: "component.tip.core",
            syntax: "tip-succ",
            compose: ['bg-green-2', 'px-20', 'py-20', 'round-10', "flex-row", "ai-center", "gap-20"],
            units: ["20", "10"],
            colors: ["green-2"]
        },
        {
            package: "component.tip.core",
            syntax: "tip-fail",
            compose: ['bg-gold-2', 'px-20', 'py-20', 'round-10', "flex-row", "ai-center", "gap-20"],
            units: ["20", "10"],
            colors: ["gold-2"]
        },
        {
            package: "spacing.padding.core",
            syntax: "safe-bottom",
            expr: "padding-bottom: env(safe-area-inset-bottom);"
        },
        {
            package: "spacing.padding.ext",
            syntax: "p-[U]",
            compose: ['pl-[U]', 'pr-[U]', 'pt-[U]', 'pb-[U]']
        },
        {
            package: "spacing.padding.ext",
            desc: "padding-x-axis",
            syntax: "px-[U]",
            compose: ['pl-[U]', 'pr-[U]']
        },
        {
            package: "spacing.padding.ext",
            desc: "padding-y-axis",
            syntax: "py-[U]",
            compose: ['pt-[U]', 'pb-[U]']
        },
        {
            package: "spacing.padding.ext",
            syntax: "pt-[U]",
            expr: "padding-top: var(--unit-[U]);"
        },
        {
            package: "spacing.padding.ext",
            syntax: "pb-[U]",
            expr: "padding-bottom: var(--unit-[U]);"
        },
        {
            package: "spacing.padding.ext",
            syntax: "pl-[U]",
            expr: "padding-left: var(--unit-[U]);"
        },
        {
            package: "spacing.padding.ext",
            syntax: "pr-[U]",
            expr: "padding-right: var(--unit-[U]);"
        },
        {
            package: "spacing.margin.ext",
            syntax: "m-[U]",
            compose: ['ml-[U]', 'mr-[U]', 'mt-[U]', 'mb-[U]']
        },
        {
            package: "spacing.margin.ext",
            desc: "margin-x-axis",
            syntax: "mx-[U]",
            compose: ['ml-[U]', 'mr-[U]']
        },
        {
            package: "spacing.margin.ext",
            desc: "margin-y-axis",
            syntax: "my-[U]",
            compose: ['mt-[U]', 'mb-[U]']
        },
        {
            package: "spacing.margin.ext",
            syntax: "mt-[U]",
            expr: "margin-top: var(--unit-[U]);"
        },
        {
            package: "spacing.margin.ext",
            syntax: "mb-[U]",
            expr: "margin-bottom: var(--unit-[U]);"
        },
        {
            package: "spacing.margin.ext",
            syntax: "ml-[U]",
            expr: "margin-left: var(--unit-[U]);"
        },
        {
            package: "spacing.margin.ext",
            syntax: "mr-[U]",
            expr: "margin-right: var(--unit-[U]);"
        },
        {
            package: "sizing.size.ext",
            syntax: "wh-screen",
            compose: ['w-p100', 'h-p100', 'pos-abs', 'top-0', 'bottom-0', 'left-0', 'right-0']
        },
        {
            package: "sizing.size.ext",
            syntax: "wh-full",
            compose: ['w-p100', 'h-p100']
        },
        {
            package: "sizing.size.ext",
            syntax: "wh-[U]",
            compose: ['w-[U]', 'h-[U]']
        },
        {
            package: "sizing.width.ext",
            syntax: "w-full",
            compose: ['w-p100']
        },
        {
            package: "sizing.width.ext",
            syntax: "w-[U]",
            expr: "width: var(--unit-[U]);"
        },
        {
            package: "sizing.width.ext",
            syntax: "mw-[U]",
            expr: "min-width: var(--unit-[U]);"
        },
        {
            package: "sizing.width.ext",
            syntax: "xw-[U]",
            expr: "max-width: var(--unit-[U]);"
        },
        {
            package: "sizing.height.ext",
            syntax: "h-full",
            compose: ['h-p100']
        },
        {
            package: "sizing.height.ext",
            syntax: "h-[U]",
            expr: "height: var(--unit-[U]);"
        },
        {
            package: "sizing.height.ext",
            syntax: "mh-[U]",
            expr: "min-height: var(--unit-[U]);"
        },
        {
            package: "sizing.height.ext",
            syntax: "xh-[U]",
            expr: "max-height: var(--unit-[U]);"
        },
        {
            package: "size.gap.ext",
            syntax: "gap-[U]",
            expr: "gap: var(--unit-[U]);"
        },
        {
            package: "size.gap.ext",
            syntax: "gap-x-[U]",
            expr: "row-gap: var(--unit-[U]);"
        },
        {
            package: "size.gap.ext",
            syntax: "gap-y-[U]",
            expr: "column-gap: var(--unit-[U]);"
        },
        {
            package: "layout.float.core",
            syntax: "pos-abs",
            expr: "position: absolute;"
        },
        {
            package: "layout.float.core",
            syntax: "pos-rel",
            expr: "position: relative;"
        },
        {
            package: "layout.float.core",
            syntax: "pos-fix",
            expr: "position: fixed;"
        },
        {
            package: "layout.float.core",
            syntax: "pos-sticky",
            expr: "position: sticky;"
        },
        {
            package: "layout.float.ext",
            desc: "top left corner",
            syntax: "pos-tl-[U]",
            compose: ['pos-abs', 'top-[U]', 'left-[U]']
        },
        {
            package: "layout.float.ext",
            desc: "top right corner",
            syntax: "pos-tr-[U]",
            compose: ['pos-abs', 'top-[U]', 'right-[U]']
        },
        {
            package: "layout.float.ext",
            desc: "bottom left corner",
            syntax: "pos-bl-[U]",
            compose: ['pos-abs', 'bottom-[U]', 'left-[U]']
        },
        {
            package: "layout.float.ext",
            desc: "bottom right corner",
            syntax: "pos-br-[U]",
            compose: ['pos-abs', 'bottom-[U]', 'right-[U]']
        },
        {
            package: "layout.float.ext",
            syntax: "top-[U]",
            expr: "top: var(--unit-[U]);"
        },
        {
            package: "layout.float.ext",
            syntax: "bottom-[U]",
            expr: "bottom: var(--unit-[U]);"
        },
        {
            package: "layout.float.ext",
            syntax: "left-[U]",
            expr: "left: var(--unit-[U]);"
        },
        {
            package: "layout.float.ext",
            syntax: "right-[U]",
            expr: "right: var(--unit-[U]);"
        },
        {
            package: "layout.float.ext",
            syntax: "z-[U]",
            expr: "z-Index: [U];"
        },
        {
            package: "layout.flex.core",
            syntax: "flex-row",
            expr: "display: -webkit-box; display: -webkit-flex; display:flex; flex-direction: row;"
        },
        {
            package: "layout.flex.core",
            syntax: "flex-col",
            expr: "display: -webkit-box; display: -webkit-flex; display:flex; flex-direction: column;"
        },
        {
            package: "layout.flex.core",
            syntax: "flex-row-r",
            expr: "display: -webkit-box; display: -webkit-flex; display:flex; flex-direction: row-reverse;"
        },
        {
            package: "layout.flex.core",
            syntax: "flex-col-r",
            expr: "display: -webkit-box; display: -webkit-flex; display:flex; flex-direction: column-reverse;"
        },
        {
            package: "layout.flex.core",
            syntax: "wrap",
            expr: "flex-wrap: wrap;"
        },
        {
            package: "layout.flex.core",
            syntax: "flex-cc",
            compose: ["flex-row", 'ai-center', 'jc-center']
        },
        {
            package: "layout.flex.core",
            syntax: "flex-lc",
            compose: ["flex-row", 'ai-center', 'jc-start']
        },
        {
            package: "layout.flex.core",
            syntax: "flex-rc",
            compose: ["flex-row", 'ai-center', 'jc-end']
        },
        {
            package: "layout.flex.core",
            syntax: "ai-start",
            expr: "-webkit-box-align: start;-webkit-align-items: flex-start;align-items: flex-start;"
        },
        {
            package: "layout.flex.core",
            syntax: "ai-center",
            expr: "-webkit-box-align: center;-webkit-align-items: center;align-items: center;"
        },
        {
            package: "layout.flex.core",
            syntax: "ai-end",
            expr: "-webkit-box-align: end;-webkit-align-items: flex-end;align-items: flex-end;"
        },
        {
            package: "layout.flex.core",
            syntax: "jc-start",
            expr: "-webkit-justify-content: flex-start; justify-content: flex-start;"
        },
        {
            package: "layout.flex.core",
            syntax: "jc-center",
            expr: "-webkit-justify-content: center; justify-content: center;"
        },
        {
            package: "layout.flex.core",
            syntax: "jc-end",
            expr: "-webkit-justify-content: flex-end; justify-content: flex-end;"
        },
        {
            package: "layout.flex.core",
            syntax: "jc-between",
            expr: "-webkit-justify-content: space-between; justify-content: space-between;"
        },
        {
            package: "layout.flex.core",
            syntax: "jc-around",
            expr: "-webkit-justify-content: space-around; justify-content: space-around;"
        },
        {
            package: "layout.flex.core",
            syntax: "jc-evenly",
            expr: "-webkit-justify-content: space-evenly; justify-content: space-evenly;"
        },
        {
            package: "layout.flex.ext",
            syntax: "c[N]",
            expr: "display:flex; -webkit-box-flex: [N]; -webkit-flex: [N]; flex: [N];"
        },
        {
            package: "layout.flex.ext",
            syntax: "order-[N]",
            expr: "order: [N];"
        },
        {
            package: "layout.grid.ext",
            syntax: "grid-[N]c",
            expr: "display:grid; grid-template-columns: repeat([N], minmax(0, 1fr));"
        },
        {
            package: "layout.grid.ext",
            syntax: "col-span-full",
            expr: "grid-column: span 1 / span -1;"
        },
        {
            package: "layout.grid.ext",
            syntax: "col-span-[N]",
            expr: "grid-column: span [N] / span [N];"
        },
        {
            package: "layout.grid.ext",
            syntax: "col-start-[N]",
            expr: "grid-column-start: [N];"
        },
        {
            package: "layout.grid.ext",
            syntax: "col-end-[N]",
            expr: "grid-column-end: [N];"
        },
        {
            package: "layout.grid.ext",
            syntax: "grid-[N]r",
            expr: "display:grid; grid-template-rows: repeat([N], minmax(0, 1fr));"
        },
        {
            package: "layout.grid.ext",
            syntax: "row-span-full",
            expr: "grid-row: span 1 / span -1;"
        },
        {
            package: "layout.grid.ext",
            syntax: "row-span-[N]",
            expr: "grid-row: span [N] / span [N];"
        },
        {
            package: "layout.grid.ext",
            syntax: "row-start-[N]",
            expr: "grid-row-start: [N];"
        },
        {
            package: "layout.grid.ext",
            syntax: "row-end-[N]",
            expr: "grid-row-end: [N];"
        },
        {
            package: "layout.display.ext",
            syntax: "in-block",
            expr: "display: inline-block;"
        },
        {
            package: "layout.display.ext",
            syntax: "block",
            expr: "display: block;"
        },
        {
            package: "layout.display.ext",
            syntax: "inline",
            expr: "display: inline;"
        },
        {
            package: "layout.overflow.ext",
            syntax: "overflow-auto",
            expr: "overflow: auto;"
        },
        {
            package: "layout.overflow.ext",
            syntax: "overflow-hidden",
            expr: "overflow: hidden;"
        },
        {
            package: "text.size.ext",
            syntax: "text-[U]",
            expr: "font-size: var(--unit-[U]);"
        },
        {
            package: "text.color.ext",
            syntax: "text-[C]-[N]-[A]",
            expr: "color: var(--color-[C]-[N]-[A]);"
        },
        {
            package: "text.color.ext",
            syntax: "text-[C]-a[A]",
            expr: "color: var(--color-[C]-1-[A]);"
        },
        {
            package: "text.color.ext",
            syntax: "text-[C]-[N]",
            expr: "color: var(--color-[C]-[N]);"
        },
        {
            package: "text.color.ext",
            syntax: "text-[C]",
            expr: "color: var(--color-[C]-1);"
        },
        {
            package: "text.effect.core",
            syntax: "text-left",
            expr: "text-align: left;"
        },
        {
            package: "text.effect.core",
            syntax: "text-center",
            expr: "text-align: center;"
        },
        {
            package: "text.effect.core",
            syntax: "text-right",
            expr: "text-align: right;"
        },
        {
            package: "text.effect.core",
            syntax: "text-break",
            expr: "word-wrap: break-word; word-break: break-all;"
        },
        {
            package: "text.effect.core",
            syntax: "text-bold",
            expr: "font-weight: bold;"
        },
        {
            package: "text.effect.ext",
            syntax: "text-normal",
            expr: "font-weight: normal;"
        },
        {
            package: "text.effect.core",
            syntax: "text-line",
            expr: "text-decoration: line-through;"
        },
        {
            package: "text.effect.ext",
            syntax: "text-line-p[N]",
            expr: "line-height: [N]%"
        },
        {
            package: "text.effect.ext",
            syntax: "text-space-[U]",
            expr: "letter-spacing: [U]"
        },
        {
            package: "text.effect.ext",
            syntax: "text-ellipsis",
            expr: "overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
        },
        {
            package: "text.effect.ext",
            syntax: "text-uppercase",
            expr: "text-transform: uppercase;"
        },
        {
            package: "bg.color.ext",
            syntax: "bg-[C]-[N]-a[A]",
            expr: "background-color: var(--color-[C]-[N]-[A]);"
        },
        {
            package: "bg.color.ext",
            syntax: "bg-[C]-[N]",
            expr: "background-color: var(--color-[C]-[N]);"
        },
        {
            package: "bg.color.ext",
            syntax: "bg-[C]-a[A]",
            expr: "background-color: var(--color-[C]-1-[A]);"
        },
        {
            package: "bg.color.ext",
            syntax: "bg-[C]",
            expr: "background-color: var(--color-[C]-1);"
        },
        {
            package: "effect.round.core",
            syntax: "round",
            expr: "border-radius: 50%; display: flex; overflow: hidden;"
        },
        {
            package: "effect.round.ext",
            syntax: "round-[U]",
            expr: "-webkit-border-radius: var(--unit-[U]); border-radius: var(--unit-[U]);"
        },
        {
            package: "effect.round.ext",
            syntax: "round-top-[U]",
            compose: ["round-tl-[U]", "round-tr-[U]"]
        },
        {
            package: "effect.round.ext",
            syntax: "round-bottom-[U]",
            compose: ["round-bl-[U]", "round-br-[U]"]
        },
        {
            package: "effect.round.ext",
            syntax: "round-left-[U]",
            compose: ["round-tl-[U]", "round-bl-[U]"]
        },
        {
            package: "effect.round.ext",
            syntax: "round-right-[U]",
            compose: ["round-tr-[U]", "round-br-[U]"]
        },
        {
            package: "effect.round.ext",
            syntax: "round-tl-[U]",
            expr: "-webkit-top-left-border-radius: var(--unit-[U]); border-top-left-radius: var(--unit-[U]);"
        },
        {
            package: "effect.round.ext",
            syntax: "round-tr-[U]",
            expr: "-webkit-top-right-border-radius: var(--unit-[U]); border-top-right-radius: var(--unit-[U]);"
        },
        {
            package: "effect.round.ext",
            syntax: "round-bl-[U]",
            expr: "-webkit-bottom-left-border-radius: var(--unit-[U]); border-bottom-left-radius: var(--unit-[U]);"
        },
        {
            package: "effect.round.ext",
            syntax: "round-br-[U]",
            expr: "-webkit-bottom-right-border-radius: var(--unit-[U]); border-bottom-right-radius: var(--unit-[U]);"
        },
        {
            package: "effect.border.core",
            syntax: "border",
            expr: "border: var(--unit-d5) solid var(--color-gray-4);"
        },
        {
            package: "effect.border.core",
            syntax: "border-left",
            expr: "border-left: var(--unit-d5) solid var(--color-gray-4);"
        },
        {
            package: "effect.border.core",
            syntax: "border-right",
            expr: "border-right: var(--unit-d5) solid var(--color-gray-4);"
        },
        {
            package: "effect.border.core",
            syntax: "border-top",
            expr: "border-top: var(--unit-d5) solid var(--color-gray-4);"
        },
        {
            package: "effect.border.core",
            syntax: "border-bottom",
            expr: "border-bottom: var(--unit-d5) solid var(--color-gray-4);"
        },
        {
            package: "effect.border.ext",
            syntax: "border-dashed",
            expr: "border-style: dashed;",
        },
        {
            package: "effect.border.core",
            syntax: "border-transparent",
            expr: "border-color: transparent;",
        },
        {
            package: "effect.border.ext",
            syntax: "border-[U]",
            expr: "border-width: var(--unit-[U]);",
        },
        {
            package: "effect.border.ext",
            syntax: "border-[C]-[N]-a[A]",
            expr: "border-color: var(--color-[C]-[N]-[A]);",
        },
        {
            package: "effect.border.ext",
            syntax: "border-[C]-[N]",
            expr: "border-color: var(--color-[C]-[N]);",
        },
        {
            package: "effect.border.ext",
            syntax: "border-[C]",
            expr: "border-color: var(--color-[C]-1);",
        },
        {
            package: "effect.shadow.ext",
            syntax: "shadow",
            compose: ["shadow-3"]
        },
        {
            package: "effect.shadow.ext",
            syntax: "shadow-1",
            expr: "box-shadow: 0 var(--unit-2) var(--unit-4) var(--color-gray-5-a07);"
        },
        {
            package: "effect.shadow.ext",
            syntax: "shadow-2",
            expr: "box-shadow: 0 var(--unit-4) var(--unit-8) var(--color-gray-5-a06);"
        },
        {
            package: "effect.shadow.ext",
            syntax: "shadow-3",
            expr: "box-shadow: 0 var(--unit-6) var(--unit-12) var(--color-gray-5-a05);"
        },
        {
            package: "effect.shadow.ext",
            syntax: "shadow-4",
            expr: "box-shadow: 0 var(--unit-8) var(--unit-16) var(--color-gray-5-a04);"
        },
        {
            package: "effect.shadow.ext",
            syntax: "shadow-5",
            expr: "box-shadow: 0 var(--unit-10) var(--unit-20) var(--color-gray-5-a04);"
        },
        {
            package: "effect.opacity.ext",
            syntax: "opacity-[N]",
            expr: "opacity: 0.[N];"
        },
        {
            package: "transform.rotate.ext",
            syntax: "rotate-[N]",
            expr: "transform: rotate([N]deg); webkit-transform: rotate([N]deg);",
        },
        {
            package: "transform.duration.ext",
            syntax: "duration-[N]",
            expr: "transition-duration: [N]ms;",
        },
        {
            package: "transform.delay.ext",
            syntax: "delay-[N]",
            expr: "transition-delay: [N]ms;",
        },
        {
            package: "transform.ease.ext",
            syntax: "ease-linear",
            expr: "transition-timing-function: linear;",
        },
        {
            package: "transform.ease.ext",
            syntax: "ease-in",
            expr: "transition-timing-function: cubic-bezier(0.4, 0, 1, 1);",
        },
        {
            package: "transform.ease.ext",
            syntax: "ease-out",
            expr: "transition-timing-function: cubic-bezier(0, 0, 0.2, 1);",
        },
        {
            package: "transform.ease.ext",
            syntax: "ease-in-out",
            expr: "transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);",
        },
        {
            package: "transform.animate.ext",
            syntax: "@keyframes spin",
            expr: "from { transform: rotate(0deg); } to { transform: rotate(360deg); }",
        },
        {
            package: "transform.animate.ext",
            syntax: "@keyframes ping",
            expr: "75%, 100% { transform: scale(2); opacity: 0; }",
        },
        {
            package: "transform.animate.ext",
            syntax: "@keyframes pulse",
            expr: "0%, 100% { opacity: 1; } 50% { opacity: 0.5; }",
        },
        {
            package: "transform.animate.ext",
            syntax: "@keyframes bounce",
            expr: "0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); } 50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }",
        },
        {
            package: "transform.animate.ext",
            syntax: "animate-spin",
            expr: "animation: spin 1s linear infinite;",
            dependencies: ["@keyframes spin"]
        },
        {
            package: "transform.animate.ext",
            syntax: "animate-ping",
            expr: "animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;",
            dependencies: ["@keyframes ping"]
        },
        {
            package: "transform.animate.ext",
            syntax: "animate-pulse",
            expr: "animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;",
            dependencies: ["@keyframes pulse"]
        },
        {
            package: "transform.animate.ext",
            syntax: "animate-bounce",
            expr: "animation: bounce 1s infinite;",
            dependencies: ["@keyframes bounce"]
        },
    ]
}