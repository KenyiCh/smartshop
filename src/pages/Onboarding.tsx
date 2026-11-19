
import OnboardingFlow from "@/components/OnboardingFlow";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { markOnboardingCompleted } from "@/utils/session";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleOnboardingComplete = () => {
    markOnboardingCompleted();
    toast({
      title: "¡Perfecto!",
      description: "Tu experiencia ha sido personalizada exitosamente",
    });
    navigate("/");
  };

  return <OnboardingFlow onComplete={handleOnboardingComplete} />;
};

export default Onboarding;
