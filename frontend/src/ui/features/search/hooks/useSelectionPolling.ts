import { useEffect } from 'react';
import type { SelectionStatus } from '@/core/entities/selection';
import { useSelectionStore, useCompanyStore } from '@/store';

export function useSelectionPolling(
  selectionId: string | null,
  status: SelectionStatus | null,
) {
  const pollSelection = useSelectionStore((s) => s.pollSelection);
  const loadBySelection = useCompanyStore((s) => s.loadBySelection);

  useEffect(() => {
    if (!selectionId || status === 'completed' || status === 'failed') return;

    const interval = setInterval(() => {
      pollSelection();
    }, 3000);

    return () => clearInterval(interval);
  }, [selectionId, status, pollSelection]);

  useEffect(() => {
    if (status === 'completed' && selectionId) {
      loadBySelection(selectionId);
    }
  }, [status, selectionId, loadBySelection]);
}
