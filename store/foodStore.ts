import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Food } from '../types/food';

type FoodStore = {
    foods: Food[];
    isLoading: boolean;
    error: string | null;
    fetchFoods: () => Promise<void>;
    addFood: (newFood: Omit<Food, 'id'>) => Promise<void>;
    deleteFood: (id: string) => Promise<void>;
};

export const useFoodStore = create<FoodStore>((set) => ({
    foods: [],
    isLoading: false,
    error: null,

    fetchFoods: async () => {
        set({ isLoading: true, error: null });
        const { data, error } = await supabase.from('foods').select('*').order('expiry_date');
        if (error) {
            console.error('Fetch error:', error.message);
            set({ error: error.message, isLoading: false });
            return;
        }
        // スネークケース→キャメルケース変換＋日付型変換
        const camelFoods = (data || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            comment: item.comment,
            expiryDate: item.expiry_date ? new Date(item.expiry_date) : undefined,
            registeredDate: item.registered_date ? new Date(item.registered_date) : undefined,
            isConsumed: item.is_consumed,
        }));
        set({ foods: camelFoods, isLoading: false });
    },

    addFood: async (newFood) => {
        // キャメルケース→スネークケース変換
        const dbFood = {
            name: newFood.name,
            comment: newFood.comment,
            expiry_date: (newFood as any).expiry_date
                || (typeof (newFood as any).expiryDate === 'string'
                    ? (newFood as any).expiryDate.slice(0, 10)
                    : (newFood as any).expiryDate instanceof Date
                        ? (newFood as any).expiryDate.toISOString().slice(0, 10)
                        : undefined),
            registered_date: (newFood as any).registered_date
                || (typeof (newFood as any).registeredDate === 'string'
                    ? (newFood as any).registeredDate
                    : (newFood as any).registeredDate instanceof Date
                        ? (newFood as any).registeredDate.toISOString()
                        : undefined),
            is_consumed: (newFood as any).is_consumed ?? newFood.isConsumed ?? false,
        };
        const { error } = await supabase.from('foods').insert([dbFood]);
        if (error) {
            console.error('Insert error:', error.message);
            set({ error: error.message });
            return;
        }
        await useFoodStore.getState().fetchFoods();
    },

    deleteFood: async (id) => {
        const { error } = await supabase.from('foods').delete().eq('id', id);
        if (error) {
        console.error('Delete error:', error.message);
        set({ error: error.message });
        return;
        }
        set((state) => ({ foods: state.foods.filter((f) => f.id !== id) }));
    },
}));
