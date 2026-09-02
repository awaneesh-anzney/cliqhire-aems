import ClientGroupsModule from "@/components/client-groups/ClientGroupsModule";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Groups",
  description: "Manage Client Groups and Conglomerates",
};

export default function ClientGroupsPage() {
  return <ClientGroupsModule />;
}
