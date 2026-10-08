import AcceptInvitation from './AcceptInvitation';

interface AcceptInvitationPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitationPage({ searchParams }: AcceptInvitationPageProps) {
  const { token } = await searchParams;
  return <AcceptInvitation token={token ?? ''} />;
}
