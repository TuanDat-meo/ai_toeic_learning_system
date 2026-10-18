import { Suspense } from 'react';
import { CommunityPage } from '@/components/community/CommunityPage';

export default function Page() {
  return <Suspense fallback={null}><CommunityPage /></Suspense>;
}
