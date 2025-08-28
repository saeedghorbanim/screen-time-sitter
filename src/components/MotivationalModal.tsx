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
  onExtend: () => void;
  onAcknowledge: () => void;
  dailyExtensions?: number;
}

export const MotivationalModal = ({ isOpen, onClose, onExtend, onAcknowledge, dailyExtensions = 0 }: MotivationalModalProps) => {
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);

  useEffect(() => {
    if (isOpen) {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      setCurrentQuote(randomQuote);
    }
  }, [isOpen]);

  const hasExtensionsLeft = dailyExtensions < 2;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto bg-red-500 border-2 border-red-600 shadow-xl rounded-2xl sm:rounded-xl sm:max-w-md mobile-modal p-3 sm:p-6">
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-base sm:text-xl font-fredoka text-white leading-tight">
              {hasExtensionsLeft ? "Time Limit Reached" : "All Extensions Used"}
            </h2>
            
            <div>
              <h3 className="text-sm sm:text-lg font-comfortaa font-medium text-white leading-snug break-words">
                {hasExtensionsLeft 
                  ? currentQuote.text 
                  : "Your 5-minute extensions are up for today! 🚫"
                }
              </h3>
              {!hasExtensionsLeft && (
                <p className="text-white/80 text-xs sm:text-sm mt-1">
                  Come back tomorrow for fresh extensions
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5 sm:gap-2 pt-1">
            {hasExtensionsLeft ? (
              <>
                <Button 
                  onClick={onExtend}
                  variant="outline"
                  size="sm"
                  className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 text-xs sm:text-sm py-2 sm:py-2.5 font-comfortaa font-medium rounded-lg h-auto"
                >
                  <span className="text-center leading-tight">
                    Just 5 more minutes<br />
                    <span className="text-xs opacity-90">({2 - dailyExtensions} left today)</span>
                  </span>
                </Button>
                <Button 
                  onClick={onAcknowledge}
                  size="sm"
                  className="w-full bg-white text-red-600 hover:bg-gray-100 text-xs sm:text-sm py-2 sm:py-2.5 font-comfortaa font-medium rounded-lg h-auto"
                >
                  I'll take a break!
                </Button>
              </>
            ) : (
              <Button 
                onClick={onAcknowledge}
                size="sm"
                className="w-full bg-white text-red-600 hover:bg-gray-100 text-xs sm:text-sm py-2 sm:py-2.5 font-comfortaa font-medium rounded-lg h-auto"
              >
                ✨ Understood, I'll take a break
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};