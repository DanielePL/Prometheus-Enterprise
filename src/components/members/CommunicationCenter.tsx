import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Mail,
  MessageCircle,
  Bell,
  Send,
  Users,
  User,
  Search,
  Check,
  CheckCheck,
  Clock,
  Filter,
  Plus,
  ChevronRight,
  Globe,
  Smartphone,
  Zap,
  BarChart3,
  ArrowLeft,
  Image,
  Paperclip,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Member } from "@/types/database";

// Channel definitions
type ChannelType = "whatsapp" | "line" | "email" | "push";

interface Channel {
  id: ChannelType;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
  connected: boolean;
  stats: {
    sent: number;
    delivered: number;
    read: number;
    responded: number;
  };
}

interface MessageTemplate {
  id: string;
  name: string;
  channel: ChannelType;
  content: string;
  category: "welcome" | "reminder" | "promotion" | "retention" | "custom";
}

interface ConversationMessage {
  id: string;
  content: string;
  timestamp: string;
  direction: "inbound" | "outbound";
  channel: ChannelType;
  status: "sent" | "delivered" | "read" | "failed";
}

interface MemberConversation {
  memberId: string;
  memberName: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  channel: ChannelType;
  messages: ConversationMessage[];
}

// WhatsApp SVG icon
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// LINE SVG icon
const LineIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
  </svg>
);

// Demo templates
const demoTemplates: MessageTemplate[] = [
  {
    id: "1",
    name: "Welcome Message",
    channel: "whatsapp",
    content: "Welcome to Prometheus! 🔥 We're excited to have you on board. Your first session is scheduled for {date}. Any questions? Just reply here!",
    category: "welcome",
  },
  {
    id: "2",
    name: "Session Reminder",
    channel: "whatsapp",
    content: "Hey {name}! 💪 Reminder: You have a session tomorrow at {time}. See you there!",
    category: "reminder",
  },
  {
    id: "3",
    name: "Missed Session Follow-up",
    channel: "whatsapp",
    content: "Hi {name}, we missed you today! Everything okay? Let us know if you'd like to reschedule. 🙏",
    category: "retention",
  },
  {
    id: "4",
    name: "ウェルカムメッセージ",
    channel: "line",
    content: "Prometheusへようこそ！🔥 ご入会ありがとうございます。初回セッションは{date}に予定されています。ご質問があればお気軽にどうぞ！",
    category: "welcome",
  },
  {
    id: "5",
    name: "セッションリマインダー",
    channel: "line",
    content: "{name}さん、明日{time}にセッションがあります。お待ちしています！💪",
    category: "reminder",
  },
  {
    id: "6",
    name: "Monthly Progress",
    channel: "email",
    content: "Hi {name},\n\nHere's your monthly progress report...",
    category: "promotion",
  },
];

