import CollectionDetailView from "@/components/collection/CollectionDetailView";

export default async function CollectionByHandlePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return <CollectionDetailView handle={decodeURIComponent(handle)} />;
}
