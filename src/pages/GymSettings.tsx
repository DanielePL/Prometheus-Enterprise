import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Users,
  Bell,
  Palette,
  Shield,
  CreditCard,
  Link,
  Moon,
  Sun,
  Upload,
  MoreHorizontal,
  Loader2,
  Save,
  UserMinus,
  Pencil,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { settingsService, type NotificationPreferences } from "@/services/settings";
import StaffDialog from "@/components/settings/StaffDialog";
import RemoveStaffDialog from "@/components/settings/RemoveStaffDialog";
import type { Profile, StaffRole, FacilityType, ClientType } from "@/types/database";
import { Checkbox } from "@/components/ui/checkbox";
import { StripeConnectionCard } from "@/components/stripe";
import { stripe } from "@/services/stripeService";
import AccessSettings from "@/components/access/AccessSettings";
import { mockDataService } from "@/services/mockData";
import { Database, Sparkles, Trash2 } from "lucide-react";

// Facility type options
const FACILITY_TYPES: { value: FacilityType; label: string; description: string }[] = [
  { value: "gym", label: "Gym / Fitness Center", description: "Traditional fitness facility with equipment" },
  { value: "fitness_studio", label: "Fitness Studio", description: "Boutique fitness, group classes" },
  { value: "sports_academy", label: "Sports Academy", description: "Training academy for athletes" },
  { value: "tennis_club", label: "Tennis Club", description: "Tennis courts and coaching" },
  { value: "golf_club", label: "Golf Club", description: "Golf course and training" },
  { value: "martial_arts", label: "Martial Arts School", description: "Karate, Judo, BJJ, MMA" },
  { value: "dance_studio", label: "Dance Studio", description: "Ballet, contemporary, hip-hop" },
  { value: "therapy_center", label: "Therapy Center", description: "Physiotherapy, wellness" },
  { value: "rehabilitation", label: "Rehabilitation Center", description: "Recovery and rehab programs" },
  { value: "yoga_studio", label: "Yoga / Pilates Studio", description: "Mind-body wellness" },
  { value: "swimming_school", label: "Swimming School", description: "Swim lessons and aquatics" },
  { value: "climbing_gym", label: "Climbing Gym", description: "Indoor climbing and bouldering" },
  { value: "equestrian_center", label: "Equestrian Center", description: "Horse riding and training" },
  { value: "other", label: "Other", description: "Other type of facility" },
];

// Client type options
const CLIENT_TYPES: { value: ClientType; label: string; description: string }[] = [
  { value: "members", label: "Members", description: "General membership-based clients" },
  { value: "students", label: "Students", description: "Learners in training programs" },
  { value: "athletes", label: "Athletes", description: "Competitive sports participants" },
  { value: "patients", label: "Patients", description: "Medical/therapy clients" },
  { value: "clients", label: "Clients", description: "General service clients" },
];

const ROLE_LABELS: Record<StaffRole, string> = {
  owner: "Owner",
  admin: "Administrator",
  manager: "Manager",
  coach: "Coach",
  receptionist: "Receptionist",
};