// Demo conversations
const demoConversations: MemberConversation[] = [
  {
    memberId: "1",
    memberName: "Sarah Chen",
    lastMessage: "Thanks! See you tomorrow 💪",
    lastMessageTime: "2 min ago",
    unreadCount: 1,
    channel: "whatsapp",
    messages: [
      { id: "1", content: "Hi Sarah! Your session tomorrow is at 10am. Ready? 🔥", timestamp: "Yesterday 6:00 PM", direction: "outbound", channel: "whatsapp", status: "read" },
      { id: "2", content: "Yes! Can't wait. Should I bring anything?", timestamp: "Yesterday 6:15 PM", direction: "inbound", channel: "whatsapp", status: "read" },
      { id: "3", content: "Just your water bottle and a towel. We'll provide the rest!", timestamp: "Yesterday 6:20 PM", direction: "outbound", channel: "whatsapp", status: "read" },
      { id: "4", content: "Thanks! See you tomorrow 💪", timestamp: "2 min ago", direction: "inbound", channel: "whatsapp", status: "delivered" },
    ],
  },
  {
    memberId: "2",
    memberName: "田中太郎",
    lastMessage: "了解しました、ありがとうございます！",
    lastMessageTime: "15 min ago",
    unreadCount: 0,
    channel: "line",
    messages: [
      { id: "1", content: "田中さん、来週の月曜日にセッション変更は可能ですか？", timestamp: "Today 9:00 AM", direction: "outbound", channel: "line", status: "read" },
      { id: "2", content: "はい、大丈夫です！何時がいいですか？", timestamp: "Today 9:30 AM", direction: "inbound", channel: "line", status: "read" },
      { id: "3", content: "14時はいかがでしょうか？", timestamp: "Today 9:35 AM", direction: "outbound", channel: "line", status: "read" },
      { id: "4", content: "了解しました、ありがとうございます！", timestamp: "15 min ago", direction: "inbound", channel: "line", status: "read" },
    ],
  },
  {
    memberId: "3",
    memberName: "Mike Johnson",
    lastMessage: "Your membership has been renewed successfully!",
    lastMessageTime: "1 hour ago",
    unreadCount: 0,
    channel: "whatsapp",
    messages: [
      { id: "1", content: "Hi Mike! Your membership renewal is coming up on March 15th. Would you like to continue with the same plan?", timestamp: "Yesterday 10:00 AM", direction: "outbound", channel: "whatsapp", status: "read" },
      { id: "2", content: "Yes please! Same plan works great for me", timestamp: "Yesterday 2:00 PM", direction: "inbound", channel: "whatsapp", status: "read" },
      { id: "3", content: "Your membership has been renewed successfully!", timestamp: "1 hour ago", direction: "outbound", channel: "whatsapp", status: "delivered" },
    ],
  },
  {
    memberId: "4",
    memberName: "佐藤美咲",
    lastMessage: "新しいクラスの情報を送りました📩",
    lastMessageTime: "3 hours ago",
    unreadCount: 2,
    channel: "line",
    messages: [
      { id: "1", content: "佐藤さん、新しいヨガクラスが始まります！興味ありますか？", timestamp: "Today 8:00 AM", direction: "outbound", channel: "line", status: "read" },
      { id: "2", content: "ぜひ参加したいです！詳細を教えてください", timestamp: "Today 8:30 AM", direction: "inbound", channel: "line", status: "read" },
      { id: "3", content: "新しいクラスの情報を送りました📩", timestamp: "3 hours ago", direction: "outbound", channel: "line", status: "delivered" },
    ],
  },
  {
    memberId: "5",
    memberName: "Emma Wilson",
    lastMessage: "Can I bring a friend to try a session?",
    lastMessageTime: "5 hours ago",
    unreadCount: 1,
    channel: "whatsapp",
    messages: [
      { id: "1", content: "Can I bring a friend to try a session?", timestamp: "5 hours ago", direction: "inbound", channel: "whatsapp", status: "delivered" },
    ],
  },
];

const channels: Channel[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: <WhatsAppIcon className="h-5 w-5" />,
    color: "text-green-400",
    bgColor: "bg-green-500/10 border-green-500/20",
    description: "WhatsApp Business API",
    connected: true,
    stats: { sent: 1247, delivered: 1198, read: 1043, responded: 412 },
  },
  {
    id: "line",
    name: "LINE",
    icon: <LineIcon className="h-5 w-5" />,
    color: "text-[#06C755]",
    bgColor: "bg-[#06C755]/10 border-[#06C755]/20",
    description: "LINE Official Account",
    connected: true,
    stats: { sent: 856, delivered: 834, read: 789, responded: 345 },
  },
  {
    id: "email",
    name: "Email",
    icon: <Mail className="h-5 w-5" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    description: "Email Campaigns",
    connected: true,
    stats: { sent: 2340, delivered: 2280, read: 1456, responded: 234 },
  },
  {
    id: "push",
    name: "Push",
    icon: <Bell className="h-5 w-5" />,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/20",
    description: "Push Notifications",
    connected: false,
    stats: { sent: 0, delivered: 0, read: 0, responded: 0 },
  },
];

type ViewMode = "overview" | "conversations" | "broadcast" | "templates";

interface CommunicationCenterProps {
  members: Member[];
}

