'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CalendarIcon, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useEffect } from 'react';

import { cn } from '@/lib/utils';
import { transactionSchema, TransactionFormValues } from '@/lib/validators';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TransactionFormProps {
  type: 'add' | 'edit';
  initialData?: TransactionFormValues & { id: string };
  onSuccess: () => void;
  setOpen: (open: boolean) => void;
}

export function TransactionForm({ type, initialData, onSuccess, setOpen }: TransactionFormProps) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData || {
      description: '',
      quantity: 1,
      pricePerUnit: 0,
      date: new Date(),
    },
  });

  // Watch quantity and pricePerUnit for real-time calculation
  const quantity = form.watch('quantity');
  const pricePerUnit = form.watch('pricePerUnit');
  const totalAmount = (quantity || 0) * (pricePerUnit || 0);

  async function onSubmit(data: TransactionFormValues) {
    const apiEndpoint = type === 'add' ? '/api/transactions' : `/api/transactions/${initialData?.id}`;
    const method = type === 'add' ? 'POST' : 'PUT';

    try {
      const response = await fetch(apiEndpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Transaction ${type === 'add' ? 'added' : 'updated'} successfully!`, {
          description: `${data.description} - ${formatCurrency(totalAmount)}`,
        });
        onSuccess();
        setOpen(false);
      } else {
        throw new Error(result.error || 'Failed to save transaction');
      }
    } catch (error) {
      console.error("Failed to submit transaction:", error);
      toast.error("Uh oh! Something went wrong.", {
        description: error instanceof Error ? error.message : "There was a problem with your request.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Groceries, Fuel, Medicine" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    placeholder="e.g., 2" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pricePerUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per Unit (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    placeholder="e.g., 54.99" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Total Amount Display */}
        <div className="p-4 bg-muted rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center">
              <Calculator className="mr-2 h-4 w-4" />
              Total Amount:
            </span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(totalAmount)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {quantity} × {formatCurrency(pricePerUnit)} = {formatCurrency(totalAmount)}
          </p>
        </div>

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Transaction Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {type === 'add' ? 'Add Transaction' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
