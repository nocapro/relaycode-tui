import { useSettingsStore } from '../stores/settings.store';
import { sleep } from '../utils';
import type { Transaction, FileItem } from '../types/domain.types';

// From review.service.ts to make the simulation more interesting
const mockAiFixFiles = [
    'src/components/Button.tsx',
    'src/components/data-table/DataTable.tsx',
    'src/components/forms/Input.tsx',
    'src/hooks/useForm.ts',
    'src/hooks/useDebounce.ts',
    'src/styles/theme.css',
    'src/utils/string-formatters.ts',
    'src/pages/HomePage.tsx',
    'src/pages/AboutPage.tsx',
    'src/services/api-client.ts',
    'src/stores/user.store.ts',
    'src/constants/routes.ts',
    'src/features/auth/LoginScreen.tsx',
    'src/features/auth/SignupForm.tsx',
    'src/features/dashboard/components/OverviewChart.tsx',
    'src/features/settings/ProfileEditor.tsx',
    'src/core/App.tsx',
    'src/services/payment.gateway.ts',
    'src/services/notification.service.ts',
    'src/components/UserProfile.tsx',
];

// Mock function to simulate running an auto-fix with an AI
async function* runAutoFix(
    failedFiles: FileItem[],
    _transaction: Transaction,
): AsyncGenerator<any, { newPatch: string }, unknown> {
    const { model } = useSettingsStore.getState();

    yield { type: 'UPDATE_STEP', payload: { id: 'prompt', status: 'active' } };
    await sleep(200);
    yield { type: 'UPDATE_STEP', payload: { id: 'prompt', status: 'done', details: `Generated prompts for ${failedFiles.length} files.` } };

    yield { type: 'UPDATE_STEP', payload: { id: 'request', status: 'active' } };

    const filesToFix: Pick<FileItem, 'id' | 'path'>[] = [
        ...failedFiles,
        ...mockAiFixFiles.slice(0, 20).map(path => ({ id: path, path })),
    ];

    // Start all fixes in parallel
    for (const file of filesToFix) {
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'request', substep: { id: file.id, title: `Fixing: ${file.path}`, status: 'active' }}};
    }

    // Simulate them finishing at different times
    const shuffledFiles = [...filesToFix].sort(() => Math.random() - 0.5);
    for (const file of shuffledFiles) {
        await sleep(Math.random() * 200 + 50); // Simulate network latency + processing time
        const success = Math.random() > 0.1; // 90% success rate
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'request', substepId: file.id, status: success ? 'done' : 'failed' }};
    }

    yield { type: 'UPDATE_STEP', payload: { id: 'request', status: 'done', details: `Received responses for ${filesToFix.length} files from '${model}'` } };

    yield { type: 'UPDATE_STEP', payload: { id: 'parse', status: 'active' } };
    await sleep(300);
    yield { type: 'UPDATE_STEP', payload: { id: 'parse', status: 'done', details: 'Validated and formatted AI responses.' } };

    yield { type: 'UPDATE_STEP', payload: { id: 'apply', status: 'active' } };
    // In a real app, we'd only apply successful responses
    for (const file of filesToFix) {
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'apply', substep: { id: file.id, title: `Applying: ${file.path}`, status: 'active' }}};
    }

    const shuffledApply = [...filesToFix].sort(() => Math.random() - 0.5);
    for (const file of shuffledApply) {
        await sleep(Math.random() * 100 + 25);
        const success = Math.random() > 0.05; // 95% success rate
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'apply', substepId: file.id, status: success ? 'done' : 'failed' }};
    }

    yield { type: 'UPDATE_STEP', payload: { id: 'apply', status: 'done', details: 'Applied patches to memory.' } };

    // The structure of what's returned might change if we are applying multiple patches
    // but for now, we'll keep the existing signature.
    const newPatch = `--- a/src/services/payment.gateway.ts
+++ b/src/services/payment.gateway.ts
@@ -10,7 +10,7 @@
  */
 export class PaymentGateway {
 -    private static instance: PaymentGateway;
+    private static instance: PaymentGateway | null = null;
     private apiKey: string;
 
     private constructor(apiKey: string) {
`;
    yield { type: 'UPDATE_STEP', payload: { id: 'patch', status: 'done', details: 'Validated and formatted new patch.' } };

    await sleep(500);

    return { newPatch };
}

export const AiService = {
    runAutoFix,
};