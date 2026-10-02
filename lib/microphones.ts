export type Microphone = {
  id: string
  name: string
  detail: string
  image: string
  thumbnail: string
  scale: number
  offsetX: number
  offsetY: number
  rotation?: number
}

export type StudioScene = {
  id: string
  name: string
  image: string
  description: string
}

export const microphones: Microphone[] = [
  {
    id: 'boom',
    name: 'The Broadcast',
    detail: 'Boom arm · intimate',
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/leftarm-removebg-preview-1ELTi9godnuPdOUfvtwfZgXSqGotB2.png',
    thumbnail:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/leftarm-removebg-preview-1ELTi9godnuPdOUfvtwfZgXSqGotB2.png',
    scale: 0.9,
    offsetX: 0,
    offsetY: 40,
  },
  {
    id: 'desktop',
    name: 'The Classic',
    detail: 'Desktop · focused',
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/podcast-mic-on-isolated-transparent-background-png_1_-removebg-preview-cWumVUoJ4De6S3RX1ZYnmQLRqxBDtI.png',
    thumbnail:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/podcast-mic-on-isolated-transparent-background-png_1_-removebg-preview-cWumVUoJ4De6S3RX1ZYnmQLRqxBDtI.png',
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  },
  {
    id: 'shure',
    name: 'The Interview',
    detail: 'Dynamic · direct',
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Podcast-Mic-PNG-File-removebg-preview-BrHNQGGCBoZx1ecWT1SPVhXsunTiBL.png',
    thumbnail:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Podcast-Mic-PNG-File-removebg-preview-BrHNQGGCBoZx1ecWT1SPVhXsunTiBL.png',
    scale: 0.85,
    offsetX: 0,
    offsetY: 20,
  },
  {
    id: 'white',
    name: 'The Velvet',
    detail: 'Vintage · warm',
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/podcast-microphone-transparent-background-png-removebg-preview-qHFlWpv50sAj9bY9Fg1jTj4gq0qgq5.png',
    thumbnail:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/podcast-microphone-transparent-background-png-removebg-preview-qHFlWpv50sAj9bY9Fg1jTj4gq0qgq5.png',
    scale: 0.95,
    offsetX: 0,
    offsetY: 30,
  },
]

export const studioScenes: StudioScene[] = [
  {
    id: 'default',
    name: 'Modern Podcast',
    image: '',
    description: 'Classic dark studio',
  },
  {
    id: 'code-neon',
    name: 'Code Neon',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/code-background-TlnI6nyHvwUhT6chRXzpcIrLtMGQ3T.jpg',
    description: 'Digital atmosphere',
  },
  {
    id: 'minimal-white',
    name: 'Minimal White',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/abstract-background-q2EWZG0fmFFRKIheYtLLgqPhEwfkge.jpg',
    description: 'Clean & bright',
  },
  {
    id: 'whiteboard',
    name: 'Whiteboard',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/whiteboard-background-rHuk3gaDrmX6uG25q5ePCMJxj02B7x.jpg',
    description: 'Creative workspace',
  },
]

export function getMicrophone(id: string | null): Microphone {
  return microphones.find((m) => m.id === id) ?? microphones[0]
}

export function getStudioScene(id: string | null): StudioScene {
  return studioScenes.find((s) => s.id === id) ?? studioScenes[0]
}
