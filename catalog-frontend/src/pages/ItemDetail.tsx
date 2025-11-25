import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchItem, submitItem } from '../api'
import type { Item, SubmissionRequest } from '../types'
import Loading from '../components/Loading'
import ErrorBanner from '../components/ErrorBanner'
import { Box, Heading, Text, Button, Input, Textarea, Flex, Image } from '@chakra-ui/react'

export default function ItemDetail() {
  const { id } = useParams()
  const itemId = Number(id)
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const nameError = name.trim().length < 2 ? 'Name is too short' : ''
  const emailError = !email.includes('@') ? 'Invalid email' : ''
  const messageError = message.trim().length < 3 ? 'Message is too short' : ''
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    let active = true
    fetchItem(itemId)
      .then(data => { if (active) setItem(data) })
      .catch(err => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [itemId])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    setError(null)
    const payload: SubmissionRequest = { name, email, message }
    try {
      const res = await submitItem(itemId, payload)
      setResult(`Submitted. Total submissions: ${res.count}`)
      setName('')
      setEmail('')
      setMessage('')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Submission failed'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="page"><Loading /></div>
  if (error) return <div className="page"><ErrorBanner message={error} /></div>
  if (!item) return <div className="page">No item</div>

  return (
    <Box>
      <Link to="/">← Back</Link>
      <Box className="card">
        <Heading size="lg">{item.title}</Heading>
        <Text className="muted">{item.full_description}</Text>
        <Flex gap={3} mt={3} align="center">
          <Image src={item.image_url} alt={item.title} boxSize="200px" objectFit="cover" borderRadius="8px" />
          <Box>
            <Text fontWeight="700">${item.price.toFixed(2)}</Text>
            <Text>{item.category}</Text>
          </Box>
        </Flex>
        {item.video_url && (
          <Box mt={3}>
            <video controls width="100%" src={item.video_url} />
          </Box>
        )}
        <Flex mt={2}>
          <Button colorScheme="blue" onClick={() => setShowForm(true)}>Proceed to submit</Button>
        </Flex>
      </Box>
      {result && <div className="banner-ok" style={{ marginTop: 12 }}>{result}</div>}
      {error && <div className="page"><ErrorBanner message={error} /></div>}
      {showForm && (
        <form onSubmit={onSubmit} style={{ marginTop: 12 }}>
          <Flex direction="column" gap={2}>
            <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            {nameError && <Text color="red.300">{nameError}</Text>}
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            {emailError && <Text color="red.300">{emailError}</Text>}
            <Textarea placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} />
            {messageError && <Text color="red.300">{messageError}</Text>}
            <Button type="submit" colorScheme="blue" disabled={submitting || !!(nameError || emailError || messageError)}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Flex>
        </form>
      )}
    </Box>
  )
}
