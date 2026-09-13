import ClientGroupDetailModule from "@/components/client-groups/ClientGroupDetailModule";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Group Details",
};

export default function ClientGroupDetailPage({ params }: { params: { id: string } }) {
  return <ClientGroupDetailModule groupId={params.id} />;
}
