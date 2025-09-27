import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { type ApplyStep } from '../stores/review.store'; // ApplyStep can be reused
import ActionFooter from './ActionFooter';
import { useAiProcessingScreen } from '../hooks/useAiProcessingScreen';
import Separator from './Separator';
import ScreenLayout from './layout/ScreenLayout';

// This component is based on ReviewProcessingScreen's ApplyStepRow,
// but adapted to show durations for substeps as well.
const ProcessingStepRow = ({ step, isSubstep = false, now }: {
    step: ApplyStep;
    isSubstep?: boolean;
    now: number;
}) => {
    if (isSubstep) {
        let color: string | undefined;
        let symbol: React.ReactNode;

        switch (step.status) {
            case 'pending': symbol = '○'; color = 'gray'; break;
            case 'active': symbol = <Text color="cyan"><Spinner type="dots" /></Text>; break;
            case 'done': symbol = '✓'; color = 'green'; break;
            case 'failed': symbol = '✗'; color = 'red'; break;
            default: symbol = ' ';
        }

        return (
            <Text>
                {'     └─ '}<Text color={color}>{symbol}</Text>{' '}{step.title}
            </Text>
        );
    }

    let durationText = '';
    // This logic is kept similar to ReviewProcessingScreen for consistency
    if (!isSubstep) {
        if (step.status === 'active' && step.startTime) {
            durationText = ` (${((now - step.startTime) / 1000).toFixed(1)}s)`;
        } else if (step.duration) {
            durationText = ` (${step.duration.toFixed(1)}s)`;
        }
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
                <Text color={color}>{symbol}</Text> {step.title}{durationText}
            </Text>
            {step.details && (
                <Text color="gray">
                    {'     └─ '}{step.details}
                </Text>
            )}
            {step.substeps?.map((sub: ApplyStep, i: number) => (
                <ProcessingStepRow key={i} step={sub} isSubstep={true} now={now} />
            ))}
        </Box>
    );
};

const AiProcessingScreen = () => {
    const {
        transaction,
        aiProcessingSteps,
        isProcessing,
        elapsedTime,
        now,
    } = useAiProcessingScreen();

    const renderFooter = () => {
        if (isProcessing) {
            return (
                <Box flexDirection="column" gap={1}>
                    <Text>Elapsed: {elapsedTime.toFixed(1)}s · Processing... Please wait.</Text>
                    <Separator />
                    <ActionFooter actions={[{ key: 'Ctrl+C', label: 'Cancel Process' }]} />
                </Box>
            );
        }
        return <Text>Elapsed: {elapsedTime.toFixed(1)}s · Repair complete. Transitioning...</Text>;
    };

    if (!transaction) {
        return <Text>Loading...</Text>;
    }

    const failedFilesCount = aiProcessingSteps.find(s => s.id === 'request')?.substeps?.length || 0;

    return (
        <ScreenLayout
            title="AI AUTO-REPAIR"
            footer={renderFooter()}
        >
            <Box flexDirection="column">
                <Text>Attempting to auto-repair {failedFilesCount > 0 ? `${failedFilesCount} ` : ''}files... ({transaction.message})</Text>
                <Box flexDirection="column" marginTop={1} gap={1}>
                    {aiProcessingSteps.map((step: ApplyStep) => <ProcessingStepRow key={step.id} step={step} now={now} />)}
                </Box>
            </Box>
        </ScreenLayout>
    );
};

export default AiProcessingScreen;