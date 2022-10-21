/**
 * log to console
 * @param args objects
 */
export const log = (...args: unknown[]) => console.log(nowString(), ...args)

/**
 * error to console
 * @param args objects
 */
export const error = (...args: unknown[]) => console.error(nowString(), ...args)

/**
 * return date time string of now, format is yyyy-MM-dd HH:mm:ss.zzz
 */
const nowString = (): string => {
    const now = new Date()
    const pad2 = (n: number) => n.toString().padStart(2, "0")
    return now.getFullYear().toString() + "-" + [now.getMonth() + 1, now.getDate()].map(pad2).join("-")
        + " " + [now.getHours(), now.getMinutes(), now.getSeconds()].map(pad2).join(":")
        + "." + +now.getMilliseconds().toString().padStart(3, "0")
}


/**
 * sleep and execute task
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
 * limit promise concurrent count
 * @param taskName task name
 * @param taskCount total task count
 * @param process promise function
 * @param limit concurrent count, default value is 5
 * @param showTaskStep flag if showing task step, default value is false
 */
export const promiseLimit = async <T>(taskName: string, taskCount: number, process: (taskIndex: number) => Promise<T>,
                                      limit: number = 5, showTaskStep: boolean = false): Promise<T[]> => {
    const taskResults: T[] = new Array<T>()

    // must log the beginning of task sequence
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
        const batchResult = await Promise.all(currentTasks)
        taskResults.push(...batchResult)
    }

    // must log the end of task sequence
    log(`[task] [${taskName}] finish ${taskCount} tasks`)

    return Promise.resolve(taskResults)
};
