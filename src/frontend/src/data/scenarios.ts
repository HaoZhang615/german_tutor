import type { GermanLevel } from '../store/types';

export interface Scenario {
  id: string;
  title: string;
  titleDe: string;
  description: string;
  descriptionDe: string;
  targetRole: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  suggestedLevel: GermanLevel;
  icon: string;
  topics: string[];
  userId?: string;
  createdAt?: string;
  isPublic?: boolean;
  isCustom?: boolean;
}

export const scenarios: Scenario[] = [
  // A1 - Easy (3 scenarios)
  {
    id: 'cafe-order',
    title: 'Ordering Coffee',
    titleDe: 'Kaffee bestellen',
    description: 'Order a drink and a snack at a Berlin café.',
    descriptionDe: 'Bestellen Sie ein Getränk und einen Snack in einem Berliner Café.',
    targetRole: 'Barista',
    difficulty: 'Easy',
    suggestedLevel: 'A1',
    icon: '☕',
    topics: ['Food & Drink', 'Polite Requests', 'Numbers (Price)'],
  },
  {
    id: 'asking-directions',
    title: 'Asking for Directions',
    titleDe: 'Nach dem Weg fragen',
    description: 'Ask a stranger how to get to the nearest subway station.',
    descriptionDe: 'Fragen Sie einen Fremden nach dem Weg zur nächsten U-Bahn-Station.',
    targetRole: 'Passerby',
    difficulty: 'Easy',
    suggestedLevel: 'A1',
    icon: '🗺️',
    topics: ['Directions', 'Places in City', 'Prepositions'],
  },
  {
    id: 'supermarket-checkout',
    title: 'At the Supermarket',
    titleDe: 'Im Supermarkt',
    description: 'Buy groceries and ask where to find items.',
    descriptionDe: 'Kaufen Sie Lebensmittel ein und fragen Sie, wo Sie Produkte finden.',
    targetRole: 'Cashier',
    difficulty: 'Easy',
    suggestedLevel: 'A1',
    icon: '🛒',
    topics: ['Food', 'Numbers', 'Basic Questions'],
  },

  // A2 - Easy (3 scenarios)
  {
    id: 'shopping-clothes',
    title: 'Shopping for Clothes',
    titleDe: 'Kleidung kaufen',
    description: 'Ask for a different size or color and check the price.',
    descriptionDe: 'Fragen Sie nach einer anderen Größe oder Farbe und erkundigen Sie sich nach dem Preis.',
    targetRole: 'Shop Assistant',
    difficulty: 'Easy',
    suggestedLevel: 'A2',
    icon: '👕',
    topics: ['Clothing', 'Colors', 'Sizes', 'Shopping'],
  },
  {
    id: 'restaurant-dinner',
    title: 'Dinner at a Restaurant',
    titleDe: 'Abendessen im Restaurant',
    description: 'Make a reservation, order a full meal, and ask for the bill.',
    descriptionDe: 'Reservieren Sie einen Tisch, bestellen Sie ein Menü und fragen Sie nach der Rechnung.',
    targetRole: 'Waiter',
    difficulty: 'Easy',
    suggestedLevel: 'A2',
    icon: '🍽️',
    topics: ['Food', 'Reservations', 'Complaints', 'Payment'],
  },
  {
    id: 'hotel-checkin',
    title: 'Hotel Check-In',
    titleDe: 'Hotel-Einchecken',
    description: 'Check into a hotel and ask about breakfast times and WiFi.',
    descriptionDe: 'Checken Sie im Hotel ein und fragen Sie nach Frühstückszeiten und WLAN.',
    targetRole: 'Hotel Receptionist',
    difficulty: 'Easy',
    suggestedLevel: 'A2',
    icon: '🏨',
    topics: ['Travel', 'Time', 'Services', 'Polite Requests'],
  },

  // B1 - Medium (3 scenarios)
  {
    id: 'train-ticket',
    title: 'Buying a Train Ticket',
    titleDe: 'Zugticket kaufen',
    description: 'Buy a ticket to Munich, asking about schedules and transfers.',
    descriptionDe: 'Kaufen Sie ein Ticket nach München und fragen Sie nach Fahrplänen und Umsteigemöglichkeiten.',
    targetRole: 'Ticket Agent',
    difficulty: 'Medium',
    suggestedLevel: 'B1',
    icon: '🚆',
    topics: ['Travel', 'Time', 'Schedules', 'Public Transport'],
  },
  {
    id: 'doctor-visit',
    title: 'At the Doctor',
    titleDe: 'Beim Arzt',
    description: 'Describe your symptoms and make an appointment.',
    descriptionDe: 'Beschreiben Sie Ihre Symptome und vereinbaren Sie einen Termin.',
    targetRole: 'Receptionist',
    difficulty: 'Medium',
    suggestedLevel: 'B1',
    icon: '👨‍⚕️',
    topics: ['Health', 'Body Parts', 'Symptoms', 'Appointments'],
  },
  {
    id: 'bank-account',
    title: 'Opening a Bank Account',
    titleDe: 'Bankkonto eröffnen',
    description: 'Open a checking account and ask about fees and online banking.',
    descriptionDe: 'Eröffnen Sie ein Girokonto und fragen Sie nach Gebühren und Online-Banking.',
    targetRole: 'Bank Clerk',
    difficulty: 'Medium',
    suggestedLevel: 'B1',
    icon: '🏦',
    topics: ['Banking', 'Documents', 'Services', 'Formal Language'],
  },

  // B2 - Medium (3 scenarios)
  {
    id: 'apartment-hunting',
    title: 'Renting an Apartment',
    titleDe: 'Wohnungssuche',
    description: 'Call a landlord to ask about a listing and schedule a viewing.',
    descriptionDe: 'Rufen Sie einen Vermieter an, um sich nach einer Anzeige zu erkundigen und einen Besichtigungstermin zu vereinbaren.',
    targetRole: 'Landlord',
    difficulty: 'Medium',
    suggestedLevel: 'B2',
    icon: '🏠',
    topics: ['Housing', 'Furniture', 'Contracts', 'Negotiation'],
  },
  {
    id: 'job-interview',
    title: 'Job Interview',
    titleDe: 'Vorstellungsgespräch',
    description: 'Answer questions about your experience and strengths.',
    descriptionDe: 'Beantworten Sie Fragen zu Ihrer Erfahrung und Ihren Stärken.',
    targetRole: 'Interviewer',
    difficulty: 'Medium',
    suggestedLevel: 'B2',
    icon: '💼',
    topics: ['Work', 'Skills', 'Professional History', 'Formal Language'],
  },
  {
    id: 'car-repair',
    title: 'At the Mechanic',
    titleDe: 'In der Autowerkstatt',
    description: 'Explain car problems and discuss repair options and costs.',
    descriptionDe: 'Erklären Sie Autoprobleme und besprechen Sie Reparaturoptionen und Kosten.',
    targetRole: 'Mechanic',
    difficulty: 'Medium',
    suggestedLevel: 'B2',
    icon: '🔧',
    topics: ['Vehicles', 'Technical Terms', 'Negotiation', 'Problem Solving'],
  },

  // C1 - Hard (3 scenarios)
  {
    id: 'university-registration',
    title: 'University Registration',
    titleDe: 'Immatrikulation',
    description: 'Discuss enrollment requirements and missing documents.',
    descriptionDe: 'Besprechen Sie die Immatrikulationsvoraussetzungen und fehlende Unterlagen.',
    targetRole: 'University Administrator',
    difficulty: 'Hard',
    suggestedLevel: 'C1',
    icon: '🎓',
    topics: ['Education', 'Bureaucracy', 'Documents', 'Formal Requests'],
  },
  {
    id: 'customer-service',
    title: 'Customer Service Complaint',
    titleDe: 'Kundenservice-Beschwerde',
    description: 'Complain about a broken internet connection and demand a refund.',
    descriptionDe: 'Beschweren Sie sich über eine defekte Internetverbindung und fordern Sie eine Rückerstattung.',
    targetRole: 'Service Agent',
    difficulty: 'Hard',
    suggestedLevel: 'C1',
    icon: '📞',
    topics: ['Technology', 'Complaints', 'Negotiation', 'Problem Solving'],
  },
  {
    id: 'business-meeting',
    title: 'Business Negotiation',
    titleDe: 'Geschäftsverhandlung',
    description: 'Negotiate terms of a partnership agreement with a German company.',
    descriptionDe: 'Verhandeln Sie die Bedingungen einer Partnerschaftsvereinbarung mit einem deutschen Unternehmen.',
    targetRole: 'Business Partner',
    difficulty: 'Hard',
    suggestedLevel: 'C1',
    icon: '🤝',
    topics: ['Business', 'Contracts', 'Negotiation', 'Professional Etiquette'],
  },

  // C2 - Hard (3 scenarios)
  {
    id: 'political-debate',
    title: 'Political Discussion',
    titleDe: 'Politische Diskussion',
    description: 'Debate current political issues and express nuanced opinions.',
    descriptionDe: 'Diskutieren Sie aktuelle politische Themen und drücken Sie differenzierte Meinungen aus.',
    targetRole: 'Political Analyst',
    difficulty: 'Hard',
    suggestedLevel: 'C2',
    icon: '🗣️',
    topics: ['Politics', 'Current Events', 'Argumentation', 'Complex Opinions'],
  },
  {
    id: 'legal-consultation',
    title: 'Legal Consultation',
    titleDe: 'Rechtsberatung',
    description: 'Discuss a rental dispute with a lawyer and understand your rights.',
    descriptionDe: 'Besprechen Sie einen Mietstreit mit einem Anwalt und verstehen Sie Ihre Rechte.',
    targetRole: 'Lawyer',
    difficulty: 'Hard',
    suggestedLevel: 'C2',
    icon: '⚖️',
    topics: ['Law', 'Rights', 'Formal Language', 'Technical Vocabulary'],
  },
  {
    id: 'literary-discussion',
    title: 'Literary Discussion',
    titleDe: 'Literarische Diskussion',
    description: 'Discuss German literature and analyze themes and writing styles.',
    descriptionDe: 'Diskutieren Sie deutsche Literatur und analysieren Sie Themen und Schreibstile.',
    targetRole: 'Literature Professor',
    difficulty: 'Hard',
    suggestedLevel: 'C2',
    icon: '📚',
    topics: ['Literature', 'Culture', 'Analysis', 'Advanced Vocabulary'],
  },
];
