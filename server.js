import { createClient } from '@supabase/supabase-js'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export default {
  async fetch(request, env) {
    // 1. Supabase Client
    const supabase = createClient(env.SB_URL, env.SB_KEY);

    // 2. Cloudflare R2 Client (S3 API သုံးထားသည်)
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });

    const url = new URL(request.url);

    // Movie List Endpoint
    if (url.pathname === "/api/movies") {
      const { data, error } = await supabase.from('movies').select('*').order('created_at', { ascending: false });
      return new Response(JSON.stringify(data), { 
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
      });
    }

    // Video Streaming အတွက် လုံခြုံတဲ့ Signed URL ထုတ်ပေးမည့် Endpoint
    if (url.pathname.startsWith("/api/stream/")) {
      const filename = url.pathname.split("/").pop();
      const command = new GetObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: filename,
      });

      // URL ကို ၁ နာရီပဲ သက်တမ်းပေးမယ်
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return new Response(JSON.stringify({ url: signedUrl }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    return new Response("Movie API is Running...", { headers: { "Access-Control-Allow-Origin": "*" } });
  }
}
