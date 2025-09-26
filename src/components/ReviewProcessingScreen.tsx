import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { type ApplyStep } from '../stores/review.store';
import Separator from './Separator';
import ActionFooter from './ActionFooter';
import { useReviewProcessingScreen } from '../hooks/useReviewProcessingScreen'; // This will be created
import { getReviewProcessingFooterActions } from '../constants/review.constants';

const ApplyStepRow = ({ step, isSubstep = false, now }: {
    step: ApplyStep;
    isSubstep?: boolean;
    now: number;
}) => {
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

    let durationText = '';
    if (!isSubstep) {
        if (step.status === 'active' && step.startTime) {
            durationText = ` (${((now - step.startTime) / 1000).toFixed(1)}s)`;
        } else if (step.duration) {
            durationText = ` (${step.duration.toFixed(1)}s)`;
        }
    }

    return (
        <Box flexDirection="column">
            <Text>
                <Text color={color}>{symbol}</Text> {step.title}{durationText}
            </Text>
            {step.details && (
                <Text color="gray">
                    {'     └─ '}{step.details}
                </Text>
            )}
            {step.substeps?.map((sub: ApplyStep, i: number) => (
                <ApplyStepRow key={i} step={sub} isSubstep={true} now={now} />
            ))}
        </Box>
    );
};

const ReviewProcessingScreen = () => {
    const {
        transaction,
        applySteps,
        isProcessing,
        isCancelling,
        patchStatus,
        elapsedTime,
        now,
        isSkippable,
    } = useReviewProcessingScreen();

    const failureCase = patchStatus === 'PARTIAL_FAILURE';

    const renderFooter = () => {
        if (isCancelling) {
            return <Text>Elapsed: {elapsedTime.toFixed(1)}s · Cancelling... Please wait.</Text>;
        }
        if (isProcessing) {
            return (
                <Box flexDirection="column" gap={1}>
                    <Text>Elapsed: {elapsedTime.toFixed(1)}s · Processing... Please wait.</Text>
                    <Separator />
                    <ActionFooter actions={getReviewProcessingFooterActions(isSkippable)} />
                </Box>
            );
        }
        if (failureCase) {
            return <Text>Elapsed: {elapsedTime.toFixed(1)}s · Transitioning to repair workflow...</Text>;
        }
        return <Text>Elapsed: {elapsedTime.toFixed(1)}s · Patch applied successfully. Transitioning...</Text>;
    };

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
                    {applySteps.map((step: ApplyStep) => <ApplyStepRow key={step.id} step={step} now={now} />)}
                </Box>
            </Box>
            <Separator />
            {renderFooter()}
        </Box>
    );
};

export default ReviewProcessingScreen;