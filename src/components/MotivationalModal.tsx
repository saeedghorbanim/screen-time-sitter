import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Leaf, BookOpen, ChefHat, Dumbbell, Palette, Music, Heart, Sun } from "lucide-react";

const motivationalQuotes = [
  {
    text: "Time to touch some grass! 🌱",
    description: "Step outside and reconnect with nature",
    icon: Leaf,
    color: "text-green-600"
  },
  {
    text: "How about reading a book? 📚",
    description: "Feed your mind with knowledge",
    icon: BookOpen,
    color: "text-blue-600"
  },
  {
    text: "Go cook something delicious! 👨‍🍳",
    description: "Nourish your body and creativity",
    icon: ChefHat,
    color: "text-orange-600"
  },
  {
    text: "Time for some exercise! 💪",
    description: "Move your body and feel energized",
    icon: Dumbbell,
    color: "text-red-600"
  },
  {
    text: "Create something beautiful! 🎨",
    description: "Express yourself through art",
    icon: Palette,
    color: "text-purple-600"
  },
  {
    text: "Listen to your favorite music! 🎵",
    description: "Let melodies lift your spirit",
    icon: Music,
    color: "text-pink-600"
  },
  {
    text: "Call a friend or family member! ❤️",
    description: "Strengthen your relationships",
    icon: Heart,
    color: "text-rose-600"
  },
  {
    text: "Enjoy some sunshine! ☀️",
    description: "Vitamin D and fresh air await",
    icon: Sun,
    color: "text-yellow-600"
  }
];

interface MotivationalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: () => void;
}

export const MotivationalModal = ({ isOpen, onClose, onAcknowledge }: MotivationalModalProps) => {
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);

  useEffect(() => {
    if (isOpen) {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      setCurrentQuote(randomQuote);
    }
  }, [isOpen]);

  const Icon = currentQuote.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-wellness border-2 border-primary/20 shadow-floating">
        <div className="text-center space-y-8 py-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">
              Time Limit Reached
            </h2>
            
            <div className="flex justify-center">
              <div className="bg-white rounded-full p-6 shadow-wellness">
                <Icon className={`w-16 h-16 ${currentQuote.color}`} />
              </div>
            </div>
            
            <h3 className="text-3xl font-bold text-foreground px-4">
              {currentQuote.text}
            </h3>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button 
              onClick={onClose}
              variant="outline"
              size="lg"
              className="flex-1 border-primary/20 hover:bg-primary/5 text-lg py-6"
            >
              Just 5 more minutes
            </Button>
            <Button 
              onClick={onAcknowledge}
              size="lg"
              className="flex-1 bg-gradient-primary hover:opacity-90 shadow-gentle text-lg py-6"
            >
              I'll take a break!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};