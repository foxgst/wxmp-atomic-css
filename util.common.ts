/**
 * log to console
 * @param args objects
 */
export const log = (...args: unknown[]) => {
    const now = new Date()
    const at = `${now.getFullYear()}-${now.getMonth()}-${now.getDate() + 1} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`
    console.log(at.padEnd(22, " "), ...args)
}

/**
 * sleep and do task
 * @param delay sleep milliseconds
 */
export const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

/**
 * mark a timestamp and return escaped time
 */
export const timing = (): { at: number, es: () => number } => {
    const at = new Date().getTime()
    return {at, es: () => new Date().getTime() - at}
}

/**
 * limit promise count
 * @param taskName task name
 * @param taskCount total task count
 * @param limit concurrent count
 * @param showTaskStep if showing task step
 * @param process promise function
 */
export const promiseLimit = async <T>(taskName: string, taskCount: number, limit: number, showTaskStep: boolean, process: (taskIndex: number) => Promise<T>): Promise<T[]> => {
    const result: T[] = []

    log(`[task] [${taskName}] begin ${taskCount} tasks`)
    for (let i = 0; i < taskCount; i += limit) {
        const currentTasks: Promise<T>[] = new Array<Promise<T>>()
        for (let j = 0; j < limit && i + j < taskCount; j++) {
            const taskIndex = i + j
            if (showTaskStep) {
                log(`[task] [${taskName}] ${taskIndex + 1}/${taskCount}`)
            }
            currentTasks.push(process(taskIndex))
        }
        const taskResult = await Promise.all(currentTasks)
        result.push(...taskResult)
    }
    log(`[task] [${taskName}] finish ${taskCount} tasks`)
    return Promise.resolve(result)
};
