import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Heading, Input, Flex, Button, Text, Image, Badge, HStack } from '@chakra-ui/react'
import { checkoutCart, fetchCategories, fetchItems } from '../api'
import type { Item } from '../types'
import Loading from '../components/Loading'
import ErrorBanner from '../components/ErrorBanner'

export default function ItemsList() {
  const [items, setItems] = useState<Item[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState<{ id: number; title: string; price: number }[]>([])
  const [checkoutName, setCheckoutName] = useState('')
  const [checkoutEmail, setCheckoutEmail] = useState('')
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null)

  const [total, setTotal] = useState(0)
  const [perPage] = useState(5)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let active = true
    fetchItems({ page, perPage, q: query, category: category || undefined })
      .then(data => { if (active) { setItems(data.items); setTotal(data.total) } })
      .catch(err => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [page, perPage, query, category])

  const filtered = items

  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const paginated = filtered
  const [categories, setCategories] = useState<string[]>([])
  useEffect(() => {
    let active = true
    fetchCategories()
      .then(c => { if (active) setCategories(c) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  function addToCart(i: Item) {
    setCart(prev => [...prev, { id: i.id, title: i.title, price: i.price }])
    setCartOpen(true)
  }

  

  if (loading) return <div className="page"><Loading /></div>
  if (error) return <div className="page"><ErrorBanner message={error} /></div>

  return (
    <Box>
      <Heading size="lg" mb={4}>Catalog</Heading>
      <Input placeholder="Search" value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} mb={4} />
      <HStack gap={2} mb={4}>
        <Badge as={Button} onClick={() => { setCategory(null); setPage(1) }} colorScheme={!category ? 'blue' : 'gray'}>All</Badge>
        {categories.map(c => (
          <Badge as={Button} key={c} onClick={() => { setCategory(c); setPage(1) }} colorScheme={category === c ? 'blue' : 'gray'}>{c}</Badge>
        ))}
      </HStack>
      {filtered.length === 0 ? (
        <Box className="card"><Text>No items found</Text></Box>
      ) : (
        <>
          <Box as="ul" style={{ listStyle: 'none', padding: 0 }}>
            {paginated.map(i => (
              <Box as="li" key={i.id}>
                <Box className="card">
                  <Flex gap={3} align="center" justify="space-between">
                    <Image src={i.image_url} alt={i.title} boxSize="120px" objectFit="cover" borderRadius="8px" />
                    <Box flex={1}>
                      <Text className="title">{i.title}</Text>
                      <Text className="muted">{i.short_description}</Text>
                      <Badge mt={1}>{i.category}</Badge>
                    </Box>
                    <Box textAlign="right">
                      <Text fontWeight="700">${i.price.toFixed(2)}</Text>
                      <Flex gap={2} mt={2}>
                        <Button onClick={() => addToCart(i)} colorScheme="green">Add</Button>
                        <Link to={`/items/${i.id}`}><Button colorScheme="blue">View</Button></Link>
                      </Flex>
                    </Box>
                  </Flex>
                </Box>
              </Box>
            ))}
          </Box>
          <Flex justify="space-between" align="center" mt={4}>
            <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
            <Text>Page {page} / {totalPages}</Text>
            <Flex gap={2}>
              <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
              <Button onClick={() => setCartOpen(true)} colorScheme="purple">Cart ({cart.length})</Button>
            </Flex>
          </Flex>
        </>
      )}
      {cartOpen && (
        <Box className="card" mt={4}>
          <Heading size="md">Cart</Heading>
          {cart.length === 0 ? <Text className="muted">Cart is empty</Text> : (
            <Box as="ul" style={{ listStyle: 'none', padding: 0 }}>
              {cart.map((c, idx) => (
                <Box as="li" key={idx}>
                  <Flex justify="space-between">
                    <Text>{c.title}</Text>
                    <Text>${c.price.toFixed(2)}</Text>
                  </Flex>
                </Box>
              ))}
              <Box as="li">
                <Flex justify="space-between">
                  <Text fontWeight="700">Total</Text>
                  <Text fontWeight="700">${cart.reduce((s, c) => s + c.price, 0).toFixed(2)}</Text>
                </Flex>
              </Box>
            </Box>
          )}
          <Heading size="sm" mt={3}>Checkout</Heading>
          {checkoutStatus && <div className="banner-ok" style={{ marginTop: 8 }}>{checkoutStatus}</div>}
          {error && <ErrorBanner message={error} />}
          <Flex direction="column" gap={2} mt={2}>
            <Input placeholder="Name" value={checkoutName} onChange={e => setCheckoutName(e.target.value)} />
            <Input type="email" placeholder="Email" value={checkoutEmail} onChange={e => setCheckoutEmail(e.target.value)} />
            <Input placeholder="Message" value={checkoutMessage} onChange={e => setCheckoutMessage(e.target.value)} />
            <Flex gap={2}>
              <Button onClick={async () => {
                setCheckoutStatus(null)
                setError(null)
                try {
                  const payload = { items: cart.map(c => ({ id: c.id, quantity: 1 })), customer: { name: checkoutName, email: checkoutEmail, message: checkoutMessage } }
                  const res = await checkoutCart(payload)
                  setCheckoutStatus(`Checkout successful. Total: $${res.total.toFixed(2)}`)
                  setCart([])
                  setCheckoutName('')
                  setCheckoutEmail('')
                  setCheckoutMessage('')
                } catch (e) {
                  const msg = e instanceof Error ? e.message : 'Checkout failed'
                  setError(msg)
                }
              }} colorScheme="blue" disabled={cart.length === 0 || !checkoutName || !checkoutEmail}>Submit</Button>
              <Button onClick={() => setCartOpen(false)}>Close</Button>
            </Flex>
          </Flex>
        </Box>
      )}
    </Box>
  )
}
