import { supabase } from './supabase';

export const signInIfNeeded = async () => {
    const {
        data: { user },
        error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError || !user) {
        // 未ログインなら匿名ログインを実行
        const { error: signInError } = await supabase.auth.signInAnonymously();

        if (signInError) {
        console.error("匿名ログインに失敗:", signInError.message);
        } else {
        console.log("匿名ログイン成功 🎉");
        }
    } else {
        console.log("既にログイン済み: ", user.id);
    }
};
