import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { VotingCard } from "@/components/VotingCard";
import { Header } from "@/components/Header";
import { ThankYouPage } from "@/components/ThankYouPage";
import { VotingClosedPage } from "@/components/VotingClosedPage";
import { useToast } from "@/hooks/use-toast";
import { useParallax } from "@/hooks/use-parallax";
import { Loader2 } from "lucide-react";
import logoMain from "@/assets/logo-main.png";
import stickerMda from "@/assets/sticker-mda.png";
import stickerProblematica from "@/assets/sticker-problematica.png";
import sticker14Dez from "@/assets/sticker-14dez.png";
import stickerHop from "@/assets/sticker-hop.png";
import stickerTv from "@/assets/sticker-tv.png";
import stickerPixel from "@/assets/sticker-pixel.png";
import stickerSoldout from "@/assets/sticker-soldout.png";
import stickerMonkeyBadge from "@/assets/sticker-monkey-badge.png";
import stickerVenenosa from "@/assets/sticker-venenosa.png";
import stickerEngenharia from "@/assets/sticker-engenharia.png";
interface Category {
  id: string;
  title: string;
  alternatives: string[];
  display_order: number;
}
const Index = () => {
  const {
    toast
  } = useToast();
  const scrollY = useParallax();
  const [categories, setCategories] = useState<Category[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showThankYou, setShowThankYou] = useState(false);
  const [votingActive, setVotingActive] = useState(true);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    checkVotingStatus();
    loadCategories();
  }, []);

  const checkVotingStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "voting_active")
        .single();
      
      if (data) {
        setVotingActive(data.value === true);
      }
    } catch (error) {
      console.error("Error checking voting status:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  };
  const loadCategories = async () => {
    const {
      data,
      error
    } = await supabase.from("categories").select("*").order("display_order");
    if (error) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    setCategories(data || []);
    setIsLoading(false);
  };
  const handleVoteChange = (categoryId: string, value: string) => {
    setVotes(prev => ({
      ...prev,
      [categoryId]: value
    }));
  };
  const allCategoriesVoted = categories.every(cat => votes[cat.id]);
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
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const ip = await getUserIP();

      // 1. Save votes to Supabase database
      const votesData = categories.map(category => ({
        ip_address: ip,
        category_id: category.id,
        category_title: category.title,
        selected_alternative: votes[category.id]
      }));
      
      const { error: dbError } = await supabase
        .from("votes")
        .insert(votesData);
      
      if (dbError) {
        console.error("Error saving votes to database:", dbError);
        // Continue even if database save fails (webhook still works)
      }

      // 2. Build the JSON payload in the required format
      const payload: Record<string, string> = {
        ip
      };
      categories.forEach((category, index) => {
        const questionNumber = index + 1;
        payload[`${questionNumber}`] = `${category.title}|${votes[category.id]}`;
      });

      // 3. Send to webhook
      const response = await fetch("https://projetolm-n8n.8x0hqh.easypanel.host/webhook/b86cca4d-e2f0-483e-9b68-a41a69c64f11", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error("Failed to submit vote");
      }
      toast({
        title: "🎉 Voto registrado!",
        description: "Seu voto foi registrado com sucesso! Obrigado por participar!"
      });

      // Show thank you page
      setShowThankYou(true);
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast({
        title: "Erro ao enviar voto",
        description: "Ocorreu um erro ao enviar seu voto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isLoading || isCheckingStatus) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-starburst-from to-starburst-to">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>;
  }

  // Show voting closed page if voting is disabled
  if (!votingActive) {
    return <VotingClosedPage />;
  }

  // Show thank you page after successful submission
  if (showThankYou) {
    return <ThankYouPage onContinueVoting={() => {
      setShowThankYou(false);
      setVotes({});
    }} />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-starburst-from to-starburst-to relative overflow-hidden">
      {/* Decorative Stickers Background with Parallax */}
      <div className="fixed inset-0 pointer-events-none opacity-50 z-0">
        <img 
          src={stickerMda} 
          alt="" 
          className="absolute top-20 left-4 w-32 sm:w-40 rotate-12 transition-transform" 
          style={{ transform: `translateY(${scrollY * 0.1}px) rotate(12deg)` }}
        />
        <img 
          src={stickerProblematica} 
          alt="" 
          className="absolute top-40 right-4 w-36 sm:w-48 -rotate-12 transition-transform" 
          style={{ transform: `translateY(${scrollY * 0.15}px) rotate(-12deg)` }}
        />
        <img 
          src={sticker14Dez} 
          alt="" 
          className="absolute top-[60%] left-8 w-28 sm:w-36 rotate-6 transition-transform" 
          style={{ transform: `translateY(${scrollY * 0.08}px) rotate(6deg)` }}
        />
        <img 
          src={stickerHop} 
          alt="" 
          className="absolute bottom-20 right-8 w-32 sm:w-44 -rotate-6 transition-transform" 
          style={{ transform: `translateY(${scrollY * -0.12}px) rotate(-6deg)` }}
        />
        <img 
          src={stickerTv} 
          alt="" 
          className="absolute bottom-40 left-4 w-32 sm:w-40 rotate-45 transition-transform" 
          style={{ transform: `translateY(${scrollY * -0.1}px) rotate(45deg)` }}
        />
        
        {/* Additional Stickers */}
        <img 
          src={stickerMonkeyBadge} 
          alt="" 
          className="absolute top-[30%] left-[10%] w-24 sm:w-32 rotate-[20deg] transition-transform" 
          style={{ transform: `translateY(${scrollY * 0.2}px) rotate(20deg)` }}
        />
        <img 
          src={stickerPixel} 
          alt="" 
          className="absolute top-[15%] right-[15%] w-20 sm:w-28 -rotate-12 transition-transform" 
          style={{ transform: `translateY(${scrollY * 0.18}px) rotate(-12deg)` }}
        />
        <img 
          src={stickerSoldout} 
          alt="" 
          className="absolute top-[80%] left-[5%] w-24 sm:w-32 rotate-12 transition-transform" 
          style={{ transform: `translateY(${scrollY * -0.15}px) rotate(12deg)` }}
        />
        <img 
          src={stickerVenenosa} 
          alt="" 
          className="absolute top-[50%] right-[8%] w-28 sm:w-40 -rotate-[30deg] transition-transform" 
          style={{ transform: `translateY(${scrollY * 0.13}px) rotate(-30deg)` }}
        />
        <img 
          src={stickerEngenharia} 
          alt="" 
          className="absolute bottom-[10%] right-[20%] w-24 sm:w-32 rotate-[15deg] transition-transform" 
          style={{ transform: `translateY(${scrollY * -0.08}px) rotate(15deg)` }}
        />
        <img 
          src={stickerMda} 
          alt="" 
          className="absolute bottom-[50%] left-[15%] w-28 sm:w-36 -rotate-[8deg] transition-transform" 
          style={{ transform: `translateY(${scrollY * 0.11}px) rotate(-8deg)` }}
        />
        <img 
          src={stickerHop} 
          alt="" 
          className="absolute top-[25%] right-[25%] w-24 sm:w-32 rotate-[25deg] transition-transform" 
          style={{ transform: `translateY(${scrollY * 0.09}px) rotate(25deg)` }}
        />
        <img 
          src={sticker14Dez} 
          alt="" 
          className="absolute bottom-[25%] left-[20%] w-20 sm:w-28 -rotate-[15deg] transition-transform" 
          style={{ transform: `translateY(${scrollY * -0.14}px) rotate(-15deg)` }}
        />
      </div>

      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 mt-4">
          
          <p className="text-3xl sm:text-4xl font-black text-accent drop-shadow-md mb-2">Vote até 06/12/2025 12:00</p>
          <p className="mt-2 text-base sm:text-lg font-semibold text-foreground">Vote em todas as categorias para participar!</p>
        </div>

        {/* Voting Cards */}
        <div className="space-y-6 mb-8">
          {categories.map(category => <VotingCard key={category.id} title={category.title} alternatives={category.alternatives} selectedValue={votes[category.id] || ""} onValueChange={value => handleVoteChange(category.id, value)} />)}
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-4 pb-4">
          <Button onClick={handleSubmit} disabled={!allCategoriesVoted || isSubmitting} className="w-full h-14 sm:h-16 text-xl sm:text-2xl font-black uppercase shadow-pop transform hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed" size="lg">
            {isSubmitting ? <>
                <Loader2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                Enviando...
              </> : "Enviar Voto! 🚀"}
          </Button>
        </div>
      </div>
    </div>;
};
export default Index;