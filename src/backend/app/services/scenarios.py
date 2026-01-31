"""Scenario definitions for immersive language learning."""

from typing import Literal

from pydantic import BaseModel


class Scenario(BaseModel):
    """A roleplay scenario for immersive German practice."""

    id: str
    title: str
    title_de: str
    description: str
    description_de: str
    target_role: str
    difficulty: Literal["Easy", "Medium", "Hard"]
    suggested_level: Literal["A1", "A2", "B1", "B2", "C1", "C2"]
    topics: list[str]
    icon: str = "📝"


SCENARIOS: dict[str, Scenario] = {
    "cafe-order": Scenario(
        id="cafe-order",
        title="Ordering Coffee",
        title_de="Kaffee bestellen",
        description="Order a drink and a snack at a Berlin cafe.",
        description_de="Bestellen Sie ein Getraenk und einen Snack in einem Berliner Cafe.",
        target_role="Barista",
        difficulty="Easy",
        suggested_level="A1",
        topics=["Food & Drink", "Polite Requests", "Numbers (Price)"],
        icon="☕",
    ),
    "asking-directions": Scenario(
        id="asking-directions",
        title="Asking for Directions",
        title_de="Nach dem Weg fragen",
        description="Ask a stranger how to get to the nearest subway station.",
        description_de="Fragen Sie einen Fremden nach dem Weg zur naechsten U-Bahn-Station.",
        target_role="Passerby",
        difficulty="Easy",
        suggested_level="A1",
        topics=["Directions", "Places in City", "Prepositions"],
        icon="🗺️",
    ),
    "shopping-clothes": Scenario(
        id="shopping-clothes",
        title="Shopping for Clothes",
        title_de="Kleidung kaufen",
        description="Ask for a different size or color and check the price.",
        description_de=(
            "Fragen Sie nach einer anderen Groesse oder Farbe "
            "und erkundigen Sie sich nach dem Preis."
        ),
        target_role="Shop Assistant",
        difficulty="Easy",
        suggested_level="A2",
        topics=["Clothing", "Colors", "Sizes", "Shopping"],
        icon="👕",
    ),
    "restaurant-dinner": Scenario(
        id="restaurant-dinner",
        title="Dinner at a Restaurant",
        title_de="Abendessen im Restaurant",
        description="Make a reservation, order a full meal, and ask for the bill.",
        description_de=(
            "Reservieren Sie einen Tisch, bestellen Sie ein Menue und fragen Sie nach der Rechnung."
        ),
        target_role="Waiter",
        difficulty="Medium",
        suggested_level="A2",
        topics=["Food", "Reservations", "Complaints", "Payment"],
        icon="🍽️",
    ),
    "train-ticket": Scenario(
        id="train-ticket",
        title="Buying a Train Ticket",
        title_de="Zugticket kaufen",
        description="Buy a ticket to Munich, asking about schedules and transfers.",
        description_de=(
            "Kaufen Sie ein Ticket nach Muenchen und fragen Sie "
            "nach Fahrplaenen und Umsteigemoglichkeiten."
        ),
        target_role="Ticket Agent",
        difficulty="Medium",
        suggested_level="B1",
        topics=["Travel", "Time", "Schedules", "Public Transport"],
        icon="🚆",
    ),
    "doctor-visit": Scenario(
        id="doctor-visit",
        title="At the Doctor",
        title_de="Beim Arzt",
        description="Describe your symptoms and make an appointment.",
        description_de="Beschreiben Sie Ihre Symptome und vereinbaren Sie einen Termin.",
        target_role="Receptionist",
        difficulty="Medium",
        suggested_level="B1",
        topics=["Health", "Body Parts", "Symptoms", "Appointments"],
        icon="👨‍⚕️",
    ),
    "apartment-hunting": Scenario(
        id="apartment-hunting",
        title="Renting an Apartment",
        title_de="Wohnungssuche",
        description="Call a landlord to ask about a listing and schedule a viewing.",
        description_de=(
            "Rufen Sie einen Vermieter an, um sich nach einer Anzeige "
            "zu erkundigen und einen Besichtigungstermin zu vereinbaren."
        ),
        target_role="Landlord",
        difficulty="Hard",
        suggested_level="B2",
        topics=["Housing", "Furniture", "Contracts", "Negotiation"],
        icon="🏠",
    ),
    "job-interview": Scenario(
        id="job-interview",
        title="Job Interview",
        title_de="Vorstellungsgespraech",
        description="Answer questions about your experience and strengths.",
        description_de="Beantworten Sie Fragen zu Ihrer Erfahrung und Ihren Staerken.",
        target_role="Interviewer",
        difficulty="Hard",
        suggested_level="B2",
        topics=["Work", "Skills", "Professional History", "Formal Language"],
        icon="💼",
    ),
    "university-registration": Scenario(
        id="university-registration",
        title="University Registration",
        title_de="Immatrikulation",
        description="Discuss enrollment requirements and missing documents.",
        description_de=(
            "Besprechen Sie die Immatrikulationsvoraussetzungen und fehlende Unterlagen."
        ),
        target_role="University Administrator",
        difficulty="Hard",
        suggested_level="C1",
        topics=["Education", "Bureaucracy", "Documents", "Formal Requests"],
        icon="🎓",
    ),
    "customer-service": Scenario(
        id="customer-service",
        title="Customer Service Complaint",
        title_de="Kundenservice-Beschwerde",
        description="Complain about a broken internet connection and demand a refund.",
        description_de=(
            "Beschweren Sie sich ueber eine defekte Internetverbindung "
            "und fordern Sie eine Rueckerstattung."
        ),
        target_role="Service Agent",
        difficulty="Hard",
        suggested_level="C1",
        topics=["Technology", "Complaints", "Negotiation", "Problem Solving"],
        icon="📞",
    ),
    "supermarket-checkout": Scenario(
        id="supermarket-checkout",
        title="At the Supermarket",
        title_de="Im Supermarkt",
        description="Buy groceries and ask where to find items.",
        description_de="Kaufen Sie Lebensmittel ein und fragen Sie, wo Sie Produkte finden.",
        target_role="Cashier",
        difficulty="Easy",
        suggested_level="A1",
        topics=["Food", "Numbers", "Basic Questions"],
        icon="🛒",
    ),
    "hotel-checkin": Scenario(
        id="hotel-checkin",
        title="Hotel Check-In",
        title_de="Hotel-Einchecken",
        description="Check into a hotel and ask about breakfast times and WiFi.",
        description_de="Checken Sie im Hotel ein und fragen Sie nach Fruehstueckszeiten und WLAN.",
        target_role="Hotel Receptionist",
        difficulty="Easy",
        suggested_level="A2",
        topics=["Travel", "Time", "Services", "Polite Requests"],
        icon="🏨",
    ),
    "bank-account": Scenario(
        id="bank-account",
        title="Opening a Bank Account",
        title_de="Bankkonto eroeffnen",
        description="Open a checking account and ask about fees and online banking.",
        description_de=(
            "Eroeffnen Sie ein Girokonto und fragen Sie nach Gebuehren und Online-Banking."
        ),
        target_role="Bank Clerk",
        difficulty="Medium",
        suggested_level="B1",
        topics=["Banking", "Documents", "Services", "Formal Language"],
        icon="🏦",
    ),
    "car-repair": Scenario(
        id="car-repair",
        title="At the Mechanic",
        title_de="In der Autowerkstatt",
        description="Explain car problems and discuss repair options and costs.",
        description_de=(
            "Erklaeren Sie Autoprobleme und besprechen Sie Reparaturoptionen und Kosten."
        ),
        target_role="Mechanic",
        difficulty="Medium",
        suggested_level="B2",
        topics=["Vehicles", "Technical Terms", "Negotiation", "Problem Solving"],
        icon="🔧",
    ),
    "business-meeting": Scenario(
        id="business-meeting",
        title="Business Negotiation",
        title_de="Geschaeftsverhandlung",
        description="Negotiate terms of a partnership agreement with a German company.",
        description_de=(
            "Verhandeln Sie die Bedingungen einer Partnerschaftsvereinbarung "
            "mit einem deutschen Unternehmen."
        ),
        target_role="Business Partner",
        difficulty="Hard",
        suggested_level="C1",
        topics=["Business", "Contracts", "Negotiation", "Professional Etiquette"],
        icon="🤝",
    ),
    "political-debate": Scenario(
        id="political-debate",
        title="Political Discussion",
        title_de="Politische Diskussion",
        description="Debate current political issues and express nuanced opinions.",
        description_de=(
            "Diskutieren Sie aktuelle politische Themen "
            "und druecken Sie differenzierte Meinungen aus."
        ),
        target_role="Political Analyst",
        difficulty="Hard",
        suggested_level="C2",
        topics=["Politics", "Current Events", "Argumentation", "Complex Opinions"],
        icon="🗣️",
    ),
    "legal-consultation": Scenario(
        id="legal-consultation",
        title="Legal Consultation",
        title_de="Rechtsberatung",
        description="Discuss a rental dispute with a lawyer and understand your rights.",
        description_de=(
            "Besprechen Sie einen Mietstreit mit einem Anwalt und verstehen Sie Ihre Rechte."
        ),
        target_role="Lawyer",
        difficulty="Hard",
        suggested_level="C2",
        topics=["Law", "Rights", "Formal Language", "Technical Vocabulary"],
        icon="⚖️",
    ),
    "literary-discussion": Scenario(
        id="literary-discussion",
        title="Literary Discussion",
        title_de="Literarische Diskussion",
        description="Discuss German literature and analyze themes and writing styles.",
        description_de=(
            "Diskutieren Sie deutsche Literatur und analysieren Sie Themen und Schreibstile."
        ),
        target_role="Literature Professor",
        difficulty="Hard",
        suggested_level="C2",
        topics=["Literature", "Culture", "Analysis", "Advanced Vocabulary"],
        icon="📚",
    ),
}


def get_scenario(scenario_id: str) -> Scenario | None:
    """Get a scenario by its ID."""
    return SCENARIOS.get(scenario_id)
