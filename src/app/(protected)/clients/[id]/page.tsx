import ClientDetailsModule from "@/components/clients/ClientDetailsModule";

interface PageProps {
  params: { id: string };
}

export default function ClientIdPage({ params }: PageProps) {
  return <ClientDetailsModule id={params.id} moduleType="clients" />;
}
