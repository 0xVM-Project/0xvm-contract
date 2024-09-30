import * as readline from 'readline';

export function waitForKeypress(): Promise<void> {
    return new Promise((resolve) => {
        // Create an interface to read input
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        // Prompts the user to press any key
        rl.question('Press <Enter> key to continue... or ctrl+c to cancel ', () => {
            rl.close(); // Shut down the interface
            resolve();  // carry on with
        });
    });
}
