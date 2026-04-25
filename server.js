import { createClient } from '@supabase/supabase-js'

export default {
  async fetch(request, env) {
    // API Keys တွေကို env ကနေယူမယ် (လုံခြုံရေးအတွက်)
    const supabase = createClient(env.SB_URL, env.SB_KEY);
    
    // URL စစ်မယ်
    const url = new URL(request.url);
    
    // Movie List တောင်းတဲ့ API
    if (url.pathname === "/api/movies") {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      return new Response(JSON.stringify(data), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" // Browser ကနေ ခေါ်လို့ရအောင်
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  }
}
