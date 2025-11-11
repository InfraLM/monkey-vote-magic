import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface VotingCardProps {
  title: string;
  alternatives: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export const VotingCard = ({ title, alternatives, selectedValue, onValueChange }: VotingCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sticker border-4 border-primary transform hover:scale-[1.02] transition-transform">
      <h2 className="text-2xl font-black text-primary mb-4 uppercase tracking-tight">
        {title}
      </h2>
      
      <RadioGroup value={selectedValue} onValueChange={onValueChange} className="space-y-3">
        {alternatives.map((alternative) => (
          <div
            key={alternative}
            className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedValue === alternative
                ? 'border-primary bg-primary/10 shadow-pop'
                : 'border-border bg-background hover:border-accent hover:bg-accent/10'
            }`}
          >
            <RadioGroupItem value={alternative} id={`${title}-${alternative}`} className="border-2" />
            <Label
              htmlFor={`${title}-${alternative}`}
              className="font-bold text-lg cursor-pointer flex-1"
            >
              {alternative}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};
