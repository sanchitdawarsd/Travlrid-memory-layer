const cheerio = require('cheerio');

class BookingParser {
  constructor() {
    // Global airline database for detection
    this.airlines = {
      // Indian Airlines
      'AI': 'Air India', '6E': 'IndiGo', 'SG': 'SpiceJet', 'UK': 'Vistara',
      'IX': 'Air India Express', 'QP': 'Akasa Air', 'G8': 'Go First', 'I5': 'AirAsia India',
      // Middle East
      'EK': 'Emirates', 'EY': 'Etihad', 'QR': 'Qatar Airways', 'WY': 'Oman Air',
      'GF': 'Gulf Air', 'FZ': 'Flydubai', 'G9': 'Air Arabia',
      // Southeast Asia
      'SQ': 'Singapore Airlines', 'TG': 'Thai Airways', 'MH': 'Malaysia Airlines',
      'GA': 'Garuda Indonesia', 'VN': 'Vietnam Airlines', 'AK': 'AirAsia',
      'TR': 'Scoot', 'FD': 'Thai AirAsia', 'QZ': 'Indonesia AirAsia',
      // East Asia
      'CX': 'Cathay Pacific', 'NH': 'ANA', 'JL': 'Japan Airlines',
      'KE': 'Korean Air', 'OZ': 'Asiana', 'CA': 'Air China', 'MU': 'China Eastern',
      'CZ': 'China Southern', 'HU': 'Hainan Airlines', 'BR': 'EVA Air',
      // Europe
      'BA': 'British Airways', 'LH': 'Lufthansa', 'AF': 'Air France',
      'KL': 'KLM', 'IB': 'Iberia', 'AZ': 'ITA Airways', 'SK': 'SAS',
      'LX': 'Swiss', 'OS': 'Austrian', 'TK': 'Turkish Airlines',
      'SU': 'Aeroflot', 'AY': 'Finnair', 'EI': 'Aer Lingus',
      // Americas
      'AA': 'American Airlines', 'UA': 'United Airlines', 'DL': 'Delta',
      'WN': 'Southwest', 'B6': 'JetBlue', 'AC': 'Air Canada',
      'AM': 'Aeromexico', 'LA': 'LATAM', 'AV': 'Avianca',
      // Oceania & Africa
      'QF': 'Qantas', 'NZ': 'Air New Zealand', 'VA': 'Virgin Australia',
      'ET': 'Ethiopian Airlines', 'SA': 'South African Airways', 'MS': 'EgyptAir',
      'KQ': 'Kenya Airways', 'RJ': 'Royal Jordanian',
      // Low Cost Global
      'FR': 'Ryanair', 'U2': 'easyJet', 'W6': 'Wizz Air', 'VY': 'Vueling',
      'NK': 'Spirit Airlines', 'F9': 'Frontier',
    };

    // Global airport codes (major hubs)
    this.airports = {
      // India
      'DEL': 'New Delhi', 'BOM': 'Mumbai', 'BLR': 'Bangalore', 'MAA': 'Chennai',
      'CCU': 'Kolkata', 'HYD': 'Hyderabad', 'AMD': 'Ahmedabad', 'PNQ': 'Pune',
      'GOI': 'Goa', 'COK': 'Kochi', 'JAI': 'Jaipur', 'LKO': 'Lucknow',
      'GAU': 'Guwahati', 'SXR': 'Srinagar', 'IXC': 'Chandigarh', 'TRV': 'Trivandrum',
      'GOX': 'Goa Mopa', 'VNS': 'Varanasi', 'ATQ': 'Amritsar', 'IXB': 'Bagdogra',
      // Middle East
      'DXB': 'Dubai', 'AUH': 'Abu Dhabi', 'DOH': 'Doha', 'MCT': 'Muscat',
      'BAH': 'Bahrain', 'KWI': 'Kuwait', 'RUH': 'Riyadh', 'JED': 'Jeddah',
      'TLV': 'Tel Aviv', 'AMM': 'Amman', 'CAI': 'Cairo',
      // Southeast Asia
      'SIN': 'Singapore', 'BKK': 'Bangkok', 'KUL': 'Kuala Lumpur',
      'CGK': 'Jakarta', 'MNL': 'Manila', 'SGN': 'Ho Chi Minh', 'HAN': 'Hanoi',
      'DPS': 'Bali', 'REP': 'Siem Reap', 'RGN': 'Yangon', 'PNH': 'Phnom Penh',
      'DMK': 'Bangkok Don Mueang', 'HKT': 'Phuket', 'CNX': 'Chiang Mai',
      // East Asia
      'HKG': 'Hong Kong', 'PEK': 'Beijing', 'PVG': 'Shanghai', 'CAN': 'Guangzhou',
      'NRT': 'Tokyo Narita', 'HND': 'Tokyo Haneda', 'KIX': 'Osaka',
      'ICN': 'Seoul Incheon', 'TPE': 'Taipei', 'MFM': 'Macau',
      // Europe
      'LHR': 'London Heathrow', 'LGW': 'London Gatwick', 'STN': 'London Stansted',
      'CDG': 'Paris CDG', 'ORY': 'Paris Orly', 'FRA': 'Frankfurt', 'MUC': 'Munich',
      'AMS': 'Amsterdam', 'MAD': 'Madrid', 'BCN': 'Barcelona', 'FCO': 'Rome',
      'MXP': 'Milan', 'ZRH': 'Zurich', 'VIE': 'Vienna', 'IST': 'Istanbul',
      'ATH': 'Athens', 'LIS': 'Lisbon', 'CPH': 'Copenhagen', 'ARN': 'Stockholm',
      'OSL': 'Oslo', 'HEL': 'Helsinki', 'DUB': 'Dublin', 'BRU': 'Brussels',
      // Americas
      'JFK': 'New York JFK', 'EWR': 'Newark', 'LAX': 'Los Angeles',
      'ORD': 'Chicago', 'DFW': 'Dallas', 'MIA': 'Miami', 'SFO': 'San Francisco',
      'SEA': 'Seattle', 'BOS': 'Boston', 'ATL': 'Atlanta', 'DEN': 'Denver',
      'YYZ': 'Toronto', 'YVR': 'Vancouver', 'MEX': 'Mexico City',
      'GRU': 'Sao Paulo', 'EZE': 'Buenos Aires', 'SCL': 'Santiago', 'BOG': 'Bogota',
      // Oceania & Africa
      'SYD': 'Sydney', 'MEL': 'Melbourne', 'BNE': 'Brisbane', 'AKL': 'Auckland',
      'JNB': 'Johannesburg', 'CPT': 'Cape Town', 'NBO': 'Nairobi', 'ADD': 'Addis Ababa',
      'LOS': 'Lagos', 'ACC': 'Accra', 'CMN': 'Casablanca',
    };

    // Global booking platforms
    this.platforms = {
      flight: [
        'goibibo', 'makemytrip', 'cleartrip', 'yatra', 'ixigo', 'easemytrip',
        'booking.com', 'agoda', 'expedia', 'kayak', 'skyscanner', 'google flights',
        'trip.com', 'ctrip', 'traveloka', 'tiket.com', 'airasia',
        'kiwi.com', 'momondo', 'cheapflights', 'hopper', 'priceline',
        'flightsmojo', 'happyfares', 'magicfares', 'tripodeal', 'travelsees',
        'aertrip', 'vakatrip', 'flyus', 'faremart', 'airfarewatchdog'
      ],
      hotel: [
        'booking.com', 'agoda', 'hotels.com', 'expedia', 'trivago',
        'makemytrip', 'goibibo', 'oyo', 'treebo', 'fabhotels',
        'airbnb', 'vrbo', 'hostelworld', 'zostel', 'hosteller',
        'marriott', 'hilton', 'ihg', 'accor', 'hyatt', 'radisson',
        'taj', 'oberoi', 'itc hotels', 'lemon tree', 'ginger',
        'trip.com', 'traveloka', 'pegipegi', 'tiket.com'
      ],
      bus: [
        'redbus', 'goibibo', 'makemytrip', 'abhibus', 'paytm',
        'ixigo', 'confirmtkt', 'travelyaari', 'busbuddy',
        'flixbus', 'greyhound', 'megabus', 'busbud', 'omio',
        'easybook', '12go', 'bookaway', 'rome2rio'
      ],
      train: [
        'irctc', 'confirmtkt', 'ixigo', 'paytm', 'makemytrip',
        'railyatri', 'trainman', 'cleartrip',
        'trainline', 'omio', 'rail europe', 'eurail', 'amtrak',
        '12go', 'klook', 'trip.com'
      ],
      cab: [
        'uber', 'ola', 'lyft', 'grab', 'gojek', 'didi',
        'bolt', 'free now', 'cabify', 'yandex taxi',
        'careem', 'savaari', 'meru', 'gozo cabs'
      ],
      rental: [
        'zoomcar', 'drivezy', 'revv', 'myles', 'avis', 'hertz',
        'enterprise', 'budget', 'sixt', 'europcar', 'national',
        'bounce', 'vogo', 'yulu', 'onnbikes', 'ontrack', 'royal brothers'
      ]
    };

    // Patterns with global support
    this.patterns = {
      flight: {
        keywords: [
          'flight', 'airline', 'boarding', 'departure', 'arrival', 'pnr', 
          'booking reference', 'e-ticket', 'airport', 'terminal', 'journey',
          'itinerary', 'confirmation', 'reservation', 'travel on', 'fly',
          'passenger', 'traveller', 'traveler', 'baggage', 'cabin', 'check-in baggage',
          'economy', 'business', 'first class', 'premium economy',
          // Multi-language keywords
          'vuelo', 'flug', 'vol', 'volo', 'voo', 'рейс', '航班', 'フライト', '비행'
        ],
        negativeKeywords: ['hotel', 'hostel', 'room booking', 'accommodation', 'bus booking'],
        
        // PNR: 5-8 alphanumeric, usually uppercase
        pnr: [
          /\bPNR[\s:]*([A-Z0-9]{5,8})\b/gi,
          /\b(?:record\s*locator|confirmation\s*code)[\s:]*([A-Z0-9]{5,8})\b/gi,
          /\b(?:airline\s*)?(?:booking\s*)?(?:reference|ref)[\s:]*([A-Z0-9]{6})\b/gi,
        ],
        
        // Booking ID: Platform-specific patterns
        bookingId: [
          /\b(?:booking\s*id|booking\s*reference|order\s*(?:id|number))[\s:#]*([A-Z0-9]{6,25})\b/gi,
          /\b(?:confirmation\s*(?:number|id|code))[\s:#]*([A-Z0-9]{6,20})\b/gi,
          /\b(GOF[A-Z0-9]{10,})\b/g,  // Goibibo flights
          /\b(MF[A-Z0-9]{8,})\b/g,    // MagicFares
          /\b(TOD\d{8,})\b/g,         // TripOdeal
          /\b(HB[A-Z]{3}\d+)\b/g,     // HappyFares
          /\b(NN[A-Z0-9]{10,})\b/g,   // MakeMyTrip
          /\b(B\/\d{2}-\d{2}\/\d+)\b/g, // Aertrip
          /\b(\d{10,16})\b/g,         // Numeric booking IDs (Agoda, etc.)
        ],
        
        // Flight numbers: XX-1234, XX 1234, XX1234
        flightNumber: [
          /\b([A-Z]{2})\s*[-]?\s*(\d{1,4})\b/g,
          /\b([0-9][A-Z])\s*[-]?\s*(\d{1,4})\b/g, // 6E, 9W format
        ],
        
        // Route detection
        route: [
          /\b([A-Z]{3})\s*(?:[-–—→]|to)\s*([A-Z]{3})\b/gi, // DEL - BKK
          /\bfrom\s+([A-Za-z\s]+)\s+to\s+([A-Za-z\s]+)\b/gi,
          /\b([A-Za-z]+(?:\s+[A-Za-z]+)?)\s*[-–—]\s*([A-Za-z]+(?:\s+[A-Za-z]+)?)\b/gi,
        ],
        
        // Date patterns (global formats)
        date: [
          // DD Mon YYYY, DD Mon YY
          /\b(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,\s]+(\d{2,4})\b/gi,
          // Mon DD, YYYY
          /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})[,\s]+(\d{2,4})\b/gi,
          // DD/MM/YYYY, DD-MM-YYYY
          /\b(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})\b/g,
          // YYYY-MM-DD (ISO)
          /\b(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})\b/g,
        ],
        
        // Time patterns
        time: [
          /\b(\d{1,2}):(\d{2})\s*(AM|PM|hrs?|hours?)?\b/gi,
          /\b(\d{1,2})\.(\d{2})\s*(AM|PM)?\b/gi,
        ],
        
        // Price patterns (global currencies)
        price: [
          // INR formats
          /(?:₹|Rs\.?|INR)\s*([0-9,]+(?:\.\d{2})?)/gi,
          /\b([0-9,]+(?:\.\d{2})?)\s*(?:₹|Rs\.?|INR)\b/gi,
          // USD formats
          /(?:\$|USD)\s*([0-9,]+(?:\.\d{2})?)/gi,
          /\b([0-9,]+(?:\.\d{2})?)\s*(?:\$|USD)\b/gi,
          // EUR formats
          /(?:€|EUR)\s*([0-9,]+(?:\.\d{2})?)/gi,
          // GBP formats
          /(?:£|GBP)\s*([0-9,]+(?:\.\d{2})?)/gi,
          // AED formats
          /(?:AED|Dhs?\.?)\s*([0-9,]+(?:\.\d{2})?)/gi,
          // SGD formats
          /(?:SGD|S\$)\s*([0-9,]+(?:\.\d{2})?)/gi,
          // THB formats
          /(?:THB|฿)\s*([0-9,]+(?:\.\d{2})?)/gi,
          // Generic "Total: XXX" pattern
          /\b(?:total|amount|fare|price|paid)[\s:]*([0-9,]+(?:\.\d{2})?)\b/gi,
        ],
        
        // E-ticket number
        eTicketNumber: [
          /\be-?ticket\s*(?:number|no\.?)[\s:]*([0-9]{3}[-\s]?[0-9]{10,})/gi,
          /\bticket\s*(?:number|no\.?)[\s:]*([0-9-]{10,})/gi,
        ],
        
        // Passenger names
        passenger: [
          /\b(?:Mr\.?|Mrs\.?|Ms\.?|Miss|Dr\.?|Master)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/gi,
          /\bpassenger[\s:]*([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)+)/gi,
          /\btravell?er[\s:]*([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)+)/gi,
          /\bname[\s:]*([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)+)/gi,
        ],
        
        // Baggage
        baggage: [
          /\b(?:check-?in|checked?)[\s:]*(\d+)\s*kg/gi,
          /\b(?:cabin|hand|carry.?on)[\s:]*(\d+)\s*kg/gi,
          /\bbaggage[\s:]*(\d+)\s*kg/gi,
        ],
        
        // Class of travel
        travelClass: [
          /\b(economy|business|first\s*class|premium\s*economy)\b/gi,
          /\b(saver|flexi|value|lite|classic|comfort)\b/gi,
        ],
        
        // Seat
        seat: [
          /\bseat[\s:]*([0-9]{1,2}[A-Z])\b/gi,
          /\b([0-9]{1,2}[A-Z])\s*(?:window|aisle|middle)?\b/gi,
        ],
      },
      
