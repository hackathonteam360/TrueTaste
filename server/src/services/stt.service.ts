import { env } from '../config/env';

const MOCK_TRANSCRIPTS = [
  'The food was absolutely delicious and the service was really fast. We ordered karahi and it was perfectly spicy. Overall a great experience.',
  'The biryani was tasty but a little bland for my taste. The staff was friendly and the place looked clean. I would come back.',
  'Amazing food and great ambience. The portions are generous and pricing is reasonable. Highly recommended for family dinners.',
  'The waiting time was a bit long but the food made up for it. The burgers were juicy and crispy. Friendly staff overall.',
  'Service was quite slow today. The food temperature was okay, taste was decent but nothing special. Value for money is average.',
  'Hands down the best BBQ in town. Juicy, smoky and full of flavour. Great vibes and quick service. Five stars.',
];

/**
 * Convert an uploaded voice recording into text.
 * Uses the real AI provider when configured, otherwise a mock transcript.
 */
export async function transcribeVoice(audioBuffer: Buffer, durationMs?: number): Promise<string> {
  if (env.stt.apiKey && env.stt.baseUrl) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const form = new FormData();
      form.append(
        'file',
        new Blob([audioBuffer], { type: 'audio/m4a' }) as any,
        'review.m4a'
      );
      form.append('model', env.stt.model);
      const res = await fetch(`${env.stt.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.stt.apiKey}` },
        body: form,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`STT error ${res.status}`);
      const data = (await res.json()) as Record<string, unknown>;
      if (typeof data.text === 'string' && data.text.trim()) return data.text.trim();
    } catch (err) {
      console.warn('[stt] real provider failed, using mock fallback:', err);
    }
  }

  const durationSec = durationMs ? Math.round(durationMs / 1000) : 5;
  const seed = Math.max(0, Math.min(MOCK_TRANSCRIPTS.length - 1, Math.floor(durationSec / 2) % MOCK_TRANSCRIPTS.length));
  const transcript = MOCK_TRANSCRIPTS[seed];
  return new Promise((resolve) => setTimeout(() => resolve(transcript), 1200));
}