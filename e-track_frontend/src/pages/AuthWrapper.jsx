import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useSession } from '@clerk/clerk-react';

const AuthWrapper = () => {
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait until Clerk is fully loaded and has a user and session
    if (!isLoaded || !user || !session) return;

    const currentRole = user.publicMetadata.role;

    if (currentRole) {
      // If the user has a role, redirect them to the correct page.
      if (currentRole === 'government') {
        navigate('/admin-portal', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      // If the user has NO role, they are a new user. Set the default role.
      // The component will re-render, and the logic above will handle the redirect.
      const setDefaultRole = async () => {
        await user.update({ publicMetadata: { role: 'citizen' } });
        await session.reload();
      };
      setDefaultRole();
    }
  }, [isLoaded, user, session, navigate]);

  // Render a loading indicator while the logic runs
  return <div className="min-h-screen flex justify-center items-center"><p>Finalizing setup...</p></div>;
};

export default AuthWrapper;