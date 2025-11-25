export type Item = {
  id: number
  title: string
  short_description: string
  full_description: string
  price: number
  image_url: string
  category: string
  video_url?: string
}

export type SubmissionRequest = {
  name: string
  email: string
  message: string
}

export type SubmissionResponse = {
  status: string
  count: number
}
