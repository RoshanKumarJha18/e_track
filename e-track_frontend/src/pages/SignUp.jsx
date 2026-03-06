import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <SignUp routing="path" path="/signup" signInUrl="/login" fallbackRedirectUrl="/auth-callback" />
    </div>
  );
};

export default SignUpPage;