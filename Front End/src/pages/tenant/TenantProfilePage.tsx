import React from 'react';
import { TenantLayout } from '../../components/TenantLayout';
import { ProfileSection } from '../../components/ProfileSection';
import { useAuth } from '../../contexts/AuthContext';

export const TenantProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <TenantLayout>
      <div>
        {user && (
          <ProfileSection 
            user={user} 
            onUpdate={(updatedUser) => {
              // Update handled by ProfileSection via useAuth
            }}
          />
        )}
      </div>
    </TenantLayout>
  );
};

