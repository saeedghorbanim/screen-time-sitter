
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BuddiesList } from './BuddiesList';
import { BuddyRequests } from './BuddyRequests';
import { Users, UserPlus } from 'lucide-react';

export const BuddiesView = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="buddies">
        <TabsList className="grid w-full grid-cols-2 bg-white/50 border border-primary/10">
          <TabsTrigger value="buddies" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Buddies
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buddies" className="mt-6">
          <BuddiesList />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <BuddyRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
};
