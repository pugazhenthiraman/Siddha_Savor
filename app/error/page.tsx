'use client';

import { ErrorPage } from '@/components/ui/ErrorPage';

export default function ErrorPageRoute() {
  const handleRetry = () => {
    // Try to reconnect or refresh
    window.location.reload();
  };

  return (
    <ErrorPage
      title="Connection Lost"
      message="We're having trouble connecting to our servers. This might be due to network issues or server maintenance."
      onRetry={handleRetry}
    />
  );
}
