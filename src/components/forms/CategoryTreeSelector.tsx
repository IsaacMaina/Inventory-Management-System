'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  parentId?: string | null;
  children?: Category[];
}

interface CategoryTreeSelectorProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  maxDepth?: number; // Maximum depth to show (default: 3 for main->sub->subsub)
}

export const CategoryTreeSelector = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  maxDepth = 3
}: CategoryTreeSelectorProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const renderCategoryNode = (category: Category, level = 0) => {
    if (level >= maxDepth) return null; // Don't render beyond max depth

    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id} className="ml-0">
        <div
          className={`flex items-center py-2 px-3 cursor-pointer rounded-lg transition-colors ${
            selectedCategoryId === category.id
              ? 'bg-green-600/20 text-green-400 border-l-4 border-green-400'
              : 'hover:bg-gray-700/30'
          }`}
          onClick={() => {
            onSelectCategory(category.id);
          }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
              className="mr-2 p-1 rounded hover:bg-gray-600/30"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6 mr-2" />} {/* Spacer for alignment */}
          
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 mr-2 flex-shrink-0" />
          ) : (
            <Folder className="h-4 w-4 mr-2 flex-shrink-0" />
          )}
          
          <span className="text-sm truncate">{category.name}</span>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-4 border-l border-gray-600 pl-2">
            {category.children?.map(child => renderCategoryNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootCategories = categories.filter(cat => !cat.parentId);

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden">
      <div className="max-h-64 overflow-y-auto">
        {rootCategories.length > 0 ? (
          rootCategories.map(category => renderCategoryNode(category))
        ) : (
          <div className="p-4 text-center text-gray-400 text-sm">
            No categories available
          </div>
        )}
      </div>
    </div>
  );
};