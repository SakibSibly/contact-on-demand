import React from 'react';
import type { Contact } from '../lib/types';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronUp, Mail, Phone as PhoneIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface ContactCardProps {
  contact: Contact;
  onExpand: (contactId: string) => void;
  isExpanded: boolean;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, onExpand, isExpanded }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isExpanded && 'ring-2 ring-primary'
      )}
      onClick={() => onExpand(contact.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className={getAvatarColor(contact.name)}>
              <AvatarFallback className="text-white">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{contact.name}</h3>
              {contact.email && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{contact.email}</span>
                </div>
              )}
              {!isExpanded && contact.phones && contact.phones.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {contact.phones.length} {contact.phones.length === 1 ? 'number' : 'numbers'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="ml-2">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {isExpanded && contact.phones && contact.phones.length > 0 && (
          <div className="mt-4 pt-4 border-t space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Phone Numbers</h4>
            {contact.phones.map((phone) => (
              <div
                key={phone.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-primary" />
                  <span className="font-medium">{phone.number}</span>
                </div>
                {phone.number_type && (
                  <Badge variant="outline" className="text-xs">
                    {phone.number_type}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {isExpanded && (!contact.phones || contact.phones.length === 0) && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center py-2">
              No phone numbers available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
