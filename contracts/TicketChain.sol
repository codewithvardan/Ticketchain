// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title TicketChain — ERC-721 event tickets on Base Sepolia
contract TicketChain is ERC721Enumerable, Ownable {
    struct EventInfo {
        string name;
        string description;
        string venue;
        uint256 eventDate;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 ticketsSold;
        address organizer;
        bool active;
    }

    struct TicketInfo {
        uint256 eventId;
        bool verified;
    }

    uint256 public nextEventId;
    mapping(uint256 => EventInfo) public events;
    mapping(uint256 => TicketInfo) public tickets;

    event EventCreated(
        uint256 indexed eventId,
        address indexed organizer,
        string name,
        uint256 maxTickets,
        uint256 ticketPrice
    );
    event TicketPurchased(
        uint256 indexed eventId,
        uint256 indexed tokenId,
        address indexed buyer
    );
    event TicketVerified(uint256 indexed tokenId, uint256 indexed eventId);

    constructor() ERC721("TicketChain", "TCKT") Ownable(msg.sender) {}

    function createEvent(
        string calldata name,
        string calldata description,
        string calldata venue,
        uint256 eventDate,
        uint256 ticketPrice,
        uint256 maxTickets
    ) external returns (uint256 eventId) {
        require(bytes(name).length > 0, "Name required");
        require(maxTickets > 0, "Need capacity");
        require(eventDate > block.timestamp, "Date must be future");

        eventId = nextEventId++;
        events[eventId] = EventInfo({
            name: name,
            description: description,
            venue: venue,
            eventDate: eventDate,
            ticketPrice: ticketPrice,
            maxTickets: maxTickets,
            ticketsSold: 0,
            organizer: msg.sender,
            active: true
        });

        emit EventCreated(eventId, msg.sender, name, maxTickets, ticketPrice);
    }

    function buyTicket(uint256 eventId) external payable returns (uint256 tokenId) {
        EventInfo storage ev = events[eventId];
        require(ev.active, "Event inactive");
        require(ev.ticketsSold < ev.maxTickets, "Sold out");
        require(msg.value >= ev.ticketPrice, "Insufficient payment");

        if (msg.value > ev.ticketPrice) {
            (bool refundOk, ) = msg.sender.call{value: msg.value - ev.ticketPrice}("");
            require(refundOk, "Refund failed");
        }

        tokenId = totalSupply();
        _safeMint(msg.sender, tokenId);

        tickets[tokenId] = TicketInfo({eventId: eventId, verified: false});
        ev.ticketsSold++;

        emit TicketPurchased(eventId, tokenId, msg.sender);
    }

    /// @notice Check ticket validity; marks verified on first successful scan
    function verifyTicket(uint256 tokenId)
        external
        returns (
            bool valid,
            uint256 eventId,
            string memory eventName,
            address holder,
            bool wasAlreadyVerified
        )
    {
        require(_ownerOf(tokenId) != address(0), "Invalid token");

        TicketInfo storage ticket = tickets[tokenId];
        EventInfo storage ev = events[ticket.eventId];
        eventId = ticket.eventId;
        eventName = ev.name;
        holder = ownerOf(tokenId);
        wasAlreadyVerified = ticket.verified;

        valid = ev.active && block.timestamp <= ev.eventDate + 1 days;

        if (valid && !ticket.verified) {
            ticket.verified = true;
            emit TicketVerified(tokenId, eventId);
        }
    }

    function getEvent(uint256 eventId) external view returns (EventInfo memory) {
        return events[eventId];
    }

    function eventCount() external view returns (uint256) {
        return nextEventId;
    }
}
