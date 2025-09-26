import { Box, Text } from 'ink';
import { useEffect, useState } from 'react';
import Spinner from 'ink-spinner';
import { useTransactionStore } from '../stores/transaction.store';
import { useViewStore } from '../stores/view.store';
import { useReviewStore, type ApplyStep } from '../stores/review.store';
import Separator from './Separator';

const ApplyStepRow = ({ step, isSubstep = false }: { step: ApplyStep; isSubstep?: boolean }) => {
    if (isSubstep) {
        let color: string | undefined;
        let symbol: React.ReactNode;

        switch (step.status) {
            case 'pending':
                symbol = '○';
                color = 'gray';
                break;
            case 'active':
                symbol = <Text color="cyan"><Spinner type="dots" /></Text>;
                break;
            case 'done':
                symbol = '✓';
                color = 'green';
                break;
            case 'failed':
                symbol = '✗';
                color = 'red';
                break;
            default:
                symbol = ' ';
        }

        return (
            <Text color={color}>
                {'     └─ '}{symbol}{' '}{step.title}
            </Text>
        );
    }

    let symbol;
    let color;
    switch (step.status) {
        case 'pending': symbol = '( )'; break;
        case 'active': symbol = '(●)'; color = 'cyan'; break;
        case 'done': symbol = '[✓]'; color = 'green'; break;
        case 'failed': symbol = '[!]'; color = 'red'; break;
        case 'skipped': symbol = '(-)'; color = 'gray'; break;
    }

    return (
        <Box flexDirection="column">
            <Text>
                <Text color={color}>{symbol}</Text> {step.title} {step.duration && !isSubstep && `(${step.duration}s)`}
            </Text>
            {step.details && (
                <Text color="gray">
                    {'     └─ '}{step.details}
                </Text>
            )}
            {step.substeps?.map((sub: ApplyStep, i: number) => (
                <ApplyStepRow key={i} step={sub} isSubstep={true} />
            ))}
        </Box>
    );
};

const ReviewProcessingScreen = () => {
    const selectedTransactionId = useViewStore(s => s.selectedTransactionId);
    const { patchStatus, applySteps, processingStartTime } = useReviewStore(state => ({
        patchStatus: state.patchStatus,
        applySteps: state.applySteps,
        processingStartTime: state.processingStartTime,
    }));
    const transaction = useTransactionStore(s => s.transactions.find(t => t.id === selectedTransactionId));

    const isProcessing = applySteps.some(s => s.status === 'pending' || s.status === 'active');
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        let timerId: ReturnType<typeof setTimeout> | undefined;

        if (isProcessing && processingStartTime) {
            timerId = setInterval(() => {
                setElapsedTime((Date.now() - processingStartTime) / 1000);
            }, 50);
        } else {
            const totalDuration = applySteps.reduce((acc, step) => acc + (step.duration || 0), 0);
            setElapsedTime(totalDuration);
        }

        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, [isProcessing, processingStartTime, applySteps]);

    const failureCase = patchStatus === 'PARTIAL_FAILURE';

    let footerText;
    if (isProcessing) {
        footerText = `Elapsed: ${elapsedTime.toFixed(1)}s · Processing... Please wait.`;
    } else if (failureCase) {
        footerText = `Elapsed: ${elapsedTime.toFixed(1)}s · Transitioning to repair workflow...`;
    } else {
        footerText = `Elapsed: ${elapsedTime.toFixed(1)}s · Patch applied successfully. Transitioning...`;
    }

    if (!transaction) {
        return <Text>Loading...</Text>;
    }

    return (
        <Box flexDirection="column">
            <Text bold color="black" backgroundColor="yellow"> ▲ relaycode · APPLYING PATCH </Text>
            <Separator />
            <Box marginY={1} flexDirection="column">
                <Text>Applying patch {transaction.hash}... ({transaction.message})</Text>
                <Box flexDirection="column" marginTop={1} gap={1}>
                    {applySteps.map((step: ApplyStep) => <ApplyStepRow key={step.id} step={step} />)}
                </Box>
            </Box>
            <Separator />
            <Text>{footerText}</Text>
        </Box>
    );
};

export default ReviewProcessingScreen;