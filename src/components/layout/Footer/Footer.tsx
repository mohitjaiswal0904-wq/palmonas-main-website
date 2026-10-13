import { FooterBrandContentGate } from '@/components/layout/Footer/FooterBrandContentGate';
import { FooterRenderer } from '@/components/layout/Footer/FooterRenderer';
import { getFooterData } from '@/services/server/footer.service.server';

export async function Footer() {
  const { config, items } = await getFooterData();

  return (
    <>
      <FooterBrandContentGate />
      <FooterRenderer config={config} items={items} platform="web" />
    </>
  );
}