const GymSettings = () => {
  const { theme, setTheme } = useTheme();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for gym profile
  const [gymName, setGymName] = useState("");
  const [gymEmail, setGymEmail] = useState("");
  const [gymPhone, setGymPhone] = useState("");
  const [gymAddress, setGymAddress] = useState("");
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Dialog state
  const [editingStaff, setEditingStaff] = useState<Profile | null>(null);
  const [removingStaff, setRemovingStaff] = useState<Profile | null>(null);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    newMemberSignups: true,
    paymentAlerts: true,
    sessionReminders: true,
    marketingEmails: false,
  });

  // Facility profile state
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>(['gym']);
  const [clientTypes, setClientTypes] = useState<ClientType[]>(['members']);
  const [isFacilityFormDirty, setIsFacilityFormDirty] = useState(false);

  const gymId = profile?.gym_id;

  // Fetch notification preferences
  const { data: savedNotifications } = useQuery({
    queryKey: ["notification-preferences", gymId],
    queryFn: () => settingsService.getNotificationPreferences(gymId!),
    enabled: !!gymId,
  });

  // Sync notification preferences with fetched data
  useEffect(() => {
    if (savedNotifications) {
      setNotifications(savedNotifications);
    }
  }, [savedNotifications]);

  // Sync facility types with gym data
  useEffect(() => {
    if (gym) {
      if (gym.facility_types?.length) {
        setFacilityTypes(gym.facility_types);
      }
      if (gym.client_types?.length) {
        setClientTypes(gym.client_types);
      }
    }
  }, [gym]);

  // Fetch gym data
  const { data: gym, isLoading: loadingGym } = useQuery({
    queryKey: ["gym", gymId],
    queryFn: () => settingsService.getGym(gymId!),
    enabled: !!gymId,
    staleTime: 5 * 60 * 1000,
  });

  // Sync form with gym data
  useEffect(() => {
    if (gym) {
      setGymName(gym.name);
      setGymEmail(gym.email || "");
      setGymPhone(gym.phone || "");
      setGymAddress(gym.address || "");
    }
  }, [gym]);

  // Fetch staff
  const { data: staff = [], isLoading: loadingStaff } = useQuery({
    queryKey: ["staff", gymId],
    queryFn: () => settingsService.getStaff(gymId!),
    enabled: !!gymId,
  });

  // Fetch Stripe connection status
  const { data: stripeStatus, refetch: refetchStripeStatus } = useQuery({
    queryKey: ["stripe-status", gymId],
    queryFn: () => stripe.getConnectionStatus(gymId!),
    enabled: !!gymId,
  });

  // Update gym mutation
  const updateGymMutation = useMutation({
    mutationFn: (data: { name: string; email: string; phone: string; address: string }) =>
      settingsService.updateGym(gymId!, {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym", gymId] });
      setIsFormDirty(false);
      toast.success("Gym profile updated");
    },
    onError: () => {
      toast.error("Error saving");
    },
  });

  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => settingsService.uploadLogo(gymId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym", gymId] });
      toast.success("Logo uploaded");
    },
    onError: () => {
      toast.error("Error uploading");
    },
  });

  // Update staff mutation
  const updateStaffMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { full_name: string; role: StaffRole } }) =>
      settingsService.updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", gymId] });
      setEditingStaff(null);
      toast.success("Staff member updated");
    },
    onError: () => {
      toast.error("Error saving");
    },
  });

  // Remove staff mutation
  const removeStaffMutation = useMutation({
    mutationFn: (id: string) => settingsService.removeStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", gymId] });
      setRemovingStaff(null);
      toast.success("Staff member removed");
    },
    onError: () => {
      toast.error("Error removing");
    },
  });

  // Save notification preferences mutation
  const saveNotificationsMutation = useMutation({
    mutationFn: (prefs: NotificationPreferences) =>
      settingsService.setNotificationPreferences(gymId!, prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences", gymId] });
      toast.success("Notification preferences saved");
    },
    onError: () => {
      toast.error("Error saving preferences");
    },
  });

  // Save facility profile mutation
  const saveFacilityProfileMutation = useMutation({
    mutationFn: (data: { facility_types: FacilityType[]; client_types: ClientType[] }) =>
      settingsService.updateGym(gymId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym", gymId] });
      setIsFacilityFormDirty(false);
      toast.success("Facility profile saved");
    },
    onError: () => {
      toast.error("Error saving facility profile");
    },
  });

  const handleFormChange = () => {
    setIsFormDirty(true);
  };

  const handleSaveGym = (e: React.FormEvent) => {
    e.preventDefault();
    updateGymMutation.mutate({
      name: gymName,
      email: gymEmail,
      phone: gymPhone,
      address: gymAddress,
    });
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File is too large (max. 2MB)");
        return;
      }
      uploadLogoMutation.mutate(file);
    }
  };

  const integrations = [
    { name: "Stripe", description: "Payment processing", connected: true, icon: CreditCard },
    { name: "WhatsApp Business", description: "Member communication", connected: false, icon: Link },
    { name: "Google Calendar", description: "Calendar sync", connected: true, icon: Link },
  ];

  if (loadingGym) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage facility profile and preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="glass flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="facility">Facility Type</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="users">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="demo">Demo Data</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Facility Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGym} className="space-y-6">
                {/* Logo */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 cursor-pointer" onClick={handleLogoClick}>
                    {gym?.logo_url ? (
                      <AvatarImage src={gym.logo_url} alt={gym.name} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {gym?.name?.substring(0, 2).toUpperCase() || "GY"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLogoClick}
                      disabled={uploadLogoMutation.isPending}
                    >
                      {uploadLogoMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Change Logo
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Recommended: 256x256px, PNG or JPG
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gymName">Gym Name *</Label>
                    <Input
                      id="gymName"
                      value={gymName || gym?.name || ""}
                      onChange={(e) => {
                        setGymName(e.target.value);
                        handleFormChange();
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gymEmail">E-Mail</Label>
                    <Input
                      id="gymEmail"
                      type="email"
                      value={gymEmail || gym?.email || ""}
                      onChange={(e) => {
                        setGymEmail(e.target.value);
                        handleFormChange();
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gymPhone">Phone</Label>
                    <Input
                      id="gymPhone"
                      type="tel"
                      value={gymPhone || gym?.phone || ""}
                      onChange={(e) => {
                        setGymPhone(e.target.value);
                        handleFormChange();
                      }}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="gymAddress">Address</Label>
                    <Input
                      id="gymAddress"
                      value={gymAddress || gym?.address || ""}
                      onChange={(e) => {
                        setGymAddress(e.target.value);
                        handleFormChange();
                      }}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={updateGymMutation.isPending || !isFormDirty}
                >
                  {updateGymMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facility Type Tab */}
        <TabsContent value="facility" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Facility Type
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Select the type(s) of facility you operate. This helps customize the experience.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {FACILITY_TYPES.map((type) => (
                  <div
                    key={type.value}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      facilityTypes.includes(type.value)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      setFacilityTypes((prev) =>
                        prev.includes(type.value)
                          ? prev.filter((t) => t !== type.value)
                          : [...prev, type.value]
                      );
                      setIsFacilityFormDirty(true);
                    }}
                  >
                    <Checkbox
                      checked={facilityTypes.includes(type.value)}
                      onCheckedChange={() => {}}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Client Terminology
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                How do you refer to the people you serve? Select all that apply.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {CLIENT_TYPES.map((type) => (
                  <div
                    key={type.value}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      clientTypes.includes(type.value)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      setClientTypes((prev) =>
                        prev.includes(type.value)
                          ? prev.filter((t) => t !== type.value)
                          : [...prev, type.value]
                      );
                      setIsFacilityFormDirty(true);
                    }}
                  >
                    <Checkbox
                      checked={clientTypes.includes(type.value)}
                      onCheckedChange={() => {}}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => {
                  saveFacilityProfileMutation.mutate({
                    facility_types: facilityTypes,
                    client_types: clientTypes,
                  });
                }}
                disabled={!isFacilityFormDirty || saveFacilityProfileMutation.isPending}
                className="mt-4"
              >
                {saveFacilityProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Facility Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access" className="space-y-4">
          {gymId && <AccessSettings gymId={gymId} />}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStaff ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : staff.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No staff members found
                </p>
              ) : (
                <div className="space-y-3">
                  {staff.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {member.avatar_url ? (
                            <AvatarImage src={member.avatar_url} alt={member.full_name || ""} />
                          ) : null}
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {(member.full_name || member.email)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.full_name || member.email}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{ROLE_LABELS[member.role]}</Badge>
                        {member.id === user?.id && (
                          <Badge variant="secondary">You</Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={member.id === user?.id}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingStaff(member)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setRemovingStaff(member)}
                              className="text-destructive"
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Role Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium">Owner</p>
                  <p className="text-sm text-muted-foreground">
                    Full access to all features, settings, and billing
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium">Administrator</p>
                  <p className="text-sm text-muted-foreground">
                    Manage team, change settings, view reports
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium">Manager</p>
                  <p className="text-sm text-muted-foreground">
                    Manage members and coaches, schedule sessions
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium">Coach</p>
                  <p className="text-sm text-muted-foreground">
                    Manage own sessions and assigned members
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium">Receptionist</p>
                  <p className="text-sm text-muted-foreground">
                    Check-ins, member data, appointment bookings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  key: "newMemberSignups",
                  label: "New Members",
                  description: "Get notified when new members sign up",
                },
                {
                  key: "paymentAlerts",
                  label: "Payment Alerts",
                  description: "Notifications about payments and outstanding invoices",
                },
                {
                  key: "sessionReminders",
                  label: "Session Reminders",
                  description: "Reminders about upcoming sessions",
                },
                {
                  key: "marketingEmails",
                  label: "Marketing Emails",
                  description: "Receive product updates and tips",
                },
              ].map((notification) => (
                <div key={notification.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{notification.label}</p>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                  </div>
                  <Switch
                    checked={notifications[notification.key as keyof typeof notifications]}
                    onCheckedChange={(checked) => {
                      const newNotifications = {
                        ...notifications,
                        [notification.key]: checked,
                      };
                      setNotifications(newNotifications);
                      saveNotificationsMutation.mutate(newNotifications as NotificationPreferences);
                    }}
                    disabled={saveNotificationsMutation.isPending}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          {/* Stripe Payment Integration */}
          {stripeStatus && gymId && (
            <StripeConnectionCard
              status={stripeStatus}
              gymId={gymId}
              onStatusChange={() => refetchStripeStatus()}
            />
          )}

          {/* Other Integrations */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Other Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {integrations
                .filter((i) => i.name !== "Stripe")
                .map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <integration.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={integration.connected ? "outline" : "default"}
                    >
                      {integration.connected ? "Connected" : "Connect"}
                    </Button>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Theme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demo Data Tab */}
        <TabsContent value="demo" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Demo Data Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-6 border border-green-500/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-green-500/20">
                    <Sparkles className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Generate Demo Data</h3>
                    <p className="text-muted-foreground mb-4">
                      Populate your dashboard with realistic demo data including members, coaches, sessions,
                      payments, and visit history. Perfect for demos and testing.
                    </p>
                    <div className="grid md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="font-semibold text-2xl">127</p>
                        <p className="text-muted-foreground">Members</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="font-semibold text-2xl">6</p>
                        <p className="text-muted-foreground">Coaches</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="font-semibold text-2xl">60</p>
                        <p className="text-muted-foreground">Days of History</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="font-semibold text-2xl">8</p>
                        <p className="text-muted-foreground">Sessions/Day</p>
                      </div>
                    </div>
                    <Button
                      className="bg-green-500 hover:bg-green-600"
                      onClick={async () => {
                        if (!gymId) return;
                        toast.loading("Generating demo data...", { id: "demo-data" });
                        try {
                          await mockDataService.seedDemoData(gymId);
                          queryClient.invalidateQueries();
                          toast.success("Demo data generated successfully!", { id: "demo-data" });
                        } catch (error) {
                          toast.error("Failed to generate demo data", { id: "demo-data" });
                          console.error(error);
                        }
                      }}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Demo Data
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-lg p-6 border border-red-500/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-red-500/20">
                    <Trash2 className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Clear All Data</h3>
                    <p className="text-muted-foreground mb-4">
                      Remove all members, coaches, sessions, payments, and other data.
                      This action cannot be undone.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        if (!gymId) return;
                        if (!confirm("Are you sure you want to delete ALL data? This cannot be undone.")) return;
                        toast.loading("Clearing all data...", { id: "clear-data" });
                        try {
                          await mockDataService.clearAllData(gymId);
                          queryClient.invalidateQueries();
                          toast.success("All data cleared successfully!", { id: "clear-data" });
                        } catch (error) {
                          toast.error("Failed to clear data", { id: "clear-data" });
                          console.error(error);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Staff Edit Dialog */}
      <StaffDialog
        open={!!editingStaff}
        onOpenChange={(open) => !open && setEditingStaff(null)}
        staff={editingStaff}
        onSave={async (data) => {
          if (editingStaff) {
            await updateStaffMutation.mutateAsync({ id: editingStaff.id, data });
          }
        }}
        loading={updateStaffMutation.isPending}
      />

      {/* Remove Staff Dialog */}
      <RemoveStaffDialog
        open={!!removingStaff}
        onOpenChange={(open) => !open && setRemovingStaff(null)}
        staff={removingStaff}
        onConfirm={async () => {
          if (removingStaff) {
            await removeStaffMutation.mutateAsync(removingStaff.id);
          }
        }}
        loading={removeStaffMutation.isPending}
      />
    </div>
  );
};

export default GymSettings;
