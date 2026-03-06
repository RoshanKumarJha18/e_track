import { useUser, useSession } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const SelectRolePage = () => {
    const { user, isLoaded } = useUser();
    const navigate = useNavigate();
    const { session } = useSession();

    useEffect(() => {
        // Wait until the user object is fully loaded
        if (!isLoaded || !user) {
            return;
        }

        // If the user already has a role, redirect to dashboard
        if (user.unsafeMetadata.role) {
            navigate("/dashboard", { state: { role: user.unsafeMetadata.role } });
            return;
        }
        handleRoleSelect('citizen');

    }, [isLoaded, user, navigate]);

    const handleRoleSelect = async (role) => {
        if (!user) return;

        try {
            // Using unsafeMetadata is fine for client-side role info.
            // For authorization, use publicMetadata and a backend endpoint.
            const updatedUser = await user.update({
                unsafeMetadata: { ...user.unsafeMetadata, role: role }
            });

            if (updatedUser.unsafeMetadata.role === role) {
                // Force a session reload to ensure the new metadata is in the session token
                await session.reload();
                navigate("/dashboard", { replace: true });
            }
        } catch (err) {
            console.error("Error updating user metadata", err);
        }
    };

    // This component will render nothing, as it's only for logic and redirection.
    return null;
};

export default SelectRolePage;