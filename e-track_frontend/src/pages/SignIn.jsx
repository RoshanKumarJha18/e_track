import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <SignIn routing="path" path="/login" signUpUrl="/signup" fallbackRedirectUrl="/auth-callback" />
    </div>
  );
};

export default SignInPage;