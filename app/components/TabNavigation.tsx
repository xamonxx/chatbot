/**
 * =====================================================
 * TAB-NAVIGATION.TSX - MOBILE-FIRST BOTTOM NAV
 * =====================================================
 * Layout Constants:
 * - Height: 80px (inner content)
 * - Safe-area: env(safe-area-inset-bottom)
 * - Z-index: 50
 * Mode: DARK MODE ONLY
 * =====================================================
 */

'use client';

import { Dispatch, SetStateAction } from 'react';
import { ChefHat, LayoutDashboard, FileText, Bot, Info } from 'lucide-react';

interface TabNavigationProps {
    activeTab: string;
    setActiveTab: Dispatch<SetStateAction<string>>;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {

    const tabs = [
        { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
        { id: 'wallpanel', label: 'Panel', icon: LayoutDashboard },
        { id: 'ai_assistant', label: 'AI Chat', icon: Bot, isMain: true },
        { id: 'rules', label: 'Syarat', icon: FileText },
        { id: 'guide', label: 'Guide', icon: Info },
    ];

    return (
        <>
            {/* =====================================================
                DESKTOP TOP NAVIGATION
               ===================================================== */}
            <nav className="hidden md:flex justify-center mb-8">
                <div className="inline-flex gap-2 p-1.5 bg-slate-800 rounded-2xl shadow-sm border border-slate-700">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
                                    transition-all duration-300
                                    ${isActive
                                        ? tab.isMain
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                                            : 'bg-slate-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:bg-slate-700'
                                    }
                                `}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* =====================================================
                MOBILE BOTTOM NAVIGATION
                Fixed bottom, 80px height + safe-area padding
               ===================================================== */}
            <nav className="
                md:hidden fixed bottom-0 left-0 right-0 z-50
                bg-slate-900/95 backdrop-blur-xl
                border-t border-slate-700/80
                shadow-[0_-4px_20px_rgba(0,0,0,0.3)]
            ">
                {/* Safe Area Padded Container */}
                <div
                    className="h-[80px] flex items-center justify-around px-2"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                >
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const isMain = tab.isMain;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex flex-col items-center justify-center flex-1 h-full relative"
                            >
                                {/* Icon Container */}
                                <div
                                    className={`
                                        flex items-center justify-center rounded-2xl transition-all duration-300
                                        ${isActive
                                            ? isMain
                                                ? 'w-14 h-14 -mt-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/30'
                                                : 'w-11 h-11 -mt-2 bg-slate-600 text-white shadow-lg'
                                            : 'w-10 h-10 bg-transparent text-slate-500'
                                        }
                                    `}
                                >
                                    <Icon size={isActive && isMain ? 26 : 20} strokeWidth={isActive ? 2.5 : 2} />
                                </div>

                                {/* Label */}
                                <span
                                    className={`
                                        text-[10px] font-semibold mt-1 transition-all duration-300
                                        ${isActive
                                            ? 'text-white opacity-100'
                                            : 'text-slate-500 opacity-0 h-0'
                                        }
                                    `}
                                >
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
