"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getClientGroupById, linkClientToGroup, deleteClientGroup } from "@/services/clientService";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Building2, MoreVertical, Edit, Trash2, Merge, Loader2, Plus, Users, Briefcase } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CreateGroupModal } from "./CreateGroupModal";
import { AddClientToGroupModal } from "./AddClientToGroupModal";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
// We'll assume MergeGroupModal will be created
import { MergeGroupModal } from "./MergeGroupModal";

interface ClientGroupDetailModuleProps {
  groupId: string;
}

export default function ClientGroupDetailModule({ groupId }: ClientGroupDetailModuleProps) {
  const router = useRouter();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["clientGroup", groupId],
    queryFn: () => getClientGroupById(groupId),
  });

  const handleRemoveMember = async (clientId: string) => {
    try {
      await linkClientToGroup(clientId, null);
      toast.success("Client removed from group");
      refetch();
    } catch (error) {
      toast.error("Failed to remove client from group");
    }
  };

  const handleDeleteGroup = async (force: boolean = false) => {
    try {
      setIsDeleting(true);
      await deleteClientGroup(groupId, force);
      toast.success("Client group deleted");
      router.push("/client-groups");
    } catch (error: any) {
      if (error?.response?.status === 400 && error.response.data?.memberCount) {
        setDeleteWarning(error.response.data.message);
        setShowDeleteConfirm(true);
      } else {
        toast.error(error?.response?.data?.message || "Failed to delete group");
        setShowDeleteConfirm(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.push("/client-groups")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Groups
        </Button>
        <div className="mt-8 text-center text-muted-foreground">Group not found.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background/50">
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm cursor-pointer hover:text-foreground" onClick={() => router.push("/client-groups")}>
              <ArrowLeft className="w-4 h-4" /> Client Groups
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{data.group.name}</h1>
              {data.group.groupCode && (
                <span className="px-2 py-1 bg-muted rounded-md text-xs font-mono border border-border">
                  {data.group.groupCode}
                </span>
              )}
            </div>
            {data.group.description && (
              <p className="text-sm text-muted-foreground max-w-2xl mt-2">{data.group.description}</p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                <Edit className="w-4 h-4 mr-2 text-muted-foreground" /> Edit Group
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsMergeModalOpen(true)}>
                <Merge className="w-4 h-4 mr-2 text-muted-foreground" /> Merge Group
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-500 hover:text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10"
                onClick={() => {
                  if (data.totalCompanies > 0) {
                     handleDeleteGroup(false);
                  } else {
                     handleDeleteGroup(true);
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-background rounded-xl border border-border shadow-sm p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">Total Companies</span>
            </div>
            <span className="text-2xl font-bold">{data.totalCompanies}</span>
          </div>
          <div className="bg-background rounded-xl border border-border shadow-sm p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-medium">Total Jobs</span>
            </div>
            <span className="text-2xl font-bold">{data.totalJobCount}</span>
          </div>
          <div className="bg-background rounded-xl border border-border shadow-sm p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Stage Breakdown</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {Object.entries(data.stageBreakdown || {}).map(([stage, count]) => (
                <span key={stage} className="text-xs px-2 py-0.5 bg-muted rounded-md border border-border/60">
                  {stage}: <span className="font-bold">{count}</span>
                </span>
              ))}
              {Object.keys(data.stageBreakdown || {}).length === 0 && (
                <span className="text-xs text-muted-foreground">No data</span>
              )}
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
            <h3 className="font-semibold text-foreground">Member Clients</h3>
            <Button size="sm" onClick={() => setIsAddClientModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Client
            </Button>
          </div>
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead className="text-right">Jobs</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.members && data.members.length > 0 ? (
                data.members.map((member) => (
                  <TableRow key={member._id} className="group">
                    <TableCell>
                      <div 
                        className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={() => router.push(`/clients/${member._id}`)}
                      >
                        {member.name}
                        {member.role === 'primary' && (
                          <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">
                            Primary
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-muted rounded-md text-xs font-medium border border-border">
                        {member.clientStage || "Lead"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {member.industry || "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {member.jobCount || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                        onClick={() => handleRemoveMember(member._id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No clients in this group yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CreateGroupModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        mode="edit"
        initialData={data.group}
        onSuccess={() => {
          setIsEditModalOpen(false);
          refetch();
        }}
      />

      <AddClientToGroupModal
        open={isAddClientModalOpen}
        onOpenChange={setIsAddClientModalOpen}
        mode="pick-client"
        groupId={groupId}
        onSuccess={() => refetch()}
      />

      <MergeGroupModal
        open={isMergeModalOpen}
        onOpenChange={setIsMergeModalOpen}
        sourceGroupId={groupId}
        sourceGroupName={data.group.name}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-red-600 font-medium">
              {deleteWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteGroup(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, Force Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
