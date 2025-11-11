import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { VotingCard } from "@/components/VotingCard";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import logoMain from "@/assets/logo-main.png";

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
    <div className="min-h-screen bg-gradient-to-br from-starburst-from to-starburst-to py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <img
            src={logoMain}
            alt="MDA 2025"
            className="w-48 h-48 mx-auto mb-4 drop-shadow-2xl animate-pulse"
          />
          <h1 className="text-5xl font-black text-primary drop-shadow-lg mb-2 uppercase tracking-tight">
            Melhores do Ano
          </h1>
          <p className="text-xl font-bold text-accent drop-shadow-md">2025</p>
          <p className="mt-4 text-lg font-semibold text-foreground">
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
        <div className="sticky bottom-4">
          <Button
            onClick={handleSubmit}
            disabled={!allCategoriesVoted || isSubmitting}
            className="w-full h-16 text-2xl font-black uppercase shadow-pop transform hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
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
