import React from 'react';
import {
  Bot,
  Briefcase,
  PenTool,
  Code,
  MessageCircle,
  PlayCircle,
  BookOpen,
  DollarSign,
  MapPin,
  Gamepad2,
  Layers,
  LucideIcon,
} from 'lucide-react';
import { Category, AppVersion } from '../types';

const iconMap: Record<string, LucideIcon> = {
  Bot,
  Briefcase,
  PenTool,
  Code,
  MessageCircle,
  PlayCircle,
  BookOpen,
  DollarSign,
  MapPin,
  Gamepad2,
  cpu: Bot,
  briefcase: Briefcase,
  'pen-tool': PenTool,
  code: Code,
  'message-circle': MessageCircle,
  'play-circle': PlayCircle,
  'book-open': BookOpen,
  'dollar-sign': DollarSign,
  'map-pin': MapPin,
  'gamepad-2': Gamepad2,
};

interface CategoryPillsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  totalApps: number;
  version: AppVersion;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  totalApps,
  version,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 min-w-max px-1">
        {/* All Pill */}
        <button
          id="category-pill-all"
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all select-none ${
            selectedCategory === 'all'
              ? 'neu-pill-active text-white scale-102'
              : 'neu-pill text-neutral-700 hover:text-neutral-900 border border-white/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{version === 'cn' ? '全部应用' : 'All Categories'}</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              selectedCategory === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-neutral-200/80 text-neutral-600'
            }`}
          >
            {totalApps}
          </span>
        </button>

        {/* Dynamic Category Pills */}
        {categories.map((cat) => {
          const IconComponent = iconMap[cat.icon] || Layers;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              id={`category-pill-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all select-none ${
                isSelected
                  ? 'neu-pill-active text-white scale-102'
                  : 'neu-pill text-neutral-700 hover:text-neutral-900 border border-white/50'
              }`}
            >
              <IconComponent
                className="w-3.5 h-3.5"
                style={{ color: isSelected ? '#FFFFFF' : cat.color }}
              />
              <span>{cat.name}</span>
              {typeof cat.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-neutral-200/80 text-neutral-600'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
