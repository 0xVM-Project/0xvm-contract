/**
 * Limit the number of concurrent tasks to execute in batches
 * @param tasks Array of callback functions for tasks to be executed
 * @param concurrencyLimit Maximum number of concurrent connections
 * @returns 
 */
export async function batchProcess<T>(tasks: Array<() => Promise<T>>, concurrencyLimit: number): Promise<T[]> {
    const results: T[] = [];
    let index = 0;
    const inProgress: Promise<void>[] = [];

    while (index < tasks.length || inProgress.length > 0) {
        // Start new tasks until the concurrency limit is reached
        while (inProgress.length < concurrencyLimit && index < tasks.length) {
            const currentTask = tasks[index++];
            const taskPromise = (async () => {
                const result = await currentTask();
                results.push(result);
            })();

            inProgress.push(taskPromise);

            // Remove completed tasks
            taskPromise.finally(() => inProgress.splice(inProgress.indexOf(taskPromise), 1));
        }

        // Wait for any task to complete
        await Promise.race(inProgress);
    }

    return results;
}