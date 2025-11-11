import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { useParallax } from "@/hooks/use-parallax";
import logoMain from "@/assets/logo-main.png";
import mascotFull from "@/assets/mascot-full.png";
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

export const VotingClosedPage = () => {
  const scrollY = useParallax();

  return (
    <div className="min-h-screen bg-gradient-to-br from-starburst-from to-starburst-to relative overflow-hidden">
      {/* Decorative Stickers Background with Parallax */}
      <div className="fixed inset-0 pointer-events-none opacity-50 z-0">
        <img 
          src={stickerMda} 
          alt="" 
          className="absolute top-20 left-4 w-24 sm:w-32 md:w-40 rotate-12 transition-transform" 
          style={{ transform: `translateY(${scrollY * 0.1}px) rotate(12deg)` }}
        />
        <img 
          src={stickerProblematica} 
          alt="" 
          className="absolute top-32 right-4 w-28 sm:w-36 md:w-44 -rotate-12 transition-transform" 
          style={{ transform: `translateY(${scrollY * 0.15}px) rotate(-12deg)` }}
        />
        <img 
          src={sticker14Dez} 
          alt="" 
          className="absolute top-[60%] left-8 w-24 sm:w-32 rotate-6 transition-transform" 
          style={{ transform: `translateY(${scrollY * 0.08}px) rotate(6deg)` }}
        />
        <img 
          src={stickerHop} 
          alt="" 
          className="absolute bottom-20 right-8 w-28 sm:w-36 md:w-44 -rotate-6 transition-transform" 
          style={{ transform: `translateY(${scrollY * -0.12}px) rotate(-6deg)` }}
        />
        <img 
          src={stickerTv} 
          alt="" 
          className="absolute bottom-40 left-4 w-24 sm:w-32 rotate-45 transition-transform" 
          style={{ transform: `translateY(${scrollY * -0.1}px) rotate(45deg)` }}
        />
        <img 
          src={stickerMonkeyBadge} 
          alt="" 
          className="absolute top-[30%] left-[10%] w-20 sm:w-28 rotate-[20deg] transition-transform" 
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
          className="absolute top-[75%] left-[5%] w-24 sm:w-32 rotate-12 transition-transform" 
          style={{ transform: `translateY(${scrollY * -0.15}px) rotate(12deg)` }}
        />
        <img 
          src={stickerVenenosa} 
          alt="" 
          className="absolute top-[50%] right-[8%] w-24 sm:w-32 md:w-40 -rotate-[30deg] transition-transform" 
          style={{ transform: `translateY(${scrollY * 0.13}px) rotate(-30deg)` }}
        />
        <img 
          src={stickerEngenharia} 
          alt="" 
          className="absolute bottom-[15%] right-[20%] w-20 sm:w-28 rotate-[15deg] transition-transform" 
          style={{ transform: `translateY(${scrollY * -0.08}px) rotate(15deg)` }}
        />
      </div>

      <Header />

      <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">
        <div className="text-center space-y-8 animate-fade-in">
          {/* Main Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src={logoMain} 
              alt="Melhores do Ano" 
              className="w-48 sm:w-64 md:w-80 h-auto drop-shadow-xl"
            />
          </div>

          {/* Mascot */}
          <div className="flex justify-center">
            <img 
              src={mascotFull} 
              alt="Mascote MDA" 
              className="w-40 sm:w-52 md:w-64 h-auto drop-shadow-xl animate-scale-in"
            />
          </div>

          {/* Main Message */}
          <div className="space-y-4 bg-card/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border-4 border-primary">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-accent drop-shadow-md">
              🎊 VOTAÇÕES ENCERRADAS! 🎊
            </h1>
            
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              Obrigado a todos que participaram!
            </p>

            <div className="my-6 space-y-3">
              <p className="text-lg sm:text-xl font-semibold text-muted-foreground">
                Os resultados oficiais serão divulgados durante o evento
              </p>
              <p className="text-3xl sm:text-4xl font-black text-primary drop-shadow-md">
                ✨ MDA 2025 ✨
              </p>
            </div>

            <div className="pt-4 space-y-4">
              <p className="text-lg sm:text-xl font-bold text-foreground">
                🔥 Não perca a maior festa do ano! 🔥
              </p>
              <p className="text-base sm:text-lg font-semibold text-muted-foreground">
                Garanta seu ingresso para descobrir os vencedores ao vivo!
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-6">
            <Button
              onClick={() => window.open("https://cheers.com.br/evento/mda-2025-28126", "_blank")}
              className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-12 text-xl sm:text-2xl font-black uppercase shadow-pop transform hover:scale-105 transition-transform"
              size="lg"
            >
              Ver Ingressos Disponíveis 🎟️
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};