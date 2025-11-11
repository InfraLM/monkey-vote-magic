import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { useParallax } from "@/hooks/use-parallax";
import { Ticket, Users, Vote } from "lucide-react";
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
interface ThankYouPageProps {
  onContinueVoting: () => void;
}
export const ThankYouPage = ({
  onContinueVoting
}: ThankYouPageProps) => {
  const scrollY = useParallax();
  return <div className="min-h-screen bg-gradient-to-br from-starburst-from to-starburst-to relative overflow-hidden">
      {/* Decorative Stickers Background with Parallax */}
      <div className="fixed inset-0 pointer-events-none opacity-50 z-0">
        <img src={stickerMda} alt="" className="absolute top-20 left-4 w-24 sm:w-32 md:w-40 rotate-12 transition-transform" style={{
        transform: `translateY(${scrollY * 0.1}px) rotate(12deg)`
      }} />
        <img src={stickerProblematica} alt="" className="absolute top-40 right-4 w-28 sm:w-36 md:w-48 -rotate-12 transition-transform" style={{
        transform: `translateY(${scrollY * 0.15}px) rotate(-12deg)`
      }} />
        <img src={sticker14Dez} alt="" className="absolute top-[60%] left-8 w-20 sm:w-28 md:w-36 rotate-6 transition-transform" style={{
        transform: `translateY(${scrollY * 0.08}px) rotate(6deg)`
      }} />
        <img src={stickerHop} alt="" className="absolute bottom-20 right-8 w-24 sm:w-32 md:w-44 -rotate-6 transition-transform" style={{
        transform: `translateY(${scrollY * -0.12}px) rotate(-6deg)`
      }} />
        <img src={stickerTv} alt="" className="absolute bottom-40 left-4 w-24 sm:w-32 md:w-40 rotate-45 transition-transform" style={{
        transform: `translateY(${scrollY * -0.1}px) rotate(45deg)`
      }} />
        
        {/* Additional Stickers */}
        <img src={stickerMonkeyBadge} alt="" className="absolute top-[30%] left-[10%] w-20 sm:w-24 md:w-32 rotate-[20deg] transition-transform" style={{
        transform: `translateY(${scrollY * 0.2}px) rotate(20deg)`
      }} />
        <img src={stickerPixel} alt="" className="absolute top-[15%] right-[15%] w-16 sm:w-20 md:w-28 -rotate-12 transition-transform" style={{
        transform: `translateY(${scrollY * 0.18}px) rotate(-12deg)`
      }} />
        <img src={stickerSoldout} alt="" className="absolute top-[75%] left-[5%] w-20 sm:w-24 md:w-32 rotate-12 transition-transform" style={{
        transform: `translateY(${scrollY * -0.15}px) rotate(12deg)`
      }} />
        <img src={stickerVenenosa} alt="" className="absolute top-[50%] right-[8%] w-20 sm:w-28 md:w-40 -rotate-[30deg] transition-transform" style={{
        transform: `translateY(${scrollY * 0.13}px) rotate(-30deg)`
      }} />
        <img src={stickerEngenharia} alt="" className="absolute bottom-[15%] right-[20%] w-20 sm:w-24 md:w-32 rotate-[15deg] transition-transform" style={{
        transform: `translateY(${scrollY * -0.08}px) rotate(15deg)`
      }} />
      </div>

      <Header />
      
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <div className="mb-6 flex justify-center">
            <img src={logoMain} alt="MDA 2025" className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 drop-shadow-2xl animate-scale-in" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-primary drop-shadow-lg mb-4">
            🎉 Voto Registrado!
          </h1>
          
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-6">
            Obrigado por participar!
          </p>
          
          <p className="text-base sm:text-lg md:text-xl text-foreground/90 max-w-xl mx-auto">
            Sua opinião é muito importante para nós!
          </p>
        </div>

        {/* Main CTA Card */}
        <Card className="p-6 sm:p-8 md:p-10 mb-6 shadow-pop border-4 border-accent bg-card/95 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-accent uppercase">AGORA GARANTA SEU INGRESSO! </h2>
            
            <p className="text-base sm:text-lg md:text-xl font-semibold text-foreground leading-relaxed">Não perca a SUNSET MAIS RESENHA DO MUNDINHO UFG! Venha curtir com a gente e ver os resultados da vota de 2025!<span className="text-primary font-black">SUNSET MAIS RESENHA DO MUNDINHO UFG</span>! Venha celebrar com a gente no evento mais aguardado de 2025!
            </p>

            <Button asChild size="lg" className="w-full h-14 sm:h-16 md:h-20 text-xl sm:text-2xl md:text-3xl font-black uppercase shadow-pop hover:scale-105 transition-transform">
              <a href="https://cheers.com.br/evento/mda-2025-28126" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                <Ticket className="w-6 h-6 sm:w-8 sm:h-8" />
                Comprar Ingresso Online
              </a>
            </Button>
          </div>
        </Card>

        {/* Commissioners Card */}
        <Card className="p-6 sm:p-8 mb-6 shadow-sticker border-2 border-secondary bg-card/90 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-secondary">
              <Users className="w-6 h-6 sm:w-8 sm:h-8" />
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase">
                Prefere falar com um comissário?
              </h3>
            </div>
            
            <p className="text-sm sm:text-base md:text-lg text-foreground/90">
              Entre em contato com nossa equipe de comissários! Eles podem te ajudar a garantir seu ingresso de forma personalizada.
            </p>
          </div>
        </Card>

        {/* Continue Voting Button */}
        <div className="text-center">
          <Button onClick={onContinueVoting} variant="secondary" size="lg" className="w-full sm:w-auto px-8 h-12 sm:h-14 text-lg sm:text-xl font-bold uppercase shadow-sticker hover:scale-105 transition-transform">
            <Vote className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Continuar Votando
          </Button>
        </div>
      </div>
    </div>;
};