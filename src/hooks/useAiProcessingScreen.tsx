import { useState, useEffect } from 'react';
import { useReviewStore } from '../stores/review.store';
import { useTransactionStore, selectSelectedTransaction } from '../stores/transaction.store';

export const useAiProcessingScreen = () => {
    const transaction = useTransactionStore(selectSelectedTransaction);
    const { aiProcessingSteps, aiProcessingStartTime } = useReviewStore(s => ({
        aiProcessingSteps: s.aiProcessingSteps,
        aiProcessingStartTime: s.aiProcessingStartTime,
    }));

    const [now, setNow] = useState(Date.now());
    
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 100);
        return () => clearInterval(timer);
    }, []);

    const elapsedTime = aiProcessingStartTime ? (now - aiProcessingStartTime) / 1000 : 0;
    
    const isProcessing = !!aiProcessingStartTime;

    return {
        transaction,
        aiProcessingSteps,
        isProcessing,
        elapsedTime,
        now,
    };
};