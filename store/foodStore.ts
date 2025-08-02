import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Food } from '../types/food';

type FoodStore = {
    foods: Food[];
    isLoading: boolean;
    error: string | null;
    fetchFoods: () => Promise<void>;
    addFood: (newFood: Omit<Food, 'id'>) => Promise<void>;
    updateFood: (id: string, updates: Partial<Food>) => Promise<void>;
    deleteFood: (id: string) => Promise<void>;
};

export const useFoodStore = create<FoodStore>((set) => ({
    foods: [],
    isLoading: false,
    error: null,

    fetchFoods: async () => {
    set({ isLoading: true, error: null });

    // 🔑 匿名ユーザーIDの取得
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error("ユーザー情報の取得に失敗しました", authError);
        set({ error: authError?.message ?? "認証エラー", isLoading: false });
        return;
    }

    // 🔍 user_id に基づくデータ取得
    const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('user_id', user.id)
        .order('expiry_date');

    if (error) {
        console.error('Fetch error:', error.message);
        set({ error: error.message, isLoading: false });
        return;
    }

    // 🛠 スネークケース → キャメルケース + Date 変換
    const camelFoods = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        comment: item.comment,
        expiryDate: item.expiry_date ? new Date(item.expiry_date) : new Date(),
        registeredDate: item.registered_date ? new Date(item.registered_date) : new Date(),
        isConsumed: item.is_consumed,
    }));

    set({ foods: camelFoods, isLoading: false });
    }
    ,

    addFood: async (newFood) => {
    // 🔑 現在のユーザー情報を取得
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error("ユーザー情報の取得に失敗しました", authError);
        set({ error: authError?.message ?? "認証エラー" });
        return;
    }

    // 🛠 キャメルケース→スネークケース変換 + user_id 追加
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

        // ✅ ユーザーIDを付与
        user_id: user.id,
    };

    const { error } = await supabase.from('foods').insert([dbFood]);
    if (error) {
        console.error('Insert error:', error.message);
        set({ error: error.message });
        return;
    }

    await useFoodStore.getState().fetchFoods();
    },


    

    updateFood: async (id, updates) => {
        // キャメルケース→スネークケース変換
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.comment !== undefined) dbUpdates.comment = updates.comment;
        if (updates.expiryDate !== undefined) {
            dbUpdates.expiry_date = updates.expiryDate instanceof Date 
                ? updates.expiryDate.toISOString().slice(0, 10)
                : updates.expiryDate;
        }
        if (updates.registeredDate !== undefined) {
            dbUpdates.registered_date = updates.registeredDate instanceof Date 
                ? updates.registeredDate.toISOString().slice(0, 10)
                : updates.registeredDate;
        }
        if (updates.isConsumed !== undefined) dbUpdates.is_consumed = updates.isConsumed;

        const { error } = await supabase.from('foods').update(dbUpdates).eq('id', id);
        if (error) {
            console.error('Update error:', error.message);
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
