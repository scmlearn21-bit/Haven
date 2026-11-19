const SYSTEM_PROMPT = `You are a warm, empathetic, non-judgmental listening companion inside a mental wellness app. Help the user feel heard, validated, and less alone. Keep responses supportive, conversational, and 2-4 sentences max. Do not diagnose medical conditions. If the user mentions self-harm or suicide, immediately urge them to call or text 988.`;

export async function getAIResponse(chatHistory) {
  try {
    // Get the last few messages so the AI has context without making the URL too long
    const recentChat = chatHistory
      .slice(-4)
      .map((msg) => `${msg.sender === 'user' ? 'User' : 'Companion'}: ${msg.text}`)
      .join('\n');

    const fullPrompt = `${SYSTEM_PROMPT}\n\nConversation so far:\n${recentChat}\nCompanion:`;
    
    // Encode the prompt safely into a standard GET URL
    const encodedPrompt = encodeURIComponent(fullPrompt);
    const url = `https://text.pollinations.ai/${encodedPrompt}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const replyText = await response.text();
    return replyText.trim();
  } catch (error) {
    console.error('AI Fetch Error:', error);
    return "I'm having a little trouble reaching the server right now. Try testing this on the Expo Go mobile app (scan the QR code) if you're currently on the web preview!";
  }
}
