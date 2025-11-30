import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ContactList } from '../components/ContactList';
import { AddContactDialog } from '../components/AddContactDialog';
import { UploadVCFDialog } from '../components/UploadVCFDialog';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { LogOut, Mail } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Avatar className="bg-primary h-8 w-8 sm:h-10 sm:w-10">
                <AvatarFallback className="text-white font-semibold text-xs sm:text-sm">
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-xl font-bold truncate">{user.username}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm" className="flex-shrink-0">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg sm:text-xl">My Contacts</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    You have {user.contacts?.length || 0} contact{user.contacts?.length !== 1 ? 's' : ''} saved
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AddContactDialog userId={user.id} onContactAdded={handleRefresh} />
                  <UploadVCFDialog userId={user.id} onContactsUploaded={handleRefresh} />
                  <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm" className="flex-shrink-0">
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <ContactList contacts={user.contacts || []} onContactUpdate={handleRefresh} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
