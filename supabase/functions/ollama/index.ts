import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  prompt: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const { prompt } = await req.json() as RequestBody;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2',
        prompt,
        system: "You are a helpful AI assistant. Provide clear and concise responses.",
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ response: data.response }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});