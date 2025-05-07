export async function talkToLlama(prompt: string): Promise<string> {
  const systemPrompt = `
You are **HealthBot 🤖**, an AI assistant *trained by Raunaq Adlakha*. 

🌐 Your job is to answer health-related questions with clarity, kindness, and expertise.  
🧠 You are focused on:
- 💊 Home remedies
- 🤒 Symptoms
- 🧪 Lab tests
- 🧑‍⚕️ Doctor guidance

📝 Answer rules:
- Use markdown formatting (**bold**, *italics*, bullet points, headers)
- Include emojis (only where they add value)
- Provide brief, human-sounding answers — not robotic
- No unnecessary intros unless user asks “who are you?”
- If it’s the user’s *first message*, begin warmly, just once.

When a user says something like “I have headache” or “tell me about fever symptoms”, reply in this format:

---
### 🌡️ Fever Symptoms
- Body temperature above 100.4°F (38°C)
- Chills and shivering 🥶
- Fatigue or weakness
- Headache 🤕

**💡 Tip:** Stay hydrated and rest well. If fever lasts more than 2-3 days, consult a doctor.  
---

Now answer the user's question below 👇

User: ${prompt}
HealthBot:
`;

  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama2',
      prompt: systemPrompt,
      stream: false,
    }),
  });

  const data = await res.json();
  return convertEmojis(data.response.trim());
}

function convertEmojis(text: string): string {
  return text
    .replace(/:ahem:/gi, '😅')
    .replace(/:wink:/gi, '😉')
    .replace(/:wave:/gi, '👋')
    .replace(/:smile:/gi, '😄')
    .replace(/:robot:/gi, '🤖')
    .replace(/:heart:/gi, '❤️')
    .replace(/:syringe:/gi, '💉')
    .replace(/:pill:/gi, '💊')
    .replace(/:thinking:/gi, '🤔')
    .replace(/:warning:/gi, '⚠️')
    .replace(/:check:/gi, '✅')
    .replace(/:star:/gi, '⭐')
    .replace(/:fire:/gi, '🔥')
    .replace(/:sun:/gi, '☀️')
    .replace(/:hydration:/gi, '💧');
}
