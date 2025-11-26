
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AgeProfile, Subject, QuestionData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to decode audio
const decodeAudioData = async (
  base64String: string,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return await audioContext.decodeAudioData(bytes.buffer);
};

// --- Diversified Prompt Logic ---

const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const getPromptForSubject = (subject: Subject, age: AgeProfile): string => {
  // 4yo Topics
  const englishTopics4yo = [
    "Identify a simple object from an image (Apple, Car, Dog)",
    "Pick the rhyming word (Cat -> Hat)",
    "Choose the opposite (Hot -> Cold)",
    "Identify the first letter of a word",
    "Match the animal to its sound"
  ];
  
  const mathTopics4yo = [
    "Count objects up to 10",
    "Identify basic shapes (Circle, Square, Triangle)",
    "Compare sizes: Which is bigger/smaller?",
    "Simple addition with pictures (1 apple + 1 apple)",
    "Complete a simple number sequence (1, 2, 3, ?)"
  ];

  // 8yo Topics
  const englishTopics8yo = [
    "Choose the correct spelling",
    "Identify the noun/verb/adjective in a sentence",
    "Pick a synonym or antonym",
    "Complete the sentence with the right word",
    "Simple reading comprehension (short sentence)"
  ];

  const mathTopics8yo = [
    "Addition word problem within 20",
    "Simple subtraction (15 - 7)",
    "Basic multiplication concepts (groups of 2 or 5)",
    "Telling time to the hour or half-hour",
    "Simple fractions (Which picture shows half?)",
    "Money math: counting coins"
  ];

  // General Logic/Puzzle Topics (Age agnostic but complexity adjusted via system prompt)
  const logicTopics = [
    "Pattern completion (A, B, A, B, ?)",
    "Identify the 'odd one out'",
    "Cause and effect: What happens next?",
    "Categorization: Which item belongs in the kitchen?"
  ];

  const puzzleTopics = [
    "Simple riddle: I have keys but no locks...",
    "What comes next in the visual sequence?",
    "Spot the difference (conceptual): Which animal can fly?",
    "Mystery object description"
  ];

  if (subject === 'ENGLISH') {
    return age === '4yo' ? getRandomItem(englishTopics4yo) : getRandomItem(englishTopics8yo);
  } else if (subject === 'MATH') {
    return age === '4yo' ? getRandomItem(mathTopics4yo) : getRandomItem(mathTopics8yo);
  } else if (subject === 'LOGIC') {
    return getRandomItem(logicTopics);
  } else {
    return getRandomItem(puzzleTopics);
  }
};

export const generateLesson = async (
  subject: Subject,
  age: AgeProfile
): Promise<QuestionData> => {
  const model = "gemini-2.5-flash";
  
  let promptContext = "";
  if (age === '4yo') {
    promptContext = "Target audience: 4 year old child (Kindergarten). Keep language extremely simple. Focus on basic vocabulary. Questions should be fun and playful. Visuals should be very simple and clear.";
  } else {
    promptContext = "Target audience: 8 year old child (Primary 1/Grade 1). Focus on simple sentences, basic arithmetic, and critical thinking. Tone: Constructive and encouraging.";
  }

  const specificTopic = getPromptForSubject(subject, age);
  const subjectPrompt = `Create a question about: "${specificTopic}".`;

  const response = await ai.models.generateContent({
    model,
    contents: `You are a teacher. ${promptContext}
    ${subjectPrompt}
    Provide a question with 3 or 4 multiple choice options.
    If the specific topic implies a visual element (like counting, shapes, 'what is this', patterns), set requiresImage to true and provide a detailed visualDescription for an image generator.
    If it is purely text based (like 2+2=, or spelling), set requiresImage to false.
    The 'visualDescription' must be descriptive enough for an image generator to create a clear, kid-friendly illustration.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questionText: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          hint: { type: Type.STRING },
          visualDescription: { type: Type.STRING },
          requiresImage: { type: Type.BOOLEAN },
        },
        required: ["questionText", "options", "correctAnswer", "hint", "visualDescription", "requiresImage"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No content generated");
  return JSON.parse(text) as QuestionData;
};

export const generateLessonImage = async (visualDescription: string): Promise<string> => {
  // Use gemini-2.5-flash-image for standard generations as per instruction
  const model = "gemini-2.5-flash-image"; 
  
  // Refine prompt for a cartoon/kid-friendly style
  const prompt = `A cute, colorful, flat vector illustration for children educational app. White background. Minimalist style. ${visualDescription}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
        // No responseMimeType for image models
    }
  });

  // Extract image from parts
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated");
};

export const playTextToSpeech = async (text: string, age: AgeProfile): Promise<void> => {
  try {
    const model = "gemini-2.5-flash-preview-tts";
    const voiceName = age === '4yo' ? 'Puck' : 'Kore'; 
    
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass({ sampleRate: 24000 });
    
    const audioBuffer = await decodeAudioData(
      base64Audio,
      audioContext
    );

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();

  } catch (error) {
    console.error("TTS Error:", error);
  }
};
