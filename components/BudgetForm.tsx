'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Budget } from '@/types';
import { formatCurrency } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Save, X } from 'lucide-react';

const CATEGORIES = ['Groceries', 'Utilities', 'Transport', 'Entertainment', 'Health', 'Other'];

interface BudgetFormProps {
  selectedMonth: string;
  onBudgetUpdate: () => void;
}

export default function BudgetForm({ selectedMonth, onBudgetUpdate }: BudgetFormProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBudgets, setEditingBudgets] = useState<Record<string, number>>({});
  const [originalBudgets, setOriginalBudgets] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth]);

  const fetchBudgets = async () => {
    try {
      const res = await fetch(`/api/budgets?month=${selectedMonth}`);
      const data = await res.json();
      if (data.success) {
        setBudgets(data.data);
        // Initialize editing state with current budgets
        const currentBudgets: Record<string, number> = {};
        CATEGORIES.forEach(category => {
          const existingBudget = data.data.find((b: Budget) => b.category === category);
          currentBudgets[category] = existingBudget?.budgetAmount || 0;
        });
        setEditingBudgets(currentBudgets);
        setOriginalBudgets({ ...currentBudgets });
      }
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      toast.error('Failed to fetch budgets');
    }
  };

  const handleBudgetChange = (category: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setEditingBudgets(prev => ({
      ...prev,
      [category]: numAmount
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditingBudgets({ ...originalBudgets });
    setIsEditing(false);
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      const savePromises = CATEGORIES.map(async (category) => {
        const amount = editingBudgets[category];
        if (amount > 0) {
          const res = await fetch('/api/budgets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              month: selectedMonth,
              category,
              budgetAmount: amount
            })
          });
          if (!res.ok) throw new Error(`Failed to save budget for ${category}`);
        }
      });

      await Promise.all(savePromises);
      toast.success('All budgets saved successfully!');
      setIsEditing(false);
      await fetchBudgets();
      onBudgetUpdate();
    } catch (error) {
      console.error('Failed to save budgets:', error);
      toast.error('Failed to save some budgets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if any budget has been modified
  const hasChanges = () => {
    return CATEGORIES.some(category => 
      editingBudgets[category] !== originalBudgets[category]
    );
  };

  // Check if all budgets are valid (>= 0)
  const isValid = () => {
    return CATEGORIES.every(category => 
      editingBudgets[category] >= 0
    );
  };

  const getBudgetForCategory = (category: string) => {
    return budgets.find(b => b.category === category)?.budgetAmount || 0;
  };

  const getTotalBudget = () => {
    return Object.values(editingBudgets).reduce((sum, amount) => sum + amount, 0);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Monthly Budgets</CardTitle>
            <p className="text-sm text-muted-foreground">
              {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSaveAll}
                  disabled={loading || !hasChanges() || !isValid()}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {loading ? 'Saving...' : 'Save All'}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {CATEGORIES.map(category => (
          <div key={category} className="flex items-center space-x-3">
            <Label className="w-24 text-sm font-medium">{category}</Label>
            
            {isEditing ? (
              <Input
                type="number"
                placeholder="0"
                value={editingBudgets[category] || ''}
                onChange={(e) => handleBudgetChange(category, e.target.value)}
                className="flex-1"
                min="0"
                step="0.01"
              />
            ) : (
              <div className="flex-1 px-3 py-2 bg-muted rounded-md">
                <span className="text-sm">
                  {formatCurrency(getBudgetForCategory(category))}
                </span>
              </div>
            )}
            
            {/* Status indicator */}
            <div className="w-16 text-right">
              {isEditing && editingBudgets[category] !== originalBudgets[category] && (
                <span className="text-xs text-orange-600 font-medium">Modified</span>
              )}
            </div>
          </div>
        ))}
        
        {/* Total Budget Display */}
        <div className="mt-6 p-4 bg-muted rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Monthly Budget:</span>
            <span className="text-lg font-bold">
              {formatCurrency(getTotalBudget())}
            </span>
          </div>
          
          {isEditing && hasChanges() && (
            <div className="mt-2 text-xs text-muted-foreground">
              Original: {formatCurrency(Object.values(originalBudgets).reduce((sum, amount) => sum + amount, 0))}
            </div>
          )}
        </div>

        {/* Validation Messages */}
        {isEditing && (
          <div className="space-y-2">
            {!isValid() && (
              <p className="text-sm text-red-600">
                All budget amounts must be 0 or greater.
              </p>
            )}
            {isValid() && !hasChanges() && (
              <p className="text-sm text-muted-foreground">
                No changes made.
              </p>
            )}
            {hasChanges() && isValid() && (
              <p className="text-sm text-green-600">
                Ready to save changes.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
