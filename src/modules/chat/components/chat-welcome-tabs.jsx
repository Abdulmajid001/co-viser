import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Code,
  MessageCircle,
  Newspaper,
  Sparkles,
} from "lucide-react";
import React, { useState } from "react";

const CHAT_TAB_MESSAGE = [
  {
    tabName: "Ask",
    icon: <MessageCircle className="h-4 w-4" />,
    messages: [
      "What are the biggest benefits of remote work for employees?",
      "Explain quantum computing in simple terms with real-world examples",
      "How can I improve my productivity while working or studying?",
      "What are the latest AI trends that will shape the future?",
    ],
  },
  {
    tabName: "Create",
    icon: <Sparkles className="h-4 w-4" />,
    messages: [
      "Write a compelling product description for a new smartwatch",
      "Generate 10 creative startup name ideas for an AI company",
      "Write a motivational speech about overcoming challenges",
      "Create a balanced weekly study plan for a university student",
    ],
  },
  {
    tabName: "Code",
    icon: <Code className="h-4 w-4" />,
    messages: [
      "Write a REST API in Next.js with CRUD endpoints",
      "Explain the difference between let, const, and var with examples",
      "Explain Big O notation using common data structures and algorithms",
      "How do I implement JWT authentication in a Next.js application?",
    ],
  },
  {
    tabName: "Learn",
    icon: <BookOpen className="h-4 w-4" />,
    messages: [
      "Explain how the stock market works for complete beginners",
      "What is machine learning and how is it used today?",
      "Teach me the basics of personal finance and budgeting",
      "How does blockchain technology work behind the scenes?",
    ],
  },
  {
    tabName: "Explore",
    icon: <Newspaper className="h-4 w-4" />,
    messages: [
      "What are the best countries to visit in 2026 and why?",
      "Which programming languages are worth learning this year?",
      "Which companies are the most valuable in the world today?",
      "What are the latest trends in artificial intelligence and technology?",
    ],
  },
];

const ChatWelcomeTabs = ({ onMessageSelect }) => {
  const [activeTab, setActiveTab] = useState(null); // null = no tab selected initially

  return (
    <div className="flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-8">
        <div className="flex flex-wrap gap-1 lg:gap-1 w-full">
          {CHAT_TAB_MESSAGE.map((tab, index) => (
            <Button
              key={index}
              variant={activeTab === index ? "default" : "secondary"}
              onClick={() => setActiveTab(index)}
              className="w-27.5 justify-center"
            >
              {tab.icon}
              <span className="ml-2">{tab.tabName}</span>
            </Button>
          ))}
        </div>

        {/* chat tab messages - only show once a tab is clicked */}
        {activeTab !== null && (
          <div className="space-y-3 w-full min-h-60">
            {CHAT_TAB_MESSAGE[activeTab].messages.map((message, index) => (
              <div key={index}>
                <button
                  onClick={() => onMessageSelect(message)}
                  className="w-full text-left text-sm text-muted-foreground hover:text-primary transition-colors duration-300 ease-in-out py-2"
                >
                  {message}
                </button>
                {index < CHAT_TAB_MESSAGE[activeTab].messages.length - 1 && (
                  <Separator className="h-0.5" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWelcomeTabs;