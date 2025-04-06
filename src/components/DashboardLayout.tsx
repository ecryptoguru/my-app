'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Package, 
  DollarSign, 
  Users, 
  Truck, 
  FileText, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  User,
  ChevronRight
} from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
}

const NavItem = ({ href, icon, label, isCollapsed, isActive }: NavItemProps) => {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-primary/10 text-primary' 
          : 'hover:bg-muted/80 text-muted-foreground hover:text-foreground'
      }`}
    >
      <div className="flex-shrink-0">{icon}</div>
      {!isCollapsed && <span className="font-medium">{label}</span>}
      {isActive && isCollapsed && (
        <div className="absolute right-0 w-1 h-8 bg-primary rounded-l-md"></div>
      )}
    </Link>
  );
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { href: '/dashboard/demand-forecasting', icon: <BarChart size={20} />, label: 'Demand Forecasting' },
    { href: '/dashboard/inventory-management', icon: <Package size={20} />, label: 'Inventory Management' },
    { href: '/dashboard/pricing-strategies', icon: <DollarSign size={20} />, label: 'Pricing Strategies' },
    { href: '/dashboard/customer-segmentation', icon: <Users size={20} />, label: 'Customer Segmentation' },
    { href: '/dashboard/supplier-performance', icon: <Truck size={20} />, label: 'Supplier Performance' },
    { href: '/dashboard/business-reporting', icon: <FileText size={20} />, label: 'Business Reporting' },
    { href: '/dashboard/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="md:hidden"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu size={20} />
            </Button>
            <h1 className="text-xl font-bold">Business Assistant</h1>
          </div>
          <div className="flex items-center gap-4">
            {session?.user?.name && (
              <div className="flex items-center gap-2">
                {session.user.image ? (
                  <Image 
                    src={session.user.image} 
                    alt={session.user.name || 'User profile'} 
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
                <span className="text-sm font-medium hidden sm:inline-block">
                  {session.user.name}
                </span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside 
          className={`bg-muted/10 border-r fixed md:sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto transition-all duration-300 z-20 ${
            isCollapsed ? 'w-[60px]' : 'w-[240px]'
          } ${
            isCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
          }`}
        >
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              {!isCollapsed && <h2 className="font-semibold">Navigation</h2>}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:flex"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <ChevronRight size={18} /> : <X size={18} />}
              </Button>
            </div>
            
            <nav className="space-y-1 flex-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isCollapsed={isCollapsed}
                  isActive={pathname === item.href}
                />
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'md:ml-[60px]' : 'md:ml-[240px]'}`}>
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
