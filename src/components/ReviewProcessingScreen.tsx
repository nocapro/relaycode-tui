import React from 'react';
import { Box, Text } from 'ink';
import { useTransactionStore } from '../stores/transaction.store';
import { useUIStore } from '../stores/ui.store';
import type { ApplyStep } from '../types/view.types';
import Separator from './Separator';
import { useStdoutDimensions } from '../utils';

const ApplyStepRow = ({ step, isSubstep = false }: { step: ApplyStep, isSubstep?: boolean }) => {
    if (isSubstep) {
        let color;
        if (step.status === 'done' && step.title.startsWith('[✓]')) color = 'green';
        if (step.status === 'failed') color = 'red';

        return (
            <Text color={color}>
                {'     └─ '}{step.title}
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
            {step.substeps?.map((sub, i) => (
                <ApplyStepRow key={i} step={sub} isSubstep={true} />
            ))}
        </Box>
    );
};

const ReviewProcessingScreen = () => {
    const { selectedTransactionId, review_patchStatus, review_applySteps } = useUIStore(state => ({
        selectedTransactionId: state.selectedTransactionId,
        review_patchStatus: state.review_patchStatus,
        review_applySteps: state.review_applySteps,
    }));
    const transaction = useTransactionStore(s => s.transactions.find(t => t.id === selectedTransactionId));
    const [width] = useStdoutDimensions();

    const totalDuration = review_applySteps.reduce((acc, step) => acc + (step.duration || 0), 0);
    const failureCase = review_patchStatus === 'PARTIAL_FAILURE';
    const footerText = failureCase
        ? `Elapsed: ${totalDuration.toFixed(1)}s · Transitioning to repair workflow...`
        : `Elapsed: ${totalDuration.toFixed(1)}s · Processing... Please wait.`;

    if (!transaction) {
        return <Text>Loading...</Text>;
    }

    return (
        <Box flexDirection="column">
            <Text color="cyan">▲ relaycode apply</Text>
            <Separator width={width} />
            <Box marginY={1} flexDirection="column">
                <Text>Applying patch {transaction.hash}... ({transaction.message})</Text>
                <Box flexDirection="column" marginTop={1} gap={1}>
                    {review_applySteps.map(step => <ApplyStepRow key={step.id} step={step} />)}
                </Box>
            </Box>
            <Separator width={width} />
            <Text>{footerText}</Text>
        </Box>
    );
};

export default ReviewProcessingScreen;