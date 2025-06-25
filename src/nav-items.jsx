import { FileTextIcon, LightbulbIcon, CheckSquareIcon, SettingsIcon, SearchIcon, HelpCircleIcon } from "lucide-react";
import LeadershipBehaviorAnalyst from "./pages/LeadershipBehaviorAnalyst.jsx";
import FAQs from "./pages/FAQs.jsx";
import Settings from "./pages/Settings.jsx";

export const navItems = [
  {
    title: "NeuroKick",
    to: "/ai-agent-analysis",
    icon: <FileTextIcon className="h-4 w-4" />,
    page: <LeadershipBehaviorAnalyst />,
  },
  {
    title: "FAQs",
    to: "/faqs",
    icon: <HelpCircleIcon className="h-4 w-4" />,
    page: <FAQs />,
  },
  {
    title: "Settings",
    to: "/settings",
    icon: <SettingsIcon className="h-4 w-4" />,
    page: <Settings />,
  },
];