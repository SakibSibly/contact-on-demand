import React, { useState } from 'react';
import { contactsAPI } from '../lib/api';
import type { Contact } from '../lib/types';
import { ContactCard } from '../components/ContactCard';
import { Input } from '../components/ui/input';
import { Search } from 'lucide-react';

interface ContactListProps {
  contacts: Contact[];
  onContactUpdate: () => void;
}

export const ContactList: React.FC<ContactListProps> = ({ contacts }) => {
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);
  const [detailedContacts, setDetailedContacts] = useState<Map<string, Contact>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');

  const handleExpand = async (contactId: string) => {
    if (expandedContactId === contactId) {
      setExpandedContactId(null);
      return;
    }

    setExpandedContactId(contactId);

    // Fetch detailed contact info if not already loaded
    if (!detailedContacts.has(contactId)) {
      try {
        const detailedContact = await contactsAPI.getById(contactId);
        setDetailedContacts(prev => new Map(prev).set(contactId, detailedContact));
      } catch (error) {
        console.error('Failed to fetch contact details:', error);
      }
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? 'No contacts found matching your search.' : 'No contacts yet. Add your first contact!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredContacts.map((contact) => {
            const detailedContact = detailedContacts.get(contact.id);
            const displayContact = detailedContact || contact;

            return (
              <ContactCard
                key={contact.id}
                contact={displayContact}
                onExpand={handleExpand}
                isExpanded={expandedContactId === contact.id}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
