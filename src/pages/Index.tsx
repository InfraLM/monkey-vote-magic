import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { VotingCard } from "@/components/VotingCard";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import logoMain from "@/assets/logo-main.png";
import badgeMonkey from "@/assets/badge-monkey.png";
import logoCheers from "@/assets/logo-cheers.png";
import mascotFull from "@/assets/mascot-full.png";
import monkeysGroup from "@/assets/monkeys-group.png";

interface Category {
  id: string;
  title: string;
  alternatives: string[];
  display_order: number;
}

const Index = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order");

    if (error) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setCategories(data || []);
    setIsLoading(false);
  };

  const handleVoteChange = (categoryId: string, value: string) => {
    setVotes((prev) => ({ ...prev, [categoryId]: value }));
  };

  const allCategoriesVoted = categories.every((cat) => votes[cat.id]);

  const getUserIP = async (): Promise<string> => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error getting IP:", error);
      return "unknown";
    }
  };

  const handleSubmit = async () => {
    if (!allCategoriesVoted) {
      toast({
        title: "Votação incompleta",
        description: "Por favor, vote em todas as categorias antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const ip = await getUserIP();

      // Build the JSON payload in the required format
      const payload: Record<string, string> = { ip };

      categories.forEach((category, index) => {
        const questionNumber = index + 1;
        payload[`pergunta_${questionNumber}`] = category.title;
        payload[`resposta_${questionNumber}`] = votes[category.id];
      });

      // Send to webhook
      const response = await fetch(
        "https://projetolm-n8n.8x0hqh.easypanel.host/webhook/b86cca4d-e2f0-483e-9b68-a41a69c64f11",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit vote");
      }

      toast({
        title: "🎉 Voto registrado!",
        description: "Seu voto foi registrado com sucesso! Obrigado por participar!",
      });

      // Clear votes
      setVotes({});
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast({
        title: "Erro ao enviar voto",
        description: "Ocorreu um erro ao enviar seu voto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-starburst-from to-starburst-to">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-starburst-from to-starburst-to relative overflow-hidden">
      {/* Decorative Stickers Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <img
          src={badgeMonkey}
          alt=""
          className="absolute top-20 left-4 w-16 sm:w-24 rotate-12 animate-pulse"
        />
        <img
          src={mascotFull}
          alt=""
          className="absolute top-40 right-4 w-20 sm:w-32 -rotate-12"
        />
        <img
          src={logoCheers}
          alt=""
          className="absolute top-[60%] left-8 w-24 sm:w-36 rotate-6"
        />
        <img
          src={monkeysGroup}
          alt=""
          className="absolute bottom-20 right-8 w-32 sm:w-48 -rotate-6"
        />
        <img
          src={badgeMonkey}
          alt=""
          className="absolute bottom-40 left-4 w-20 sm:w-28 rotate-45"
        />
      </div>

      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 mt-4">
          <div className="w-32 h-32 sm:w-48 sm:h-48 mx-auto mb-4">
            <img
              src={logoMain}
              alt="MDA 2025"
              className="w-full h-full object-contain drop-shadow-2xl animate-pulse"
            />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-accent drop-shadow-md mb-2">2025</p>
          <p className="mt-2 text-base sm:text-lg font-semibold text-foreground">
            Vote em todas as categorias para participar! 🎉
          </p>
        </div>

        {/* Voting Cards */}
        <div className="space-y-6 mb-8">
          {categories.map((category) => (
            <VotingCard
              key={category.id}
              title={category.title}
              alternatives={category.alternatives}
              selectedValue={votes[category.id] || ""}
              onValueChange={(value) => handleVoteChange(category.id, value)}
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-4 pb-4">
          <Button
            onClick={handleSubmit}
            disabled={!allCategoriesVoted || isSubmitting}
            className="w-full h-14 sm:h-16 text-xl sm:text-2xl font-black uppercase shadow-pop transform hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Voto! 🚀"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
