import { useEffect, useState } from 'react'
import { Box, Image } from '@chakra-ui/react'

export default function KioskShell({ children }: { children: React.ReactNode }) {
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    let t: number | undefined
    function reset() {
      setIdle(false)
      if (t) clearTimeout(t)
      t = window.setTimeout(() => setIdle(true), 20000)
    }
    reset()
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart']
    events.forEach(e => window.addEventListener(e, reset))
    return () => { events.forEach(e => window.removeEventListener(e, reset)); if (t) clearTimeout(t) }
  }, [])

  return (
    <Box position="relative">
      {children}
      {idle && (
        <Box position="fixed" inset={0} bg="blackAlpha.800" zIndex={1000} onClick={() => setIdle(false)}>
          <Box maxW="600px" mx="auto" mt="10%">
            <Image src="https://placehold.co/800x400?text=Discover+Great+Products" alt="Attract" />
          </Box>
        </Box>
      )}
    </Box>
  )
}
