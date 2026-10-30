import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  BarChart3,
  ShoppingCart,
  Package,
  Layers,
  Image as ImageIcon,
  Users,
  Star,
  Ticket,
  Heart,
  Mail,
  MessageSquare,
  Flag,
  Shield,
  Settings,
  ExternalLink,
  LogOut,
  ChevronLeft,
  X,
  Compass,
  Building2,
  CalendarCheck,
  CalendarDays,
  ShieldCheck,
  Landmark,
  ShieldAlert
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutGrid, exact: true },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Bookings', path: '/orders', icon: CalendarCheck },
  { name: 'Seller Requests', path: '/seller-requests', icon: Building2 },
  { name: 'Site Visits', path: '/site-visits', icon: CalendarDays },
  { name: 'Properties', path: '/properties', icon: Package },
  { name: 'Categories', path: '/categories', icon: Layers },
  { name: 'KYC Verification', path: '/kyc-verification', icon: ShieldCheck },
  { name: 'Marketing', path: '/marketing', icon: ImageIcon },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Reviews', path: '/reviews', icon: Star },
  { name: 'Property Reports', path: '/property-reports', icon: ShieldAlert },
  { name: 'Coupons & Offers', path: '/coupons', icon: Ticket },
  { name: 'Favorites', path: '/favorites', icon: Heart },
  { name: 'Live Chat', path: '/messages', icon: MessageSquare },
  { name: 'Inquiries & Leads', path: '/inquiries', icon: Mail },
  { name: 'Reports', path: '/reports', icon: Flag },
  { name: 'Sub-Admins', path: '/sub-admins', icon: Shield },
  { name: 'Bank & Payouts', path: '/payouts', icon: Landmark },
  { name: 'Settings', path: '/settings', icon: Settings },
];

/* ── color tokens ─────────────────────────────────────────── */
const dk = {
  sidebar:    '#1a232c',   // main sidebar bg (navy-900)
  sidebarBdr: '#2d3d4e',   // border (navy-600)
  sidebarHdr: '#141d26',   // header bg (darker navy)
  itemHover:  '#243140',   // nav item hover (navy-700)
  itemActive: '#c39379',   // active bg = brand
  textPri:    '#e8ddd4',   // primary text (warm cream)
  textSec:    '#a09484',   // secondary text
  userCard:   '#1f2b36',   // user card bg
};

const lt = {
  sidebar:    '#ffffff',
  sidebarBdr: '#ede5da',   // warm sand border
  sidebarHdr: '#faf8f5',   // cream header
  itemHover:  '#f5f0eb',   // warm cream hover
  itemActive: '#c39379',   // active bg = brand
  textPri:    '#1a232c',
  textSec:    '#6b7280',
  userCard:   '#faf8f5',
};

const Sidebar = ({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user, logout } = useAuth();
  const c = isDark ? dk : lt;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = React.useMemo(() => {
    return navItems;
  }, []);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          style={{ backgroundColor: isDark ? 'rgba(10,15,20,0.75)' : 'rgba(26,35,44,0.35)' }}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          backgroundColor: c.sidebar,
          borderRight: `1px solid ${c.sidebarBdr}`,
        }}
      >
        {/* Brand Header */}
        <div
          className="h-16 flex items-center justify-between px-4 shrink-0"
          style={{ backgroundColor: c.sidebarHdr, borderBottom: `1px solid ${c.sidebarBdr}` }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs shrink-0"
              style={{ backgroundColor: isDark ? '#243140' : '#faf8f5', border: `1.5px solid ${c.sidebarBdr}` }}
            >
              <Compass size={22} className="text-brand" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span
                  className="font-extrabold text-base tracking-tight leading-tight"
                  style={{ color: c.textPri }}
                >
                  EstateAdmin
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand">
                  Port : 5174
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: c.textPri }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: c.textSec, border: `1px solid ${c.sidebarBdr}` }}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <ChevronLeft
              size={16}
              className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Quick link to client storefront */}
        <div className="p-3">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all group shadow-xs ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            style={{
              backgroundColor: isDark ? '#243140' : '#f5f0eb',
              color: c.textPri,
              border: `1px solid ${c.sidebarBdr}`,
            }}
            title="Open Customer Storefront (localhost:5173)"
          >
            <ExternalLink size={15} className="text-brand shrink-0 group-hover:scale-110 transition-transform" />
            {!isCollapsed && (
              <span className="truncate flex items-center gap-1.5">
                View Storefront <span className="text-[10px] opacity-60">(5173)</span>
              </span>
            )}
          </a>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 py-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 group
                  ${isCollapsed ? 'justify-center px-0' : ''}
                  ${isActive ? 'nav-item-active' : 'nav-item-idle'}
                `}
                title={isCollapsed ? item.name : undefined}
                style={({ isActive }) => ({
                  backgroundColor: isActive ? c.itemActive : 'transparent',
                  color: isActive ? '#ffffff' : c.textSec,
                })}
                onMouseEnter={(e) => {
                  const isActive = e.currentTarget.classList.contains('nav-item-active');
                  if (!isActive) e.currentTarget.style.backgroundColor = c.itemHover;
                  if (!isActive) e.currentTarget.style.color = c.textPri;
                }}
                onMouseLeave={(e) => {
                  const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  if (!isActive) e.currentTarget.style.color = c.textSec;
                }}
              >
                <Icon size={18} className="shrink-0 group-hover:scale-105 transition-transform" />
                {!isCollapsed && <span className="flex-1 truncate">{item.name}</span>}
                {!isCollapsed && item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-brand text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div
          className="p-3 shrink-0"
          style={{ borderTop: `1px solid ${c.sidebarBdr}`, backgroundColor: c.sidebarHdr }}
        >
          <div
            className={`flex items-center gap-3 p-2 rounded-xl ${isCollapsed ? 'justify-center p-1.5' : ''}`}
            style={{ backgroundColor: c.userCard, border: `1px solid ${c.sidebarBdr}` }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 text-brand"
              style={{ backgroundColor: isDark ? '#243140' : '#faf8f5', border: `1px solid ${c.sidebarBdr}` }}
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: c.textPri }}>
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[10px] font-medium truncate" style={{ color: c.textSec }}>
                  {user?.email || 'admin@realestate.com'}
                </p>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg transition-colors cursor-pointer hover:text-red-400"
                style={{ color: c.textSec }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
