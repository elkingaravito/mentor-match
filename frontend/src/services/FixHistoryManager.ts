import { ConditionalRule } from '../components/analytics/ConditionalFormatting';

interface FixHistoryState {
    rules: ConditionalRule[];
    description: string;
    timestamp: number;
}

export class FixHistoryManager {
    private history: FixHistoryState[] = [];
    private currentIndex: number = -1;
    private maxHistory: number = 50;

    constructor(initialRules: ConditionalRule[]) {
        this.push(initialRules, 'Initial state');
    }

    push(rules: ConditionalRule[], description: string) {
        // Remove any future history if we're not at the latest state
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        // Add new state
        this.history.push({
            rules: JSON.parse(JSON.stringify(rules)), // Deep copy
            description,
            timestamp: Date.now()
        });

        // Maintain history limit
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
    }

    undo(): FixHistoryState | null {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            return this.history[this.currentIndex];
        }
        return null;
    }

    redo(): FixHistoryState | null {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            return this.history[this.currentIndex];
        }
        return null;
    }

    canUndo(): boolean {
        return this.currentIndex > 0;
    }

    canRedo(): boolean {
        return this.currentIndex < this.history.length - 1;
    }

    getCurrentState(): FixHistoryState {
        return this.history[this.currentIndex];
    }

    getHistory(): FixHistoryState[] {
        return this.history;
    }

    getHistoryPreview(steps: number = 5): FixHistoryState[] {
        const start = Math.max(0, this.currentIndex - steps);
        const end = Math.min(this.history.length, this.currentIndex + steps + 1);
        return this.history.slice(start, end);
    }
}