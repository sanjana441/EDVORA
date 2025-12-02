import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProfileClick = () => {
    if (profile?.role === 'student') {
      navigate('/student/profile');
    } else {
      navigate('/teacher/profile');
    }
    setMobileMenuOpen(false);
  };

  const handleDashboardClick = () => {
    if (profile?.role === 'student') {
      navigate('/student/dashboard');
    } else {
      navigate('/teacher/dashboard');
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="p-2 md:p-2.5 rounded-xl gradient-primary shadow-glow transition-bounce group-hover:scale-110 group-hover:rotate-3">
              <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-display font-bold text-gradient">
              Edvora
            </span>
          </Link>

          {user && profile && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={handleDashboardClick}
                  className="font-semibold hover:bg-primary/10 hover:text-primary transition-smooth"
                >
                  Dashboard
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full border-2 border-primary/20 hover:border-primary hover:bg-primary/10 transition-smooth"
                    >
                      <User className="h-5 w-5 text-primary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass rounded-xl p-2">
                    <DropdownMenuLabel className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-display font-bold text-foreground">{profile.full_name}</span>
                        <span className="text-xs text-muted-foreground capitalize font-medium">{profile.role}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem 
                      onClick={handleDashboardClick}
                      className="rounded-lg cursor-pointer hover:bg-primary/10 transition-smooth"
                    >
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleProfileClick}
                      className="rounded-lg cursor-pointer hover:bg-primary/10 transition-smooth"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem 
                      onClick={signOut} 
                      className="rounded-lg cursor-pointer text-destructive hover:bg-destructive/10 transition-smooth"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && user && profile && (
          <div className="md:hidden mt-4 pb-2 border-t border-border/50 pt-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              <div className="px-3 py-2 mb-2">
                <p className="font-display font-bold text-foreground">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
              </div>
              <Button
                variant="ghost"
                onClick={handleDashboardClick}
                className="justify-start font-semibold hover:bg-primary/10"
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={handleProfileClick}
                className="justify-start font-semibold hover:bg-primary/10"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button
                variant="ghost"
                onClick={signOut}
                className="justify-start font-semibold text-destructive hover:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
