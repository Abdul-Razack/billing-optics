import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthCard 
      title="Sign In" 
      description="Enter your credentials to access the ERP dashboard."
    >
      <LoginForm />
    </AuthCard>
  );
}
