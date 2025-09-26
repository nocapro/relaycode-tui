import { useState, useEffect, useMemo } from 'react';
import { useInput } from 'ink';
import { useReviewStore } from '../stores/review.store';
import { useTransactionStore, selectSelectedTransaction } from '../stores/transaction.store';

export const useReviewProcessingScreen = () => {
    const {
        applySteps,
        processingStartTime,
        isCancelling,
        patchStatus,
        actions: { cancelProcessing, skipCurrentStep },
    } = useReviewStore();

    const transaction = useTransactionStore(selectSelectedTransaction);
    const isProcessing = processingStartTime !== null;

    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (!isProcessing) return;
        const timer = setInterval(() => setNow(Date.now()), 100);
        return () => clearInterval(timer);
    }, [isProcessing]);

    const elapsedTime = isProcessing ? (now - processingStartTime) / 1000 : 0;

    const isSkippable = useMemo(() => {
        const activeStep = applySteps.find(step => step.status === 'active');
        return activeStep?.id === 'post-command';
    }, [applySteps]);

    // --- Input Handling ---

    // Handle Ctrl+C by listening to stdin. This is more reliable than useInput for Ctrl+C,
    // as it prevents the default terminal behavior of exiting the process.
    useEffect(() => {
        const onData = (data: Buffer) => {
            // Check for Ctrl+C
            if (data.toString() === '\u0003') {
                cancelProcessing();
            }
        };

        if (isProcessing && !isCancelling) {
            process.stdin.on('data', onData);
            return () => {
                process.stdin.removeListener('data', onData);
            };
        }
    }, [isProcessing, isCancelling, cancelProcessing]);

    useInput(
        (input) => {
            if (input.toLowerCase() === 's' && isSkippable) {
                skipCurrentStep();
            }
        },
        { isActive: isProcessing && !isCancelling },
    );

    return {
        transaction,
        applySteps,
        isProcessing,
        isCancelling,
        patchStatus,
        elapsedTime,
        now,
        isSkippable,
    };
};