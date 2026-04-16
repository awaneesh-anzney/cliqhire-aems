"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Users, CheckCircle2, UserCheck, Shield } from "lucide-react";
import { api } from "@/lib/axios-config";
import { roleService, Role } from "@/services/roleService";
import { toast } from "sonner";

interface User {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
}

export default function AssignUsersPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params?.id as string;

  const [role, setRole] = useState<Role | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (roleId) fetchData();
  }, [roleId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roleRes, usersRes] = await Promise.allSettled([
        roleService.getRoleById(roleId),
        api.get("/api/users"),
      ]);
      if (roleRes.status === "fulfilled") setRole(roleRes.value.data);
      if (usersRes.status === "fulfilled") {
        const d = usersRes.value.data;
        setUsers(d?.data?.users ?? d?.users ?? (Array.isArray(d) ? d : []));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }
    setAssigning(true);
    try {
      // PUT /api/roles/:roleId/assign/:userId
      const res = await roleService.assignRoleToUser(roleId, selectedUserId);
      toast.success(res.message || "Role assigned successfully");
      router.push("/settings");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to assign role");
    } finally {
      setAssigning(false);
    }
  };

  const filtered = users.filter((u) => {
    const n = u.name || `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
    const q = search.toLowerCase();
    return n.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const selectedUser = users.find((u) => u._id === selectedUserId);

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Sticky header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/settings")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
              <UserCheck className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-800">Assign Role to User</h1>
              {role && (
                <p className="text-xs text-slate-500">
                  Role: <span className="font-semibold text-brand">{role.name}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/settings")}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={assigning || !selectedUserId}
              className="h-9 text-xs bg-brand hover:bg-brand/90 text-white gap-2"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {assigning ? "Assigning…" : "Assign Role"}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-3xl mx-auto space-y-4">
        {/* Selected user banner */}
        {selectedUser && (
          <div className="bg-brand/5 border border-brand/20 rounded-xl px-5 py-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-brand text-white flex items-center justify-center font-semibold text-sm shrink-0">
              {(selectedUser.name || selectedUser.firstName || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {selectedUser.name ||
                  `${selectedUser.firstName ?? ""} ${selectedUser.lastName ?? ""}`.trim()}
              </p>
              <p className="text-xs text-slate-500 truncate">{selectedUser.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-brand" />
              <span className="text-xs font-medium text-brand">{role?.name}</span>
            </div>
          </div>
        )}

        {/* User list card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b bg-slate-50/80">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Select User
              </h2>
              <span className="text-xs text-slate-500">
                {filtered.length} of {users.length} users
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">{search ? `No results for "${search}"` : "No users found"}</p>
            </div>
          ) : (
            <div className="divide-y max-h-96 overflow-y-auto">
              {filtered.map((user) => {
                const displayName =
                  user.name || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Unknown";
                const isSelected = selectedUserId === user._id;
                const initials = displayName[0]?.toUpperCase();

                return (
                  <div
                    key={user._id}
                    onClick={() => setSelectedUserId(isSelected ? null : user._id)}
                    className={`flex items-center gap-3.5 px-5 py-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-brand/5 border-l-4 border-l-brand"
                        : "border-l-4 border-l-transparent hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${
                        isSelected ? "bg-brand text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate transition-colors ${isSelected ? "text-slate-900" : "text-slate-700"}`}
                      >
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    {user.role && (
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                        {user.role}
                      </span>
                    )}
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-brand shrink-0 ml-1" />}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t bg-slate-50/80">
              <p className="text-xs text-slate-400">
                {selectedUserId
                  ? "User selected — click Assign Role to proceed"
                  : "Click a user to select them"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
