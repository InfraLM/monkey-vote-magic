import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";
import logoMain from "@/assets/logo-main.png";
export const Header = () => {
  return <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b-4 border-primary shadow-sticker">
      <div className="container mx-auto px-3 py-2 flex items-center justify-between gap-2">
        {/* Logo - Esquerda */}
        <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16">
          <img src={logoMain} alt="MDA 2025" className="w-full h-full object-contain drop-shadow-lg" />
        </div>

        {/* Título - Centro */}
        <div className="flex-1 text-center px-1">
          <h1 className="text-xs sm:text-sm md:text-xl font-black text-primary uppercase tracking-tight leading-tight">
            Melhores
            <br className="sm:hidden" />
            <span className="sm:ml-1">do Ano</span>
          </h1>
        </div>

        {/* Botão Ingressos - Direita */}
        <div className="flex-shrink-0">
          <Button asChild size="sm" className="font-black uppercase text-xs sm:text-sm px-2 sm:px-4 h-10 sm:h-11 shadow-pop hover:scale-105 transition-transform">
            <a href="https://cheers.com.br/evento/mda-2025-28126" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 sm:gap-2">
              <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Ingressos</span>
              <span className="xs:hidden">INGRESSOS</span>
            </a>
          </Button>
        </div>
      </div>
    </header>;
};