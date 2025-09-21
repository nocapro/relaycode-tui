import React from 'react';
import { render } from 'ink';
import App from './src/App';

// Check if we're running in an interactive terminal
if (process.stdin.isTTY && process.stdout.isTTY) {
    render(<App />);
} else {
    process.stderr.write('Interactive terminal required. Please run in a terminal that supports raw input mode.\n');
    process.exit(1);
}
