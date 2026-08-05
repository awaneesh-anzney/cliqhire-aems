import ClientDetailsModule from "@/components/clients/ClientDetailsModule";

interface PageProps {
  params: { id: string };
}

export default function LeadIdPage({ params }: PageProps) {
  return <ClientDetailsModule id={params.id} moduleType="leads" />;
}
