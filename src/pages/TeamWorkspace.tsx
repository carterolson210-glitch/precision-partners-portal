import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Plus, Loader2, Users, User, Mail, Settings, Trash2,
  Edit, Activity, Clock, CheckCircle, AlertCircle,
  UserPlus, UserMinus, FileText, Building
} from "lucide-react";

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Electrician' | 'Apprentice';
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

interface ActivityItem {
  id: string;
  type: 'member_added' | 'member_updated' | 'member_removed' | 'project_created' | 'invoice_completed';
  description: string;
  timestamp: string;
  user: string;
}

const roleConfig = {
  Admin: { color: "bg-red-100 text-red-800", icon: Settings },
  Manager: { color: "bg-blue-100 text-blue-800", icon: User },
  Electrician: { color: "bg-green-100 text-green-800", icon: User },
  Apprentice: { color: "bg-yellow-100 text-yellow-800", icon: User }
};

const statusConfig = {
  Active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  Inactive: { color: "bg-gray-100 text-gray-800", icon: AlertCircle }
};

const TeamWorkspace = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<TeamMember | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<'Admin' | 'Manager' | 'Electrician' | 'Apprentice'>('Apprentice');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    fetchTeamMembers();
    fetchActivities();
  }, []);

  const fetchTeamMembers = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchActivities = useCallback(async () => {
    // TODO: Implement real activity feed from database
    setActivities([]);
  }, []);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setRole('Apprentice');
    setStatus('Active');
    setSelectedMember(null);
  };

  const handleCreate = async () => {
    if (!user || !fullName || !email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("team_members").insert({
        user_id: user.id,
        full_name: fullName,
        email: email,
        role: role,
        status: status,
      });

      if (error) throw error;

      toast.success("Team member added successfully");
      setCreateOpen(false);
      resetForm();
      fetchTeamMembers();

      // Add activity
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: "member_added",
        description: `${fullName} joined the team as a ${role}`,
        timestamp: new Date().toISOString(),
        user: "Admin"
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only last 10

    } catch (err: any) {
      console.error("Error creating team member:", err);
      toast.error(err.message || "Failed to add team member");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setFullName(member.full_name);
    setEmail(member.email);
    setRole(member.role);
    setStatus(member.status);
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedMember || !fullName || !email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("team_members")
        .update({
          full_name: fullName,
          email: email,
          role: role,
          status: status,
        })
        .eq("id", selectedMember.id)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success("Team member updated successfully");
      setEditOpen(false);
      resetForm();
      fetchTeamMembers();

      // Add activity
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: "member_updated",
        description: `${fullName} was updated to ${role}`,
        timestamp: new Date().toISOString(),
        user: "Admin"
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);

    } catch (err: any) {
      console.error("Error updating team member:", err);
      toast.error(err.message || "Failed to update team member");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: TeamMember) => {
    setDeleteConfirm(member);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", deleteConfirm.id)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success("Team member removed successfully");
      fetchTeamMembers();

      // Add activity
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: "member_removed",
        description: `${deleteConfirm.full_name} was removed from the team`,
        timestamp: new Date().toISOString(),
        user: "Admin"
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);

    } catch (err: any) {
      console.error("Error deleting team member:", err);
      toast.error(err.message || "Failed to remove team member");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <DashboardLayout title="Team Workspace">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members Section */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="Team Members">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                {teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''}
              </p>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-navy text-primary-foreground hover:bg-navy/90">
                    <Plus className="w-4 h-4 mr-2" /> Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder=""
                      />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder=""
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Select value={role} onValueChange={(value: any) => setRole(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Electrician">Electrician</SelectItem>
                          <SelectItem value="Apprentice">Apprentice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleCreate}
                      disabled={saving}
                      className="w-full bg-navy text-primary-foreground hover:bg-navy/90"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding…
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" /> Add Member
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-steel" />
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No team members yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add engineers and staff to collaborate on projects and share documents.
                </p>
                <Button onClick={() => setCreateOpen(true)} className="bg-navy text-primary-foreground hover:bg-navy/90">
                  <Plus className="w-4 h-4 mr-2" /> Add First Member
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member) => {
                  const RoleIcon = roleConfig[member.role].icon;
                  const StatusIcon = statusConfig[member.status].icon;

                  return (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback className="bg-navy text-white">
                                {getInitials(member.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{member.full_name}</h4>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Mail className="w-3 h-3 mr-1" />
                                {member.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(member)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(member)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2">
                            <RoleIcon className="w-4 h-4" />
                            <Badge className={roleConfig[member.role].color}>
                              {member.role}
                            </Badge>
                          </div>
                          <Badge className={statusConfig[member.status].color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {member.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <DashboardCard title="Team Activity">
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No activity yet</p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <div className="flex-shrink-0">
                      {activity.type === 'member_added' && <UserPlus className="w-4 h-4 text-green-600 mt-0.5" />}
                      {activity.type === 'member_updated' && <Settings className="w-4 h-4 text-blue-600 mt-0.5" />}
                      {activity.type === 'member_removed' && <UserMinus className="w-4 h-4 text-red-600 mt-0.5" />}
                      {activity.type === 'project_created' && <Building className="w-4 h-4 text-purple-600 mt-0.5" />}
                      {activity.type === 'invoice_completed' && <FileText className="w-4 h-4 text-green-600 mt-0.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeAgo(activity.timestamp)}
                        <span className="mx-1">•</span>
                        <span>{activity.user}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Edit Member Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder=""
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={role} onValueChange={(value: any) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Electrician">Electrician</SelectItem>
                  <SelectItem value="Apprentice">Apprentice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleUpdate}
                disabled={saving}
                className="flex-1 bg-navy text-primary-foreground hover:bg-navy/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating…
                  </>
                ) : (
                  "Update Member"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to remove {deleteConfirm?.full_name} from the team?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default TeamWorkspace;