export default function CommunicationCenter({ members }: CommunicationCenterProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [selectedChannel, setSelectedChannel] = useState<ChannelType | "all">("all");
  const [selectedConversation, setSelectedConversation] = useState<MemberConversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [broadcastDialogOpen, setBroadcastDialogOpen] = useState(false);
  const [broadcastChannel, setBroadcastChannel] = useState<ChannelType>("whatsapp");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState<"all" | "active" | "inactive">("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const filteredConversations = useMemo(() => {
    return demoConversations.filter((conv) => {
      const matchesChannel = selectedChannel === "all" || conv.channel === selectedChannel;
      const matchesSearch = !searchQuery || conv.memberName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesChannel && matchesSearch;
    });
  }, [selectedChannel, searchQuery]);

  const totalUnread = demoConversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    toast.success("Message sent via " + (selectedConversation.channel === "whatsapp" ? "WhatsApp" : "LINE"));
    setMessageInput("");
  };

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    const channelName = channels.find(c => c.id === broadcastChannel)?.name;
    const targetCount = broadcastTarget === "all" ? members.length : broadcastTarget === "active" ? Math.floor(members.length * 0.6) : Math.floor(members.length * 0.1);
    toast.success(`Broadcast sent to ${targetCount} members via ${channelName}`);
    setBroadcastDialogOpen(false);
    setBroadcastMessage("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent": return <Check className="h-3 w-3 text-muted-foreground" />;
      case "delivered": return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case "read": return <CheckCheck className="h-3 w-3 text-blue-400" />;
      case "failed": return <X className="h-3 w-3 text-red-400" />;
      default: return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getChannelIcon = (channel: ChannelType) => {
    switch (channel) {
      case "whatsapp": return <WhatsAppIcon className="h-4 w-4 text-green-400" />;
      case "line": return <LineIcon className="h-4 w-4 text-[#06C755]" />;
      case "email": return <Mail className="h-4 w-4 text-blue-400" />;
      case "push": return <Bell className="h-4 w-4 text-purple-400" />;
    }
  };

  // Overview with channel cards and quick stats
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Channel Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {channels.map((channel) => (
          <Card
            key={channel.id}
            className={`glass-card border cursor-pointer transition-all hover:scale-[1.02] ${channel.bgColor} ${
              !channel.connected ? "opacity-60" : ""
            }`}
            onClick={() => {
              if (channel.connected) {
                setSelectedChannel(channel.id);
                setViewMode("conversations");
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`${channel.color} flex items-center gap-2`}>
                  {channel.icon}
                  <span className="font-semibold">{channel.name}</span>
                </div>
                {channel.connected ? (
                  <Badge variant="outline" className="text-green-400 border-green-500/30 text-xs">
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground text-xs">
                    Setup Required
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{channel.description}</p>
              {channel.connected ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Sent</span>
                    <p className="font-medium">{channel.stats.sent.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Delivered</span>
                    <p className="font-medium">{channel.stats.delivered.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Read</span>
                    <p className="font-medium">{channel.stats.read.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Responded</span>
                    <p className="font-medium">{channel.stats.responded.toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full mt-1" onClick={(e) => { e.stopPropagation(); toast.info("Channel setup coming soon"); }}>
                  Configure
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="font-medium text-sm">Quick Actions</span>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => { setBroadcastChannel("whatsapp"); setBroadcastDialogOpen(true); }}
              >
                <WhatsAppIcon className="h-4 w-4 text-green-400" />
                WhatsApp Broadcast
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => { setBroadcastChannel("line"); setBroadcastDialogOpen(true); }}
              >
                <LineIcon className="h-4 w-4 text-[#06C755]" />
                LINE Broadcast
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => { setBroadcastChannel("email"); setBroadcastDialogOpen(true); }}
              >
                <Mail className="h-4 w-4 text-blue-400" />
                Email Campaign
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span className="font-medium text-sm">This Month</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Messages Sent</span>
                <span className="font-semibold">4,443</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Delivery Rate</span>
                <span className="font-semibold text-green-400">97.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Read Rate</span>
                <span className="font-semibold text-blue-400">74.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Response Rate</span>
                <span className="font-semibold text-amber-400">22.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="h-4 w-4 text-green-400" />
              <span className="font-medium text-sm">Conversations</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active</span>
                <span className="font-semibold">{demoConversations.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Unread</span>
                <span className="font-semibold text-amber-400">{totalUnread}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg. Response</span>
                <span className="font-semibold">12 min</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-1"
                onClick={() => setViewMode("conversations")}
              >
                View All Conversations
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations Preview */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Conversations</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setViewMode("conversations")}>
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {demoConversations.slice(0, 4).map((conv) => (
              <div
                key={conv.memberId}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedConversation(conv);
                  setViewMode("conversations");
                }}
              >
                <div className="relative">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/20 text-xs">
                      {conv.memberName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    {getChannelIcon(conv.channel)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{conv.memberName}</span>
                    <span className="text-xs text-muted-foreground">{conv.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground h-5 min-w-5 flex items-center justify-center text-xs">
                    {conv.unreadCount}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Conversations view (WhatsApp/LINE style chat)
  const renderConversations = () => (
    <div className="grid grid-cols-12 gap-0 h-[600px] border border-border/50 rounded-lg overflow-hidden">
      {/* Conversation list */}
      <div className="col-span-4 border-r border-border/50 flex flex-col bg-black/20">
        <div className="p-3 border-b border-border/50 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm bg-white/5"
            />
          </div>
          <div className="flex gap-1">
            <Button
              variant={selectedChannel === "all" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setSelectedChannel("all")}
            >
              All
            </Button>
            <Button
              variant={selectedChannel === "whatsapp" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setSelectedChannel("whatsapp")}
            >
              <WhatsAppIcon className="h-3 w-3 mr-1" />
              WA
            </Button>
            <Button
              variant={selectedChannel === "line" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setSelectedChannel("line")}
            >
              <LineIcon className="h-3 w-3 mr-1" />
              LINE
            </Button>
            <Button
              variant={selectedChannel === "email" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setSelectedChannel("email")}
            >
              <Mail className="h-3 w-3 mr-1" />
              Mail
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <div
              key={conv.memberId}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-border/30 ${
                selectedConversation?.memberId === conv.memberId
                  ? "bg-white/10"
                  : "hover:bg-white/5"
              }`}
              onClick={() => setSelectedConversation(conv)}
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/20 text-xs">
                    {conv.memberName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5">
                  {getChannelIcon(conv.channel)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{conv.memberName}</span>
                  <span className="text-[10px] text-muted-foreground">{conv.lastMessageTime}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
              </div>
              {conv.unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground h-5 min-w-5 flex items-center justify-center text-xs rounded-full">
                  {conv.unreadCount}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="col-span-8 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div className="p-3 border-b border-border/50 flex items-center justify-between bg-black/10">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/20 text-xs">
                    {selectedConversation.memberName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{selectedConversation.memberName}</span>
                    {getChannelIcon(selectedConversation.channel)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    via {selectedConversation.channel === "whatsapp" ? "WhatsApp" : selectedConversation.channel === "line" ? "LINE" : selectedConversation.channel}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.direction === "outbound"
                        ? msg.channel === "whatsapp"
                          ? "bg-green-900/40 border border-green-500/20"
                          : "bg-[#06C755]/20 border border-[#06C755]/20"
                        : "bg-white/10 border border-white/10"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                      {msg.direction === "outbound" && getStatusIcon(msg.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message input */}
            <div className="p-3 border-t border-border/50 bg-black/10">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Image className="h-4 w-4" />
                </Button>
                <Input
                  placeholder={`Message via ${selectedConversation.channel === "whatsapp" ? "WhatsApp" : "LINE"}...`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 h-8 text-sm bg-white/5"
                />
                <Button
                  size="sm"
                  className="h-8"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Templates view
  const renderTemplates = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={selectedChannel === "all" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedChannel("all")}
          >
            All Templates
          </Button>
          <Button
            variant={selectedChannel === "whatsapp" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedChannel("whatsapp")}
          >
            <WhatsAppIcon className="h-3 w-3 mr-1" /> WhatsApp
          </Button>
          <Button
            variant={selectedChannel === "line" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedChannel("line")}
          >
            <LineIcon className="h-3 w-3 mr-1" /> LINE
          </Button>
          <Button
            variant={selectedChannel === "email" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedChannel("email")}
          >
            <Mail className="h-3 w-3 mr-1" /> Email
          </Button>
        </div>
        <Button size="sm" onClick={() => toast.info("Template editor coming soon")}>
          <Plus className="h-3 w-3 mr-1" /> New Template
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {demoTemplates
          .filter(t => selectedChannel === "all" || t.channel === selectedChannel)
          .map((template) => (
            <Card key={template.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(template.channel)}
                    <span className="font-medium text-sm">{template.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">{template.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{template.content}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs h-7 flex-1">
                    Edit
                  </Button>
                  <Button size="sm" className="text-xs h-7 flex-1" onClick={() => {
                    setBroadcastChannel(template.channel);
                    setBroadcastMessage(template.content);
                    setBroadcastDialogOpen(true);
                  }}>
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {viewMode !== "overview" && (
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setViewMode("overview"); setSelectedConversation(null); }}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h3 className="font-semibold">Communication Center</h3>
                <p className="text-xs text-muted-foreground">
                  {viewMode === "overview" && "Manage all messaging channels"}
                  {viewMode === "conversations" && "Direct conversations with members"}
                  {viewMode === "broadcast" && "Send broadcast messages"}
                  {viewMode === "templates" && "Message templates"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {totalUnread > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {totalUnread} unread
                </Badge>
              )}
              <div className="flex gap-1">
                <Button
                  variant={viewMode === "overview" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setViewMode("overview")}
                >
                  <Globe className="h-3 w-3 mr-1" />
                  Overview
                </Button>
                <Button
                  variant={viewMode === "conversations" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setViewMode("conversations")}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Chats
                </Button>
                <Button
                  variant={viewMode === "templates" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setViewMode("templates")}
                >
                  <Smartphone className="h-3 w-3 mr-1" />
                  Templates
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === "overview" && renderOverview()}
      {viewMode === "conversations" && renderConversations()}
      {viewMode === "templates" && renderTemplates()}

      {/* Broadcast Dialog */}
      <Dialog open={broadcastDialogOpen} onOpenChange={setBroadcastDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getChannelIcon(broadcastChannel)}
              Broadcast via {channels.find(c => c.id === broadcastChannel)?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Channel</Label>
              <Select value={broadcastChannel} onValueChange={(v) => setBroadcastChannel(v as ChannelType)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">
                    <div className="flex items-center gap-2"><WhatsAppIcon className="h-4 w-4" /> WhatsApp</div>
                  </SelectItem>
                  <SelectItem value="line">
                    <div className="flex items-center gap-2"><LineIcon className="h-4 w-4" /> LINE</div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Target Audience</Label>
              <Select value={broadcastTarget} onValueChange={(v) => setBroadcastTarget(v as "all" | "active" | "inactive")}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members ({members.length})</SelectItem>
                  <SelectItem value="active">Active Members Only</SelectItem>
                  <SelectItem value="inactive">Inactive Members (Re-engagement)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-sm">Message</Label>
                <Select value={selectedTemplate} onValueChange={(v) => {
                  setSelectedTemplate(v);
                  const template = demoTemplates.find(t => t.id === v);
                  if (template) setBroadcastMessage(template.content);
                }}>
                  <SelectTrigger className="w-[180px] h-7 text-xs">
                    <SelectValue placeholder="Use template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {demoTemplates
                      .filter(t => t.channel === broadcastChannel)
                      .map(t => (
                        <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Type your message..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {"{name}"} for member name, {"{date}"} for date, {"{time}"} for time
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBroadcastDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendBroadcast} disabled={!broadcastMessage.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
