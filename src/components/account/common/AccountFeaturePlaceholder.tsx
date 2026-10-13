import { ACCOUNT_DETAIL_PAGE_CLASS } from '@/components/account/common/account-layout';

interface AccountFeaturePlaceholderProps {
  title: string;
  description?: string;
}

export function AccountFeaturePlaceholder({
  title,
  description = 'This section will be available soon.',
}: AccountFeaturePlaceholderProps) {
  return (
    <section
      className={`${ACCOUNT_DETAIL_PAGE_CLASS} rounded-2xl border border-[#EFEFEF] bg-white p-8`}
      aria-label={title}
    >
      <h1 className="text-lg font-bold text-[#151515]">{title}</h1>
      <p className="mt-3 text-sm font-normal text-[#757575]">{description}</p>
    </section>
  );
}
