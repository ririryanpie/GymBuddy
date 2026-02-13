import AsyncStorage from '@react-native-async-storage/async-storage';
import { CoachOverride } from '../types';
import { parseCoachOverride } from '../logic/coachValidation';

const KEY = 'openaiApiKey';

export async function setApiKey(value: string) {
  await AsyncStorage.setItem(KEY, value);
}

export async function getApiKey() {
  return AsyncStorage.getItem(KEY);
}

export async function requestCoachOverride(prompt: string): Promise<{ override?: CoachOverride; explanation?: string; error?: string }> {
  const apiKey = await getApiKey();
  if (!apiKey) return { error: 'No API key set.' };
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: `Return valid JSON only first line. ${prompt}`,
    }),
  });
  if (!response.ok) return { error: `Coach API failed (${response.status})` };
  const data = await response.json();
  const text: string = data.output?.[0]?.content?.[0]?.text ?? '';
  const [firstLine, ...rest] = text.split('\n');
  const parsed = parseCoachOverride(firstLine);
  if (parsed.error) return { error: parsed.error };
  return { override: parsed.data, explanation: rest.join('\n') };
}
