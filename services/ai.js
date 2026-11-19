const API_URL = 'https://text.pollinations.ai/';

const SYSTEM_PROMPT = `
You are a warm, empathetic, non-judgmental listening companion inside a mental wellness app. 
Your goal is to help the user feel heard, validated, and less alone when nobody else is around.

Guidelines:
- Use active listening: reflect back what they are feeling and ask gentle, open-ended questions.
- Keep responses conversational, supportive, and easy to read (2-4 sentences max).
- Do not diagnose medical conditions or act as a licensed therapist.
- If the user expresses thoughts of self-harm, suicide, or severe crisis, immediately encourage them to reach out to a trusted person or contact the 988 Suicide & Crisis Lifeline (call or text 988 in the US/Canada, or find local resources at findahelpline.com).
`;

export async function getAIResponse(chatHistory) {
  // Format the conversation so the AI remembers what was already said
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...chatHistory.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
  ];

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages,
        model: 'openai', // Uses a fast, conversational AI model
      }),
    });

    if (!response.ok) {
      throw new Error('Server response was not ok');
    }

    const replyText = await response.text();
    return replyText.trim();
  } catch (error) {
    console.error('AI Fetch Error:', error);
    return "I'm having a little trouble connecting right now, but I'm still here. Check your internet connection and try sending that again.";
  }
}
