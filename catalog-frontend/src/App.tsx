import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ChakraProvider, Container, defaultSystem } from '@chakra-ui/react'
import ItemsList from './pages/ItemsList'
import ItemDetail from './pages/ItemDetail'
import Header from './components/Header'
import KioskShell from './components/KioskShell'

export default function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <Header />
      <KioskShell>
        <Container maxW="container.lg" py={4}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ItemsList />} />
              <Route path="/items/:id" element={<ItemDetail />} />
            </Routes>
          </BrowserRouter>
        </Container>
      </KioskShell>
    </ChakraProvider>
  )
}
