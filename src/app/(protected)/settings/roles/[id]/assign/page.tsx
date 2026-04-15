"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Users, CheckCircle2 } from "lucide-react";
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

export default function page() {
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
    if (roleId) {
      fetchData();
    }
  }, [roleId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roleRes, usersRes] = await Promise.allSettled([
        roleService.getRoleById(roleId),
        api.get("/api/users"),
      ]);

      if (roleRes.status === "fulfilled") {
        setRole(roleRes.value.data);
      }

      if (usersRes.status === "fulfilled") {
        const data = usersRes.value.data;
        const list: User[] =
          data?.data?.users ?? data?.users ?? (Array.isArray(data) ? data : []);
        setUsers(list);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Failed to assign role");
    } finally {
      setAssigning(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const name = u.name || `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <div className="border-b bg-white">
        <div className="flex h-16 items-center px-4 gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/settings")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Assign Role</h1>
            {role && (
              <p className="text-xs text-slate-500">
                Assigning: <span className="font-medium text-brand">{role.name}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Select a User
                </h2>
                {selectedUserId && (
                  <span className="text-xs text-brand font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 1 selected
                  </span>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400">Loading users...</div>
            ) : (
              <div className="divide-y max-h-[420px] overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">No users found.</div>
                ) : (
                  filteredUsers.map((user) => {
                    const displayName =
                      user.name ||
                      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                      "Unknown User";
                    const isSelected = selectedUserId === user._id;

                    return (
                      <div
                        key={user._id}
                        onClick={() => setSelectedUserId(isSelected ? null : user._id)}
                        className={`flex items-center gap-4 px-6 py-3.5 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-brand/5 border-l-2 border-brand"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                            isSelected
                              ? "bg-brand text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {displayName[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        {user.role && (
                          <span className="text-xs text-slate-400 shrink-0">{user.role}</span>
                        )}
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            <div className="px-6 py-4 border-t bg-slate-50/50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.push("/settings")}>
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={assigning || !selectedUserId}
                className="bg-brand hover:bg-brand/90"
              >
                {assigning ? "Assigning..." : "Assign Role"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}