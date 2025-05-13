import { PageHeader } from '@/components/shared/page-header';
import { AiSplitForm } from '@/components/forms/ai-split-form';

export default function AISplitPage() {
  return (
    <>
      <PageHeader
        title="AI Training Split Suggester"
        description="Get a personalized training split recommendation from our AI coach."
      />
      <AiSplitForm />
    </>
  );
}
