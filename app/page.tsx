'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBoardContext } from './providers/BoardProvider';

export default function Home() {
  const { state } = useBoardContext();
  const router = useRouter();

  useEffect(() => {
    if (state.boardOrder.length > 0) {
      router.replace(`/board/${state.boardOrder[0]}`);
    }
  }, [state.boardOrder, router]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        color: 'var(--text-secondary)',
        fontSize: '15px',
      }}
    >
      Loading board...
    </div>
  );
}
