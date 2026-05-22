import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UGFProvider } from '@tychilabs/react-ugf'
import { UGF_MODE } from './utils/constants'
import { WalletProvider } from './context/WalletContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import BrowseEvents from './pages/BrowseEvents'
import CreateEvent from './pages/CreateEvent'
import MyTickets from './pages/MyTickets'
import VerifyTicket from './pages/VerifyTicket'

export default function App() {
  return (
    <UGFProvider mode={UGF_MODE}>
      <WalletProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="events" element={<BrowseEvents />} />
              <Route path="create" element={<CreateEvent />} />
              <Route path="my-tickets" element={<MyTickets />} />
              <Route path="verify" element={<VerifyTicket />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </UGFProvider>
  )
}
