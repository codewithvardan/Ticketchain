const INITIAL_EVENTS = [
  {
    id: 0,
    name: 'Global Blockchain Summit 2026',
    description: 'Join global leaders, developers, and web3 enthusiasts to discuss the future of decentralized technology, scaling solutions, and autonomous worlds.',
    venue: 'San Francisco Palace of Fine Arts & Online',
    eventDate: Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60, // 15 days from now
    ticketPrice: '10000000000000000', // 0.01 ETH in Wei (equivalent to $0.01 Mock USD)
    maxTickets: 500,
    ticketsSold: 342,
    organizer: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    active: true,
  },
  {
    id: 1,
    name: 'Ethereal Music Festival 2026',
    description: 'An immersive digital art and music festival featuring legendary electronic artists, interactive light shows, and fully tokenized beverage/merch vouchers.',
    venue: 'Red Rocks Amphitheater, CO',
    eventDate: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
    ticketPrice: '25000000000000000', // 0.025 ETH in Wei
    maxTickets: 1000,
    ticketsSold: 887,
    organizer: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    active: true,
  },
  {
    id: 2,
    name: 'Web3 & Solidity Developer Workshop',
    description: 'Learn how to write secure smart contracts, test using Hardhat, and build premium frontend interfaces with custom wallets. Lunch and refreshments included.',
    venue: 'Developer Space, London',
    eventDate: Math.floor(Date.now() / 1000) + 8 * 24 * 60 * 60, // 8 days from now
    ticketPrice: '0', // Free
    maxTickets: 150,
    ticketsSold: 85,
    organizer: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    active: true,
  }
]

export function initializeDemoData() {
  if (typeof window === 'undefined') return
  if (!localStorage.getItem('tc_demo_events')) {
    localStorage.setItem('tc_demo_events', JSON.stringify(INITIAL_EVENTS))
  }
  if (!localStorage.getItem('tc_demo_tickets')) {
    localStorage.setItem('tc_demo_tickets', JSON.stringify([]))
  }
  if (!localStorage.getItem('tc_demo_next_token_id')) {
    localStorage.setItem('tc_demo_next_token_id', '1000')
  }
}

export function getDemoEvents() {
  initializeDemoData()
  try {
    const list = JSON.parse(localStorage.getItem('tc_demo_events') || '[]')
    return list.map(ev => ({
      ...ev,
      ticketPrice: BigInt(ev.ticketPrice),
      remaining: Number(ev.maxTickets) - Number(ev.ticketsSold)
    })).reverse() // reverse matches fetchAllEvents
  } catch (e) {
    console.error('Error fetching demo events:', e)
    return []
  }
}

export function createDemoEvent(name, description, venue, eventDate, ticketPrice, maxTickets, organizer) {
  initializeDemoData()
  try {
    const list = JSON.parse(localStorage.getItem('tc_demo_events') || '[]')
    const nextId = list.length > 0 ? Math.max(...list.map(e => e.id)) + 1 : 0
    const newEvent = {
      id: nextId,
      name,
      description,
      venue,
      eventDate: Number(eventDate),
      ticketPrice: ticketPrice.toString(),
      maxTickets: Number(maxTickets),
      ticketsSold: 0,
      organizer,
      active: true
    }
    list.push(newEvent)
    localStorage.setItem('tc_demo_events', JSON.stringify(list))
    return newEvent
  } catch (e) {
    console.error('Error creating demo event:', e)
    throw new Error('Failed to create event in demo mode')
  }
}

export function buyDemoTicket(eventId, buyerAddress) {
  initializeDemoData()
  try {
    const events = JSON.parse(localStorage.getItem('tc_demo_events') || '[]')
    const eventIdx = events.findIndex(e => e.id === Number(eventId))
    if (eventIdx === -1) throw new Error('Event not found')

    const event = events[eventIdx]
    if (Number(event.ticketsSold) >= Number(event.maxTickets)) {
      throw new Error('Event is sold out')
    }

    // Increment tickets sold
    events[eventIdx].ticketsSold = Number(event.ticketsSold) + 1
    localStorage.setItem('tc_demo_events', JSON.stringify(events))

    // Generate new ticket
    const tickets = JSON.parse(localStorage.getItem('tc_demo_tickets') || '[]')
    const nextTokenId = Number(localStorage.getItem('tc_demo_next_token_id') || '1000')
    const newTicket = {
      tokenId: nextTokenId.toString(),
      eventId: Number(eventId),
      owner: buyerAddress,
      verified: false
    }
    tickets.push(newTicket)
    localStorage.setItem('tc_demo_tickets', JSON.stringify(tickets))
    localStorage.setItem('tc_demo_next_token_id', (nextTokenId + 1).toString())

    return newTicket
  } catch (e) {
    console.error('Error buying demo ticket:', e)
    throw new Error(e.message || 'Failed to purchase ticket in demo mode')
  }
}

export function getDemoTickets(buyerAddress) {
  initializeDemoData()
  try {
    const tickets = JSON.parse(localStorage.getItem('tc_demo_tickets') || '[]')
    const events = JSON.parse(localStorage.getItem('tc_demo_events') || '[]')
    
    // Filter tickets owned by buyerAddress
    const userTickets = tickets.filter(t => t.owner.toLowerCase() === buyerAddress.toLowerCase())
    
    return userTickets.map(t => {
      const eventRaw = events.find(e => e.id === t.eventId)
      const event = eventRaw ? {
        ...eventRaw,
        ticketPrice: BigInt(eventRaw.ticketPrice),
        remaining: Number(eventRaw.maxTickets) - Number(eventRaw.ticketsSold)
      } : null

      return {
        tokenId: t.tokenId,
        verified: t.verified,
        event
      }
    }).reverse()
  } catch (e) {
    console.error('Error getting demo tickets:', e)
    return []
  }
}

export function getDemoTicketPreview(tokenId) {
  initializeDemoData()
  try {
    const tickets = JSON.parse(localStorage.getItem('tc_demo_tickets') || '[]')
    const ticket = tickets.find(t => t.tokenId === tokenId.toString())
    if (!ticket) throw new Error('Invalid ticket ID — does this token exist?')

    const events = JSON.parse(localStorage.getItem('tc_demo_events') || '[]')
    const eventRaw = events.find(e => e.id === ticket.eventId)
    if (!eventRaw) throw new Error('Event for this ticket not found')

    const event = {
      ...eventRaw,
      ticketPrice: BigInt(eventRaw.ticketPrice),
      remaining: Number(eventRaw.maxTickets) - Number(eventRaw.ticketsSold)
    }

    return {
      tokenId: ticket.tokenId,
      owner: ticket.owner,
      verified: ticket.verified,
      event
    }
  } catch (e) {
    console.error('Error getting ticket preview:', e)
    throw new Error(e.message || 'Ticket preview failed')
  }
}

export function verifyDemoTicket(tokenId) {
  initializeDemoData()
  try {
    const tickets = JSON.parse(localStorage.getItem('tc_demo_tickets') || '[]')
    const ticketIdx = tickets.findIndex(t => t.tokenId === tokenId.toString())
    if (ticketIdx === -1) throw new Error('Ticket not found')

    if (tickets[ticketIdx].verified) {
      throw new Error('Ticket already verified')
    }

    tickets[ticketIdx].verified = true
    localStorage.setItem('tc_demo_tickets', JSON.stringify(tickets))
    return tickets[ticketIdx]
  } catch (e) {
    console.error('Error verifying ticket:', e)
    throw new Error(e.message || 'Ticket verification failed')
  }
}
