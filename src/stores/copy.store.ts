import { create } from 'zustand';
import { moveIndex } from './navigation.utils';
import { useViewStore } from './view.store';
import { LoggerService } from '../services/logger.service';
import { CopyService } from '../services/copy.service';
import type { CopyItem } from '../types/copy.types';
import type { Transaction, FileItem } from '../types/domain.types';

export type { CopyItem };

interface CopyState {
    title: string;
    items: CopyItem[];
    selectedIndex: number;
    selectedIds: Set<string>;
    lastCopiedMessage: string | null;
    onClose?: () => void;

    actions: {
        open: (title: string, items: CopyItem[], onClose?: () => void) => void;
        close: () => void;
        openForReview: (transaction: Transaction, files: FileItem[], selectedFile?: FileItem) => void;
        openForDetail: (transaction: Transaction, selectedFile?: FileItem) => void;
        openForHistory: (transactions: Transaction[]) => void;
        navigateUp: () => void;
        navigateDown: () => void;
        toggleSelection: () => void;
        toggleSelectionById: (id: string) => void;
        executeCopy: () => void;
    };
}

export const useCopyStore = create<CopyState>((set, get) => ({
    title: '',
    items: [],
    selectedIndex: 0,
    selectedIds: new Set(),
    lastCopiedMessage: null,
    onClose: undefined,

    actions: {
        open: (title, items, onClose) => {
            const defaultSelectedIds = new Set(items.filter(i => i.isDefaultSelected).map(i => i.id));
            useViewStore.getState().actions.setActiveOverlay('copy');
            set({
                title,
                items,
                selectedIndex: 0,
                selectedIds: defaultSelectedIds,
                lastCopiedMessage: null,
                onClose,
            });
        },
        close: () => {
            useViewStore.getState().actions.setActiveOverlay('none');
            get().onClose?.();
            set({ items: [], onClose: undefined });
        },
        openForReview: (transaction, files, selectedFile) => {
            const { actions } = get();
            const title = 'Select data to copy from review:';
            const items = CopyService.getCopyItemsForReview(transaction, files, selectedFile);
            actions.open(title, items);
        },
        openForDetail: (transaction, selectedFile) => {
            const { actions } = get();
            const title = `Select data to copy from transaction ${transaction.hash}:`;
            const items = CopyService.getCopyItemsForDetail(transaction, selectedFile);
            actions.open(title, items);
        },
        openForHistory: (transactions) => {
            const { actions } = get();
            const title = `Select data to copy from ${transactions.length} transactions:`;
            const items = CopyService.getCopyItemsForHistory(transactions);
            actions.open(title, items);
        },
        navigateUp: () => set(state => ({
            selectedIndex: moveIndex(state.selectedIndex, 'up', state.items.length),
        })),
        navigateDown: () => set(state => ({
            selectedIndex: moveIndex(state.selectedIndex, 'down', state.items.length),
        })),
        toggleSelection: () => set(state => {
            const currentItem = state.items[state.selectedIndex];
            if (!currentItem) return {};
            const newSelectedIds = new Set(state.selectedIds);
            if (newSelectedIds.has(currentItem.id)) {
                newSelectedIds.delete(currentItem.id);
            } else {
                newSelectedIds.add(currentItem.id);
            }
            return { selectedIds: newSelectedIds };
        }),
        toggleSelectionById: (id: string) => set(state => {
            const newSelectedIds = new Set(state.selectedIds);
            if (newSelectedIds.has(id)) {
                newSelectedIds.delete(id);
            } else {
                newSelectedIds.add(id);
            }
            return { selectedIds: newSelectedIds };
        }),
        executeCopy: async () => {
            const { items, selectedIds } = get();
            const itemsToCopy = items.filter(i => selectedIds.has(i.id));
            if (itemsToCopy.length === 0) return;

            LoggerService.info(`Copying ${itemsToCopy.length} item(s) to clipboard.`);
            const dataPromises = itemsToCopy.map(item => item.getData());
            const resolvedData = await Promise.all(dataPromises);

            const content = itemsToCopy
                .map((item, index) => `--- ${item.label} ---\n${resolvedData[index]}`)
                .join('\n\n');
            const message = `Copied ${itemsToCopy.length} item(s) to clipboard.`;
            LoggerService.debug(`[CLIPBOARD MOCK] ${message}\n${content.substring(0, 200)}...`);
            set({ lastCopiedMessage: message });
        },
    },
}));