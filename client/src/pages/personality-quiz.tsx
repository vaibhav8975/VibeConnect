import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const quizQuestions = [
  {
    id: 1,
    question: "What describes your ideal weekend?",
    options: [
      { text: "🎵 Going to a live concert or music festival", trait: "outgoing" },
      { text: "🏞️ Hiking or exploring nature", trait: "adventurous" },
      { text: "🏠 Cozy night in with movies and music", trait: "homebody" },
      { text: "🎨 Creative projects or art galleries", trait: "creative" },
    ]
  },
  {
    id: 2,
    question: "How do you prefer to connect with people?",
    options: [
      { text: "🎤 Through shared music and performances", trait: "musical" },
      { text: "💬 Deep, meaningful conversations", trait: "genuine" },
      { text: "🎯 Fun activities and adventures", trait: "adventurous" },
      { text: "📚 Intellectual discussions and learning", trait: "intellectual" },
    ]
  },
  {
    id: 3,
    question: "What's your communication style?",
    options: [
      { text: "📱 Quick texts and emoji-filled messages", trait: "casual" },
      { text: "📞 Long phone calls and voice messages", trait: "expressive" },
      { text: "✍️ Thoughtful, well-written messages", trait: "thoughtful" },
      { text: "🎵 Sharing songs and playlists", trait: "musical" },
    ]
  }
];

export default function PersonalityQuiz() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  
  const handleAnswer = (trait: string) => {
    const newAnswers = [...answers, trait];
    setAnswers(newAnswers);
    
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed, calculate personality traits
      const traitCounts = newAnswers.reduce((acc, trait) => {
        acc[trait] = (acc[trait] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // In a real app, this would be saved to the user's profile
      console.log("Personality traits:", traitCounts);
      setLocation("/discover");
    }
  };

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-900 p-4 text-white">
      <div className="max-w-2xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <button 
            className="absolute top-6 left-6 text-gray-400 hover:text-white"
            onClick={() => setLocation("/signup")}
          >
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h2 className="text-3xl font-bold gradient-text mb-2">Personality Quiz</h2>
          <p className="text-gray-400">Help us find your perfect vibe match</p>
          <div className="w-full bg-gray-800 rounded-full h-2 mt-4">
            <div 
              className="bg-gradient-to-r from-vibe-pink to-vibe-purple h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </p>
        </div>

        {/* Quiz Content */}
        <Card className="glassmorphism p-8 rounded-2xl border-0 bg-transparent">
          <h3 className="text-xl font-semibold mb-6 text-center">{question.question}</h3>
          <div className="space-y-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option.trait)}
                className="w-full text-left p-4 bg-gray-800 rounded-xl hover:bg-vibe-pink hover:bg-opacity-20 transition-all border border-transparent hover:border-vibe-pink"
              >
                <span className="font-medium">{option.text}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
