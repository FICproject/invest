import React from 'react';
import { View, Text } from 'react-native';

const iconGlyphs = {
  AlertCircle: '⚠️',
  AlertTriangle: '⚠️',
  ArrowRight: '→',
  BarChart3: '📊',
  Bell: '🔔',
  Briefcase: '💼',
  Building2: '🏢',
  Calendar: '📅',
  Check: '✓',
  CheckCircle: '✓',
  CheckCircle2: '✓',
  ChevronDown: '⌄',
  ChevronRight: '›',
  Clock: '🕒',
  Coins: '🪙',
  CreditCard: '💳',
  Download: '📥',
  Edit3: '✏️',
  ExternalLink: '↗',
  Eye: '👁️',
  EyeOff: '🙈',
  FileText: '📄',
  Filter: '⚙️',
  Folder: '📁',
  HelpCircle: '❓',
  Info: 'ℹ️',
  Layers: '📚',
  LayoutDashboard: '📊',
  LayoutGrid: '⊞',
  Lock: '🔒',
  LogOut: '🚪',
  Mail: '✉️',
  Menu: '☰',
  MessageSquare: '💬',
  Percent: '%',
  Phone: '📞',
  PieChart: '🥧',
  Plus: '+',
  PlusCircle: '⊕',
  RefreshCw: '🔄',
  Rocket: '🚀',
  Search: '🔍',
  Send: '📤',
  Server: '🖥️',
  Settings: '⚙️',
  Share2: '🔗',
  Shield: '🛡️',
  ShieldAlert: '🛡️!',
  ShieldCheck: '🛡️',
  Tag: '🏷️',
  Trash2: '🗑️',
  TrendingUp: '📈',
  Upload: '📤',
  User: '👤',
  UserPlus: '👤+',
  Users: '👥',
  Wallet: '👛',
  X: '✕',
  XCircle: '⊗',
  Zap: '⚡',
};

function createIcon(name) {
  const IconComponent = ({ size = 20, color = '#333', style }) => {
    const glyph = iconGlyphs[name] || '•';
    return (
      <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
        <Text style={{ fontSize: size * 0.75, color, textAlign: 'center', includeFontPadding: false }}>
          {glyph}
        </Text>
      </View>
    );
  };
  IconComponent.displayName = name;
  return IconComponent;
}

export const AlertCircle = createIcon('AlertCircle');
export const AlertTriangle = createIcon('AlertTriangle');
export const ArrowRight = createIcon('ArrowRight');
export const BarChart3 = createIcon('BarChart3');
export const Bell = createIcon('Bell');
export const Briefcase = createIcon('Briefcase');
export const Building2 = createIcon('Building2');
export const Calendar = createIcon('Calendar');
export const Check = createIcon('Check');
export const CheckCircle = createIcon('CheckCircle');
export const CheckCircle2 = createIcon('CheckCircle2');
export const ChevronDown = createIcon('ChevronDown');
export const ChevronRight = createIcon('ChevronRight');
export const Clock = createIcon('Clock');
export const Coins = createIcon('Coins');
export const Download = createIcon('Download');
export const Edit3 = createIcon('Edit3');
export const ExternalLink = createIcon('ExternalLink');
export const Eye = createIcon('Eye');
export const EyeOff = createIcon('EyeOff');
export const FileText = createIcon('FileText');
export const Filter = createIcon('Filter');
export const Folder = createIcon('Folder');
export const HelpCircle = createIcon('HelpCircle');
export const Info = createIcon('Info');
export const Layers = createIcon('Layers');
export const LayoutDashboard = createIcon('LayoutDashboard');
export const LayoutGrid = createIcon('LayoutGrid');
export const Lock = createIcon('Lock');
export const LogOut = createIcon('LogOut');
export const Mail = createIcon('Mail');
export const Menu = createIcon('Menu');
export const Percent = createIcon('Percent');
export const Phone = createIcon('Phone');
export const PieChart = createIcon('PieChart');
export const Plus = createIcon('Plus');
export const PlusCircle = createIcon('PlusCircle');
export const RefreshCw = createIcon('RefreshCw');
export const Rocket = createIcon('Rocket');
export const Search = createIcon('Search');
export const Send = createIcon('Send');
export const Server = createIcon('Server');
export const Share2 = createIcon('Share2');
export const Shield = createIcon('Shield');
export const ShieldAlert = createIcon('ShieldAlert');
export const ShieldCheck = createIcon('ShieldCheck');
export const Tag = createIcon('Tag');
export const Trash2 = createIcon('Trash2');
export const TrendingUp = createIcon('TrendingUp');
export const Upload = createIcon('Upload');
export const User = createIcon('User');
export const UserPlus = createIcon('UserPlus');
export const Users = createIcon('Users');
export const Wallet = createIcon('Wallet');
export const CreditCard = createIcon('CreditCard');
export const MessageSquare = createIcon('MessageSquare');
export const Settings = createIcon('Settings');
export const X = createIcon('X');
export const XCircle = createIcon('XCircle');
export const Zap = createIcon('Zap');

// Proxy fallback so ANY icon name imported from Icons never returns undefined
const proxyHandler = {
  get: (target, prop) => {
    if (prop in target) return target[prop];
    if (typeof prop === 'string') {
      return createIcon(prop);
    }
    return undefined;
  }
};

const Icons = new Proxy({
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Folder,
  HelpCircle,
  Info,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Lock,
  LogOut,
  Mail,
  Menu,
  Percent,
  Phone,
  PieChart,
  Plus,
  PlusCircle,
  RefreshCw,
  Rocket,
  Search,
  Send,
  Server,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  User,
  UserPlus,
  Users,
  Wallet,
  X,
  XCircle,
  Zap,
}, proxyHandler);

export default Icons;
