import Footer from "@/components/layout/Footer";
import ProductDetail from "@/components/product/ProductDetail";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;

  return (
    <>
      <ProductDetail id={decodeURIComponent(id)} query={query} />
      <Footer />
    </>
  );
}
