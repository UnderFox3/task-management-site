import BoardView from '@/app/components/BoardView';

interface BoardPageProps {
  params: Promise<{
    boardId: string;
  }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;
  return <BoardView boardId={boardId} />;
}

export function generateMetadata() {
  return {
    title: 'Board – TaskFlow',
  };
}
