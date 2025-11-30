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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="bg-primary">
                <AvatarFallback className="text-white font-semibold">
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold">{user.username}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Contacts</CardTitle>
                  <CardDescription>
                    You have {user.contacts?.length || 0} contact{user.contacts?.length !== 1 ? 's' : ''} saved
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <AddContactDialog userId={user.id} onContactAdded={handleRefresh} />
                  <UploadVCFDialog userId={user.id} onContactsUploaded={handleRefresh} />
                  <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ContactList contacts={user.contacts || []} onContactUpdate={handleRefresh} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
