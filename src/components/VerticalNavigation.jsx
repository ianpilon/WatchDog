import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navItems } from '../nav-items';

const VerticalNavigation = () => {
  const location = useLocation();

  return (
    <div className="h-screen w-72 bg-gray-100 border-r flex flex-col">
      <ScrollArea className="flex-grow">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-0 px-4 text-lg font-semibold">NeuroKick</h2>
            <p className="mb-3 px-4 text-xs text-gray-600 italic">evidence-based leadership insights</p>
            <div className="space-y-1 mt-5">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      location.pathname === item.to 
                        ? "bg-blue-100 hover:bg-blue-100" 
                        : "hover:bg-gray-50"
                    )}
                  >
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default VerticalNavigation;