      hotel: {
        keywords: [
          'hotel', 'resort', 'accommodation', 'room', 'check-in', 'check-out',
          'night', 'nights', 'guest', 'property', 'stay', 'reservation', 'booking confirmed',
          'hostel', 'homestay', 'villa', 'apartment', 'suite', 'deluxe',
          'breakfast included', 'wifi', 'amenities', 'concierge',
          // Multi-language
          'alojamiento', 'unterkunft', 'hébergement', 'alloggio', 'hospedagem'
        ],
        negativeKeywords: ['flight', 'airline', 'boarding pass', 'e-ticket', 'pnr'],
        
        bookingId: [
          /\b(?:booking\s*id|reservation\s*(?:id|number)|confirmation\s*(?:number|id|code))[\s:#]*([A-Z0-9]{6,20})\b/gi,
          /\b(GH[0-9]{11,})\b/g,  // Goibibo hotels
          /\b(NH[0-9]{11,})\b/g,  // MakeMyTrip hotels
          /\b(RES[A-Z0-9]{8,})\b/g, // Hosteller
          /\b([A-Z]{4}\d{3}-[A-Z0-9]+)\b/g, // Zostel format
          /\b(\d{10,16})\b/g,  // Agoda, Booking.com numeric IDs
        ],
        
        propertyName: [
          /\b(?:hotel|resort|hostel|property)[\s:]*([A-Z][A-Za-z0-9\s&',-]+?)(?:\s*[-,]|\s+(?:check|book|reserv))/gi,
          /\bstay(?:ing)?\s+(?:at|in)\s+([A-Z][A-Za-z0-9\s&',-]+?)(?:\s*[-,]|\s+(?:check|from))/gi,
          /\bconfirmed\s+(?:at|for)\s+([A-Z][A-Za-z0-9\s&',-]+?)(?:\s*[-,!]|\s+(?:check|from))/gi,
        ],
        
        checkIn: [
          /\bcheck[\s-]?in[\s:]*(?:on\s+)?(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*[,\s]*)?(\d{1,2}[\/\-\s]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\/\-\s,]+\d{2,4})/gi,
          /\bcheck[\s-]?in[\s:]*(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*[,\s]*)?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
          /\barrival[\s:]*(\d{1,2}[\/\-\s]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\/\-\s,]+\d{2,4})/gi,
        ],
        
        checkOut: [
          /\bcheck[\s-]?out[\s:]*(?:on\s+)?(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*[,\s]*)?(\d{1,2}[\/\-\s]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\/\-\s,]+\d{2,4})/gi,
          /\bcheck[\s-]?out[\s:]*(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*[,\s]*)?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
          /\bdeparture[\s:]*(\d{1,2}[\/\-\s]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\/\-\s,]+\d{2,4})/gi,
        ],
        
        nights: [
          /\b(\d+)\s*[-]?\s*night/gi,
          /\bnight(?:s)?[\s:]*(\d+)/gi,
        ],
        
        rooms: [
          /\b(\d+)\s*room/gi,
          /\broom(?:s)?[\s:]*(\d+)/gi,
        ],
        
        guests: [
          /\b(\d+)\s*(?:adult|guest|person|pax)/gi,
          /\b(\d+)\s*child(?:ren)?/gi,
        ],
        
        roomType: [
          /\b(deluxe|standard|superior|suite|dormitory|dorm|private|shared|twin|double|single|king|queen)\s*(?:room|bed)?/gi,
          /\broom\s*type[\s:]*([A-Za-z\s]+?)(?:\s*[-,]|$)/gi,
        ],
        
        price: [
          /(?:₹|Rs\.?|INR)\s*([0-9,]+(?:\.\d{2})?)/gi,
          /(?:\$|USD)\s*([0-9,]+(?:\.\d{2})?)/gi,
          /(?:€|EUR)\s*([0-9,]+(?:\.\d{2})?)/gi,
          /(?:£|GBP)\s*([0-9,]+(?:\.\d{2})?)/gi,
          /\b(?:total|amount|charge|tariff|payable)[\s:]*([0-9,]+(?:\.\d{2})?)\b/gi,
        ],
        
        location: [
          /\baddress[\s:]*([A-Za-z0-9\s,.-]+?)(?:\s*(?:phone|email|contact|directions)|$)/gi,
          /\blocation[\s:]*([A-Za-z\s,]+)/gi,
        ],
        
        amenities: [
          /\b(wifi|breakfast|parking|pool|gym|spa|ac|air.?conditioning|tv|restaurant|bar|laundry|room\s*service)\b/gi,
        ],
      },
      
      bus: {
        keywords: [
          'bus', 'coach', 'boarding point', 'dropping point', 'sleeper', 'seater',
          'volvo', 'semi sleeper', 'ac bus', 'non-ac', 'travel', 'seat number',
          'bus ticket', 'bus booking', 'redbus', 'abhibus',
          // Multi-language
          'autobús', 'autobus', 'ônibus', 'autocar'
        ],
        negativeKeywords: ['flight', 'hotel', 'train'],
        
        bookingId: [
          /\b(?:booking\s*id|ticket\s*(?:id|number)|pnr)[\s:#]*([A-Z0-9]{8,20})\b/gi,
          /\b(GOBUS[A-Z0-9]+)\b/g, // Goibibo bus
          /\b(RB[0-9]{10,})\b/g,   // RedBus
        ],
        
        operator: [
          /\b(?:operator|travels|bus)[\s:]*([A-Z][A-Za-z\s&]+(?:travels|bus|transport)?)/gi,
          /\b(zingbus|vrl|ksrtc|apsrtc|tsrtc|msrtc|gsrtc|rsrtc|upsrtc|hrtc|pepsu|punjab roadways)\b/gi,
          /\b(flixbus|greyhound|megabus|national express|eurolines)\b/gi,
        ],
        
        route: [
          /\b([A-Za-z\s]+)\s*(?:[-–—→]|to)\s*([A-Za-z\s]+)\b/gi,
        ],
        
        date: [
          /\b(?:travel|journey|departure)[\s:]*(?:on\s+)?(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*[,\s]*)?(\d{1,2}[\/\-\s]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\/\-\s,']*\d{2,4})/gi,
        ],
        
        boardingPoint: [
          /\bboarding\s*(?:point|location)?[\s:]*([A-Za-z0-9\s,.-]+?)(?:\s*(?:departure|time|address)|$)/gi,
        ],
        
        droppingPoint: [
          /\bdrop(?:ping)?\s*(?:point|location)?[\s:]*([A-Za-z0-9\s,.-]+?)(?:\s*(?:arrival|time)|$)/gi,
        ],
        
        departureTime: [
          /\bdeparture[\s:]*(\d{1,2}[:.]\d{2}\s*(?:AM|PM|hrs?)?)/gi,
          /\bboarding[\s:]*(?:time[\s:]*)?(\d{1,2}[:.]\d{2}\s*(?:AM|PM|hrs?)?)/gi,
        ],
        
        arrivalTime: [
          /\barrival[\s:]*(\d{1,2}[:.]\d{2}\s*(?:AM|PM|hrs?)?)/gi,
        ],
        
        seat: [
          /\bseat[\s:]*(?:no\.?[\s:]*)?([A-Z]?\d{1,2}[A-Z]?)/gi,
          /\bseat\s*(?:number|no\.?)[\s:]*([A-Z0-9,\s]+)/gi,
        ],
        
        busType: [
          /\b(volvo|mercedes|scania|ac\s*sleeper|non[\s-]?ac|sleeper|seater|semi[\s-]?sleeper|multi[\s-]?axle|2\+1|2\+2)\b/gi,
        ],
        
        price: [
          /(?:₹|Rs\.?|INR)\s*([0-9,]+(?:\.\d{2})?)/gi,
          /\b(?:total|fare|price|paid)[\s:]*([0-9,]+(?:\.\d{2})?)\b/gi,
        ],
      },
      
      train: {
        keywords: [
          'train', 'railway', 'rail', 'coach', 'platform', 'pnr', 'irctc',
          'sleeper', 'ac', '1a', '2a', '3a', 'sl', 'cc', 'ec', 'station',
          'rajdhani', 'shatabdi', 'duronto', 'vande bharat', 'tejas',
          // International
          'eurostar', 'tgv', 'ice', 'ave', 'shinkansen', 'ktx', 'amtrak',
          'intercity', 'regional', 'express'
        ],
        negativeKeywords: ['flight', 'hotel', 'bus'],
        
        pnr: [
          /\bpnr[\s:]*([0-9]{10})\b/gi,
          /\b([0-9]{10})\s*(?:is\s+)?(?:your\s+)?pnr\b/gi,
          /\bconfirmation[\s:]*([A-Z0-9]{6,10})\b/gi,
        ],
        
        trainNumber: [
          /\btrain[\s:]*(?:no\.?[\s:]*)?(\d{5})\b/gi,
          /\b(\d{5})\s*[-\/]\s*([A-Za-z\s]+(?:express|mail|superfast|rajdhani|shatabdi)?)\b/gi,
        ],
        
        trainName: [
          /\b(\d{5})\s*[-\/]?\s*([A-Za-z\s]+(?:Express|Mail|Superfast|Rajdhani|Shatabdi|Duronto|Vande\s*Bharat)?)\b/gi,
          /\b([A-Za-z\s]+(?:Express|Mail|Superfast|Rajdhani|Shatabdi|Duronto))\b/gi,
        ],
        
        route: [
          /\b([A-Za-z\s]+)\s*(?:[-–—→]|to)\s*([A-Za-z\s]+)\b/gi,
          /\bfrom[\s:]*([A-Za-z\s]+)\s+to[\s:]*([A-Za-z\s]+)\b/gi,
        ],
        
        date: [
          /\bjourney[\s:]*(?:on\s+)?(\d{1,2}[\/\-\s]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\/\-\s,]+\d{2,4})/gi,
          /\btravel[\s:]*(?:on\s+)?(\d{1,2}[\/\-\s]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\/\-\s,]+\d{2,4})/gi,
        ],
        
        coach: [
          /\bcoach[\s:]*([A-Z]\d{1,2})\b/gi,
          /\b([A-Z]\d{1,2})\s*[-\/]\s*(\d{1,3})\b/gi, // Coach-Berth format
        ],
        
        seat: [
          /\bseat[\s:]*(\d{1,3})\b/gi,
          /\bberth[\s:]*(\d{1,3})\b/gi,
        ],
        
        travelClass: [
          /\b(1A|2A|3A|SL|CC|EC|2S|GN|1AC|2AC|3AC|sleeper|chair\s*car)\b/gi,
          /\b(first\s*class|second\s*class|standard|business)\b/gi,
        ],
        
        quota: [
          /\b(general|tatkal|premium\s*tatkal|ladies|senior\s*citizen|divyang|defence)\s*quota\b/gi,
        ],
        
        status: [
          /\b(confirmed|cnf|rac|wl|waiting|can|cancelled)\b/gi,
        ],
        
        price: [
          /(?:₹|Rs\.?|INR)\s*([0-9,]+(?:\.\d{2})?)/gi,
          /\b(?:fare|total|price)[\s:]*([0-9,]+(?:\.\d{2})?)\b/gi,
        ],
      },
      
      cab: {
        keywords: [
          'cab', 'taxi', 'ride', 'uber', 'ola', 'lyft', 'grab', 'pickup',
          'drop', 'driver', 'vehicle', 'fare', 'trip', 'careem', 'didi',
          'bolt', 'gojek', 'yandex'
        ],
        
        bookingId: [
          /\b(?:trip|ride|booking)[\s:]*(?:id|#)?[\s:]*([A-Z0-9-]{8,20})\b/gi,
        ],
        
        pickup: [
          /\bpickup[\s:]*(?:from[\s:]*)?([A-Za-z0-9\s,.-]+?)(?:\s*(?:to|drop|at|time)|$)/gi,
          /\bfrom[\s:]*([A-Za-z0-9\s,.-]+?)(?:\s*to\s)/gi,
        ],
        
        drop: [
          /\bdrop(?:off)?[\s:]*(?:at[\s:]*)?([A-Za-z0-9\s,.-]+?)(?:\s*(?:fare|price|at)|$)/gi,
          /\bto[\s:]*([A-Za-z0-9\s,.-]+?)(?:\s*(?:fare|price)|$)/gi,
        ],
        
        date: [
          /\b(?:date|on)[\s:]*(\d{1,2}[\/\-\s]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\/\-\s,]+\d{2,4})/gi,
        ],
        
        time: [
          /\b(?:time|at)[\s:]*(\d{1,2}[:.]\d{2}\s*(?:AM|PM)?)/gi,
        ],
        
        driver: [
          /\bdriver[\s:]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
        ],
        
        vehicle: [
          /\bvehicle[\s:]*([A-Z]{2}\s*\d{1,2}\s*[A-Z]{1,3}\s*\d{1,4})/gi,
          /\b([A-Z]{2}\s*\d{1,2}\s*[A-Z]{1,3}\s*\d{1,4})\b/g, // License plate
        ],
        
        price: [
          /(?:₹|Rs\.?|INR)\s*([0-9,]+(?:\.\d{2})?)/gi,
          /\b(?:fare|total|price)[\s:]*([0-9,]+(?:\.\d{2})?)\b/gi,
        ],
      },
      
      rental: {
        keywords: [
          'rental', 'rent', 'bike', 'car', 'vehicle', 'scooty', 'scooter',
          'motorcycle', 'activa', 'pickup', 'return', 'zoomcar', 'drivezy',
          'revv', 'myles', 'bounce', 'vogo', 'royal brothers', 'ontrack', 'onnbikes',
          'avis', 'hertz', 'enterprise', 'budget', 'sixt', 'europcar'
        ],
        
        bookingId: [
          /\b(?:order|booking)[\s:]*(?:id|#)?[\s:]*([A-Z]{2}\d{6,})\b/gi,
          /\b(?:booking|order)[\s:]*(?:id|#)?[\s:]*([A-Z0-9]{6,15})\b/gi,
        ],
        
        vehicle: [
          /\bvehicle[\s:]*([A-Za-z0-9\s-]+?)(?:\s*(?:from|pickup|date)|$)/gi,
          /\b(activa|access|jupiter|ntorq|dio|aviator|pleasure|fascino|ray|burgman)\b/gi,
          /\b(swift|i20|baleno|creta|venue|seltos|nexon|thar|fortuner|innova)\b/gi,
        ],
        
        pickupDate: [
          /\b(?:pickup|from|start)[\s:]*(?:date[\s:]*)?(\d{1,2}[\/\-\s]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\/\-\s,]+\d{2,4})/gi,
        ],
        
        returnDate: [
          /\b(?:return|to|end|drop)[\s:]*(?:date[\s:]*)?(\d{1,2}[\/\-\s]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\/\-\s,]+\d{2,4})/gi,
        ],
        
        pickupLocation: [
          /\bpickup\s*(?:location|point)?[\s:]*([A-Za-z0-9\s,.-]+?)(?:\s*(?:return|drop|to)|$)/gi,
        ],
        
        returnLocation: [
          /\breturn\s*(?:location|point)?[\s:]*([A-Za-z0-9\s,.-]+?)(?:\s*(?:total|price|$))/gi,
        ],
        
        price: [
          /(?:₹|Rs\.?|INR)\s*([0-9,]+(?:\.\d{2})?)/gi,
          /\b(?:total|amount|price)[\s:]*([0-9,]+(?:\.\d{2})?)\b/gi,
        ],
      },
      
      event: {
        keywords: [
          'event', 'ticket', 'concert', 'show', 'movie', 'theatre', 'theater',
          'venue', 'seat', 'bookmyshow', 'paytm insider', 'live', 'performance',
          'exhibition', 'festival', 'match', 'game', 'sports'
        ],
        
        bookingId: [
          /\b(?:booking\s*id|ticket\s*id|order\s*id)[\s:#]*([A-Z0-9]{10,20})\b/gi,
        ],
        
        eventName: [
          /\bconfirmed\s+for\s+([A-Za-z0-9\s&',-]+?)(?:\s*[-,]|\s+(?:at|venue|on))/gi,
          /\bevent[\s:]*([A-Za-z0-9\s&',-]+?)(?:\s*[-,]|\s+(?:at|venue))/gi,
        ],
        
        venue: [
          /\bvenue[\s:]*([A-Za-z0-9\s&',-]+?)(?:\s*[-,]|\s+(?:on|date|time))/gi,
        ],
        
        date: [
          /\b(?:date|on)[\s:]*(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*[,\s]*)?(\d{1,2}[\/\-\s]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\/\-\s,]+\d{2,4})/gi,
        ],
        
        time: [
          /\btime[\s:]*(\d{1,2}[:.]\d{2}\s*(?:AM|PM)?)/gi,
          /\b(\d{1,2}[:.]\d{2}\s*(?:AM|PM))\b/gi,
        ],
        
        seat: [
          /\bseat[\s:]*([A-Z]?\d{1,3}[A-Z]?)/gi,
          /\brow[\s:]*([A-Z])\s*seat[\s:]*(\d{1,3})/gi,
        ],
        
        quantity: [
          /\b(?:qty|quantity)[\s:]*(\d+)/gi,
          /\b(\d+)\s*(?:ticket|pass|seat)/gi,
        ],
        
        category: [
          /\bcategory[\s:]*([A-Za-z\s]+?)(?:\s*[-,]|\s+(?:qty|quantity|price))/gi,
        ],
        
        price: [
          /(?:₹|Rs\.?|INR)\s*([0-9,]+(?:\.\d{2})?)/gi,
          /\b(?:total|amount|price|paid)[\s:]*([0-9,]+(?:\.\d{2})?)\b/gi,
        ],
      },
    };
  }

  /**
   * Parse a single email
   */
  parseEmail(email) {
    const bookingType = this.detectBookingType(email);
    
    if (!bookingType) {
      return null;
    }

    const cleanText = typeof email.body === 'string' ? email.body : this.extractText(email.body);
    
    const parsedData = {
      id: email.id,
      type: bookingType,
      subject: email.subject,
      from: email.from,
      date: email.date,
      platform: this.detectPlatform(email),
      raw: cleanText.substring(0, 500), // Limit raw text size
      bookingDetails: this.extractBookingDetails(cleanText, bookingType, email)
    };

    // Add confidence score
    parsedData.confidence = this.calculateConfidence(parsedData);

    return parsedData;
  }

  /**
   * Detect booking type with improved accuracy
   */
  detectBookingType(email) {
    const searchText = `${email.subject} ${email.body}`.toLowerCase();
    const subjectLower = email.subject.toLowerCase();
    
    const scores = {
      flight: 0,
      hotel: 0,
      train: 0,
      bus: 0,
      cab: 0,
      rental: 0,
      event: 0
    };

    // Check subject line first (higher weight)
    Object.keys(this.patterns).forEach(type => {
      const pattern = this.patterns[type];
      
      // Check keywords in subject (2x weight)
      pattern.keywords.forEach(keyword => {
        if (subjectLower.includes(keyword.toLowerCase())) {
          scores[type] += 2;
        }
      });
      
      // Check negative keywords (reduce score)
      if (pattern.negativeKeywords) {
        pattern.negativeKeywords.forEach(keyword => {
          if (subjectLower.includes(keyword.toLowerCase())) {
            scores[type] -= 3;
          }
        });
      }
    });

    // Specific platform detection
    const fromLower = email.from.toLowerCase();
    
    // Flight platforms
    if (this.platforms.flight.some(p => fromLower.includes(p) || searchText.includes(p))) {
      if (searchText.includes('flight') || searchText.includes('e-ticket') || 
          searchText.includes('pnr') || searchText.includes('boarding')) {
        scores.flight += 5;
      }
    }
    
    // Hotel platforms
    if (this.platforms.hotel.some(p => fromLower.includes(p))) {
      if (searchText.includes('hotel') || searchText.includes('check-in') ||
          searchText.includes('room') || searchText.includes('stay')) {
        scores.hotel += 5;
      }
    }
    
    // Bus platforms
    if (this.platforms.bus.some(p => fromLower.includes(p) || searchText.includes(p))) {
      if (searchText.includes('bus') || searchText.includes('boarding point')) {
        scores.bus += 5;
      }
    }
    
    // Train platforms
    if (this.platforms.train.some(p => fromLower.includes(p) || searchText.includes(p))) {
      scores.train += 3;
    }
    
    // Rental platforms
    if (this.platforms.rental.some(p => fromLower.includes(p) || searchText.includes(p))) {
      scores.rental += 3;
    }

    // Specific pattern matching
    // Flight-specific patterns
    if (/\b[A-Z]{2}[-\s]?\d{1,4}\b/.test(email.body) && 
        (searchText.includes('flight') || searchText.includes('airline'))) {
      scores.flight += 3;
    }
    
    // PNR pattern (usually flights/trains)
    if (/\bpnr[\s:]*[A-Z0-9]{6,10}\b/i.test(searchText)) {
      if (searchText.includes('flight') || searchText.includes('airline')) {
        scores.flight += 2;
      } else if (searchText.includes('train') || searchText.includes('railway')) {
        scores.train += 2;
      }
    }
    
    // Airport codes
    const airportPattern = new RegExp(`\\b(${Object.keys(this.airports).join('|')})\\b`, 'gi');
    const airportMatches = searchText.match(airportPattern);
    if (airportMatches && airportMatches.length >= 2) {
      scores.flight += 2;
    }

    // Body keywords (1x weight)
    Object.keys(this.patterns).forEach(type => {
      this.patterns[type].keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = searchText.match(regex);
        if (matches) {
          scores[type] += matches.length * 0.5;
        }
      });
    });

    // Get max score
    const maxScore = Math.max(...Object.values(scores));
    
    if (maxScore <= 1) {
      return null;
    }

    // Return type with highest score
    return Object.keys(scores).find(key => scores[key] === maxScore);
  }

  /**
   * Detect booking platform
   */
  detectPlatform(email) {
    const fromLower = email.from.toLowerCase();
    const subjectLower = email.subject.toLowerCase();
    const bodyLower = email.body.toLowerCase();
    
    const allPlatforms = [
      ...this.platforms.flight,
      ...this.platforms.hotel,
      ...this.platforms.bus,
      ...this.platforms.train,
      ...this.platforms.cab,
      ...this.platforms.rental
    ];
    
    // Check email from address first
    for (const platform of allPlatforms) {
      if (fromLower.includes(platform.replace(/\./g, ''))) {
        return this.normalizePlatformName(platform);
      }
    }
    
    // Check subject and body
    for (const platform of allPlatforms) {
      if (subjectLower.includes(platform) || bodyLower.includes(platform)) {
        return this.normalizePlatformName(platform);
      }
    }
    
    // Airline detection from email
    for (const [code, name] of Object.entries(this.airlines)) {
      if (fromLower.includes(name.toLowerCase().replace(/\s/g, ''))) {
        return name;
      }
    }
    
    return 'Unknown';
  }

  /**
   * Normalize platform name
   */
  normalizePlatformName(platform) {
    const nameMap = {
      'goibibo': 'Goibibo',
      'makemytrip': 'MakeMyTrip',
      'booking.com': 'Booking.com',
      'agoda': 'Agoda',
      'cleartrip': 'Cleartrip',
      'yatra': 'Yatra',
      'ixigo': 'ixigo',
      'expedia': 'Expedia',
      'trip.com': 'Trip.com',
      'airbnb': 'Airbnb',
      'zostel': 'Zostel',
      'hosteller': 'The Hosteller',
      'redbus': 'RedBus',
      'irctc': 'IRCTC',
      'uber': 'Uber',
      'ola': 'Ola',
      'zoomcar': 'Zoomcar',
      'bookmyshow': 'BookMyShow',
      'flightsmojo': 'FlightsMojo',
      'happyfares': 'HappyFares',
      'magicfares': 'MagicFares',
      'aertrip': 'Aertrip',
    };
    
    return nameMap[platform.toLowerCase()] || platform;
  }

  /**
   * Extract text from HTML
   */
  extractText(html) {
    if (typeof html === 'string' && !/<[^>]+>/.test(html)) {
      return html;
    }
    
    try {
      const $ = cheerio.load(html);
      $('script, style, noscript, head').remove();
      return $('body').text() || $.text();
    } catch (e) {
      return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
  }

  /**
   * Extract booking details based on type
   */
  extractBookingDetails(text, bookingType, email) {
    const patterns = this.patterns[bookingType];
    const details = {};

    Object.keys(patterns).forEach(key => {
      if (key === 'keywords' || key === 'negativeKeywords') return;

      const patternList = Array.isArray(patterns[key]) ? patterns[key] : [patterns[key]];
      const matches = new Set();
      const routeMatches = [];

      patternList.forEach(pattern => {
        // Create a fresh regex to reset lastIndex
        const regex = new RegExp(pattern.source, pattern.flags);
        let match;
        let iterations = 0;
        const maxIterations = 50;

        while ((match = regex.exec(text)) !== null && iterations < maxIterations) {
          iterations++;
          
          // Handle route patterns specially
          if (key === 'route') {
            if (match[1] && match[2]) {
              const origin = this.cleanLocationName(match[1]);
              const destination = this.cleanLocationName(match[2]);
              
              // Validate route
              if (this.isValidRoute(origin, destination)) {
                routeMatches.push({
                  origin,
                  destination,
                  originCode: this.getAirportCode(origin),
                  destinationCode: this.getAirportCode(destination)
                });
              }
            }
          } 
          // Handle flight numbers specially
          else if (key === 'flightNumber') {
            const flightNum = match[1] && match[2] 
              ? `${match[1].toUpperCase()}-${match[2]}`
              : (match[1] || match[0]).toUpperCase();
            
            if (this.isValidFlightNumber(flightNum)) {
              matches.add(flightNum);
            }
          }
          // Handle price specially - detect currency
          else if (key === 'price') {
            const value = this.extractPriceValue(match[0]);
            if (value) {
              matches.add(value);
            }
          }
          // Standard extraction
          else {
            const value = (match[2] || match[1] || match[0]).trim();
            if (value && value.length > 1 && value.length < 200) {
              matches.add(value);
            }
          }

          // Prevent infinite loops for non-global regex
          if (!pattern.global) break;
        }
      });

      // Store results
      if (key === 'route' && routeMatches.length > 0) {
        // Remove duplicates
        const uniqueRoutes = this.deduplicateRoutes(routeMatches);
        details[key] = uniqueRoutes.length === 1 ? uniqueRoutes[0] : uniqueRoutes;
      } else if (matches.size > 0) {
        const uniqueMatches = [...matches];
        details[key] = uniqueMatches.length === 1 ? uniqueMatches[0] : uniqueMatches;
      }
    });

    // Post-processing enhancements
    details = this.enhanceDetails(details, bookingType, text, email);

    return details;
  }

  /**
   * Enhance extracted details with additional logic
   */
  enhanceDetails(details, bookingType, text, email) {
    // Detect airline from flight number
    if (bookingType === 'flight' && details.flightNumber && !details.airline) {
      const flightNum = Array.isArray(details.flightNumber) 
        ? details.flightNumber[0] 
        : details.flightNumber;
      const code = flightNum.match(/^([A-Z0-9]{2})/)?.[1];
      if (code && this.airlines[code]) {
        details.airline = this.airlines[code];
      }
    }

    // Detect airline from email sender
    if (bookingType === 'flight' && !details.airline) {
      const fromLower = email.from.toLowerCase();
      for (const [code, name] of Object.entries(this.airlines)) {
        if (fromLower.includes(name.toLowerCase().replace(/\s+/g, ''))) {
          details.airline = name;
          break;
        }
      }
    }

    // Resolve airport codes to city names
    if (details.route) {
      const routes = Array.isArray(details.route) ? details.route : [details.route];
      routes.forEach(route => {
        if (route.originCode && this.airports[route.originCode]) {
          route.originCity = this.airports[route.originCode];
        }
        if (route.destinationCode && this.airports[route.destinationCode]) {
          route.destinationCity = this.airports[route.destinationCode];
        }
      });
    }

    // Extract currency from price
    if (details.price) {
      const priceStr = Array.isArray(details.price) ? details.price[0] : details.price;
      if (typeof priceStr === 'string') {
        details.currency = this.detectCurrency(text);
        details.priceValue = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
      }
    }

    // Calculate nights for hotels
    if (bookingType === 'hotel' && details.checkIn && details.checkOut && !details.nights) {
      const nights = this.calculateNights(details.checkIn, details.checkOut);
      if (nights > 0) {
        details.nights = nights;
      }
    }

    return details;
  }

  /**
   * Calculate confidence score for parsed data
   */
  calculateConfidence(parsedData) {
    let score = 0;
    const details = parsedData.bookingDetails;
    
    // Essential fields based on type
    const essentialFields = {
      flight: ['bookingId', 'pnr', 'route', 'date', 'flightNumber'],
      hotel: ['bookingId', 'checkIn', 'checkOut', 'propertyName'],
      bus: ['bookingId', 'route', 'date', 'seat'],
      train: ['pnr', 'route', 'date', 'trainNumber'],
      cab: ['bookingId', 'pickup', 'drop'],
      rental: ['bookingId', 'vehicle', 'pickupDate'],
      event: ['bookingId', 'eventName', 'date', 'venue']
    };
    
    const fields = essentialFields[parsedData.type] || [];
    const fieldsFound = fields.filter(f => details[f]);
    
    // Base score from field coverage
    score = (fieldsFound.length / fields.length) * 70;
    
    // Platform detection bonus
    if (parsedData.platform !== 'Unknown') score += 10;
    
    // Price found bonus
    if (details.price || details.priceValue) score += 10;
    
    // Passenger/guest info bonus
    if (details.passenger || details.guests) score += 10;
    
    return Math.min(Math.round(score), 100);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Clean location names
   */
  cleanLocationName(name) {
    return name
      .replace(/\s+/g, ' ')
      .replace(/[^A-Za-z\s]/g, '')
      .trim()
      .split(' ')
      .filter(word => word.length > 1)
      .slice(0, 3)
      .join(' ');
  }

  /**
   * Check if route is valid
   */
  isValidRoute(origin, destination) {
    if (!origin || !destination) return false;
    if (origin.length < 2 || destination.length < 2) return false;
    if (origin.toLowerCase() === destination.toLowerCase()) return false;
    
    // Filter out common false positives
    const invalidTerms = ['from', 'to', 'the', 'and', 'or', 'for', 'with', 'booking', 'total'];
    if (invalidTerms.includes(origin.toLowerCase()) || 
        invalidTerms.includes(destination.toLowerCase())) {
      return false;
    }
    
    return true;
  }

  /**
   * Get airport code from city name
   */
  getAirportCode(cityName) {
    if (!cityName) return null;
    
    // If already a code
    if (/^[A-Z]{3}$/.test(cityName)) {
      return cityName;
    }
    
    const nameLower = cityName.toLowerCase();
    
    // Search in airports
    for (const [code, city] of Object.entries(this.airports)) {
      if (city.toLowerCase().includes(nameLower) || 
          nameLower.includes(city.toLowerCase())) {
        return code;
      }
    }
    
    return null;
  }

  /**
   * Validate flight number format
   */
  isValidFlightNumber(flightNum) {
    if (!flightNum) return false;
    
    // Standard format: XX-1234 or XX1234
    const cleaned = flightNum.replace(/[\s-]/g, '');
    
    // Must start with 2 letters (or letter+number like 6E)
    const match = cleaned.match(/^([A-Z0-9]{2})(\d{1,4})$/i);
    if (!match) return false;
    
    const airlineCode = match[1].toUpperCase();
    const flightNumber = parseInt(match[2]);
    
    // Validate airline code exists
    if (!this.airlines[airlineCode]) {
      // Allow if it looks like a valid code pattern
      if (!/^[A-Z0-9]{2}$/.test(airlineCode)) return false;
    }
    
    // Flight numbers are usually between 1-9999
    if (flightNumber < 1 || flightNumber > 9999) return false;
    
    return true;
  }

  /**
   * Extract price value with currency detection
   */
  extractPriceValue(priceStr) {
    if (!priceStr) return null;
    
    // Remove currency symbols and extract number
    const value = priceStr.replace(/[₹$€£]/g, '')
                          .replace(/[^0-9.,]/g, ' ')
                          .trim()
                          .split(/\s+/)[0];
    
    if (value) {
      // Handle different number formats (1,000.00 vs 1.000,00)
      const cleaned = value.replace(/,/g, '');
      return cleaned;
    }
    
    return null;
  }

  /**
   * Detect currency from text
   */
  detectCurrency(text) {
    if (/₹|Rs\.?|INR/i.test(text)) return 'INR';
    if (/\$|USD/i.test(text)) return 'USD';
    if (/€|EUR/i.test(text)) return 'EUR';
    if (/£|GBP/i.test(text)) return 'GBP';
    if (/AED|Dhs?/i.test(text)) return 'AED';
    if (/SGD|S\$/i.test(text)) return 'SGD';
    if (/THB|฿/i.test(text)) return 'THB';
    if (/MYR|RM/i.test(text)) return 'MYR';
    if (/JPY|¥/i.test(text)) return 'JPY';
    return 'INR'; // Default
  }

  /**
   * Calculate nights between dates
   */
  calculateNights(checkIn, checkOut) {
    try {
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      const diffTime = Math.abs(outDate - inDate);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      return 0;
    }
  }

  /**
   * Remove duplicate routes
   */
  deduplicateRoutes(routes) {
    const seen = new Set();
    return routes.filter(route => {
      const key = `${route.origin}-${route.destination}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Parse multiple emails
   */
  parseMultipleEmails(emails) {
    const bookings = {
      flights: [],
      hotels: [],
      trains: [],
      buses: [],
      cabs: [],
      rentals: [],
      events: [],
      unparsed: []
    };

    const stats = {
      total: emails.length,
      parsed: 0,
      unparsed: 0,
      byType: {}
    };

    emails.forEach(email => {
      try {
        const parsed = this.parseEmail(email);
        
        if (parsed) {
          const category = parsed.type + 's';
          if (bookings[category]) {
            bookings[category].push(parsed);
            stats.parsed++;
            stats.byType[parsed.type] = (stats.byType[parsed.type] || 0) + 1;
          }
        } else {
          bookings.unparsed.push({
            id: email.id,
            subject: email.subject,
            from: email.from,
            date: email.date
          });
          stats.unparsed++;
        }
      } catch (error) {
        bookings.unparsed.push({
          id: email.id,
          subject: email.subject,
          from: email.from,
          date: email.date,
          error: error.message
        });
        stats.unparsed++;
      }
    });

    return { bookings, stats };
  }

  /**
   * Get summary of parsed bookings
   */
  getSummary(result) {
    const { bookings, stats } = result;
    
    return {
      totalEmails: stats.total,
      successfullyParsed: stats.parsed,
      parseRate: `${Math.round((stats.parsed / stats.total) * 100)}%`,
      byCategory: {
        flights: bookings.flights.length,
        hotels: bookings.hotels.length,
        trains: bookings.trains.length,
        buses: bookings.buses.length,
        cabs: bookings.cabs.length,
        rentals: bookings.rentals.length,
        events: bookings.events.length
      },
      averageConfidence: this.calculateAverageConfidence(bookings),
      unparsedCount: bookings.unparsed.length
    };
  }

  /**
   * Calculate average confidence across all parsed bookings
   */
  calculateAverageConfidence(bookings) {
    const allParsed = [
      ...bookings.flights,
      ...bookings.hotels,
      ...bookings.trains,
      ...bookings.buses,
      ...bookings.cabs,
      ...bookings.rentals,
      ...bookings.events
    ];
    
    if (allParsed.length === 0) return 0;
    
    const totalConfidence = allParsed.reduce((sum, b) => sum + (b.confidence || 0), 0);
    return Math.round(totalConfidence / allParsed.length);
  }
}

module.exports = new BookingParser();