import { newId, nowIso } from "@/types/common";
import type { Event } from "@/types/event";
import type { Task, TaskCategory, TaskStatus } from "@/types/task";
import type { BudgetItem } from "@/types/budget";
import type { Vendor, VendorStatus } from "@/types/vendor";
import type { Idea, IdeaType } from "@/types/idea";
import type { StyleProfile } from "@/types/styleProfile";
import { addDays, toIsoDate, today } from "./dates";

const TODAY = toIsoDate(today());

function mkTask(
  eventId: string,
  title: string,
  due: string,
  status: TaskStatus,
  category: TaskCategory,
  owner: string,
  notes = ""
): Task {
  return {
    id: newId("task"),
    eventId,
    title,
    due,
    status,
    category,
    owner,
    notes,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

function mkBudget(
  eventId: string,
  category: string,
  planned: number,
  actual: number
): BudgetItem {
  return { id: newId("budget"), eventId, category, planned, actual };
}

function mkVendor(
  eventId: string,
  category: string,
  name: string,
  contact: string,
  status: VendorStatus,
  quote: number | null,
  notes = ""
): Vendor {
  return { id: newId("vendor"), eventId, category, name, contact, status, quote, notes };
}

function mkIdea(
  eventId: string,
  type: IdeaType,
  title: string,
  body: string,
  pinned = false
): Idea {
  return { id: newId("idea"), eventId, type, title, body, pinned, createdAt: nowIso() };
}

function buildWedding(): Event {
  const id = newId("event");
  const date = addDays(TODAY, 120); // ~4 months out
  const d = (daysBeforeWedding: number) => addDays(date, -daysBeforeWedding);

  const tasks: Task[] = [
    mkTask(id, "Finalize venue for wedding ceremony", d(110), "done", "venue", "Aarav"),
    mkTask(id, "Book venue for reception", d(108), "done", "venue", "Aarav"),
    mkTask(id, "Pay final balance to venue", d(5), "todo", "venue", "Aarav"),
    mkTask(id, "Shortlist and finalize caterer", d(100), "done", "catering", "Meera"),
    mkTask(id, "Confirm final menu with caterer", d(20), "todo", "catering", "Meera"),
    mkTask(id, "Confirm final headcount with caterer", addDays(TODAY, -4), "doing", "catering", "Meera", "Overdue — follow up today"),
    mkTask(id, "Finalize reception menu and seating", d(15), "todo", "catering", "Meera"),
    mkTask(id, "Book photographer & videographer", d(95), "done", "photography", "Aarav"),
    mkTask(id, "Share shot list with photographer", d(10), "todo", "photography", "Meera"),
    mkTask(id, "Order wedding invitations", d(90), "done", "invitations", "Meera's mother"),
    mkTask(id, "Send invitations to guests", d(60), "doing", "invitations", "Meera"),
    mkTask(id, "Finalize guest list", d(85), "done", "guests", "Both families"),
    mkTask(id, "Book mehendi artist", d(80), "done", "mehendi", "Meera"),
    mkTask(id, "Finalize mehendi design reference", d(15), "todo", "mehendi", "Meera"),
    mkTask(id, "Follow up with mehendi artist on design samples", addDays(TODAY, -2), "todo", "mehendi", "Meera", "Overdue — artist hasn't replied"),
    mkTask(id, "Book haldi decor and props", d(70), "doing", "haldi", "Meera's mother"),
    mkTask(id, "Confirm haldi ceremony timing with priest", d(5), "todo", "haldi", "Aarav's father"),
    mkTask(id, "Finalize sangeet choreography", d(30), "doing", "sangeet", "Meera"),
    mkTask(id, "Book DJ/sound for sangeet", d(75), "done", "music-dj", "Aarav"),
    mkTask(id, "Finalize sangeet performance list", d(12), "todo", "sangeet", "Both families"),
    mkTask(id, "Book bridal makeup artist", d(85), "done", "attire", "Meera"),
    mkTask(id, "Final trial for bridal makeup", d(7), "todo", "attire", "Meera"),
    mkTask(id, "Finalize groom's sherwani fitting", d(25), "doing", "attire", "Aarav"),
    mkTask(id, "Finalize wedding day decor (mandap)", d(45), "doing", "decor", "Aarav's mother"),
    mkTask(id, "Confirm floral order for mandap", d(10), "todo", "decor", "Aarav's mother"),
    mkTask(id, "Book reception venue decor", d(25), "todo", "decor", "Meera's mother"),
    mkTask(id, "Book transport for baraat", d(40), "done", "logistics", "Aarav"),
    mkTask(id, "Arrange accommodation for outstation guests", d(35), "doing", "logistics", "Aarav's father"),
    mkTask(id, "Confirm priest for pheras", d(30), "done", "logistics", "Aarav's father"),
    mkTask(id, "Finalize wedding day timeline (pheras)", d(20), "todo", "logistics", "Aarav & Meera"),
    mkTask(id, "Confirm security & valet for wedding day", d(10), "todo", "logistics", "Aarav"),
    mkTask(id, "Order wedding favors / return gifts", d(20), "todo", "other", "Meera"),
    mkTask(id, "Pack wedding day emergency kit", d(2), "todo", "other", "Meera's sister"),
  ];

  const budgetItems: BudgetItem[] = [
    mkBudget(id, "Venue", 450000, 450000),
    mkBudget(id, "Catering", 600000, 320000),
    mkBudget(id, "Decor", 250000, 295000), // over budget by 45,000
    mkBudget(id, "Photography", 150000, 150000),
    mkBudget(id, "Attire", 120000, 80000),
    mkBudget(id, "Invitations", 60000, 55000),
    mkBudget(id, "Music & Entertainment", 170000, 90000),
  ];

  const vendors: Vendor[] = [
    mkVendor(id, "Venue", "The Grand Palms Banquet", "+91 98765 43210", "booked", 450000, "Confirmed hall + lawn combo."),
    mkVendor(id, "Catering", "Royal Feast Caterers", "+91 98765 11122", "booked", 600000, "Veg + non-veg live counters."),
    mkVendor(id, "Decor", "Petal & Thread Decor", "+91 98765 22233", "booked", 295000, "Floral mandap, went over original quote."),
    mkVendor(id, "Photography & Video", "Framed Moments Studio", "+91 98765 33344", "booked", 150000, "2 photographers + drone."),
    mkVendor(id, "Makeup Artist", "Glow by Kavya", "+91 98765 44455", "booked", 80000, "Trial done, loved it."),
    mkVendor(id, "Mehendi Artist", "Henna Haat", "+91 98765 55566", "quoted", 35000, "Waiting on design confirmation."),
    mkVendor(id, "Music / DJ", "Beat Street Entertainment", "+91 98765 66677", "booked", 90000, "Sangeet night + baraat."),
    mkVendor(id, "Invitations", "Paper Tales Printers", "+91 98765 77788", "quoted", 55000, "Premium card, gold foil."),
    mkVendor(id, "Transport", "Shaan Car Rentals", "+91 98765 88899", "contacted", null, "Asked for a quote for baraat cars — no response yet."),
    mkVendor(id, "Priest / Pandit", "Pandit Sharma Ji", "+91 98765 99900", "shortlisted", null, "Recommended by Aarav's family."),
  ];

  const ideas: Idea[] = [
    mkIdea(
      id,
      "theme",
      "Ivory & gold mandap with marigold accents",
      "Keep the mandap palette ivory and gold with pops of marigold orange. Ties the mehendi, haldi and wedding day looks together without repeating the same decor twice.",
      true
    ),
    mkIdea(
      id,
      "menu",
      "Live chaat counter for sangeet night",
      "A live chaat/pani puri counter for the sangeet gets guests moving around instead of just sitting — works well for a 250-guest crowd and keeps the night informal.",
      false
    ),
  ];

  return {
    id,
    name: "Aarav & Meera Wedding",
    type: "wedding",
    date,
    city: "Jaipur",
    guestCount: 250,
    totalBudget: 1800000,
    notes: "Multi-day wedding: mehendi, haldi, sangeet, pheras, reception. Both families involved in planning.",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    tasks,
    budgetItems,
    vendors,
    ideas,
  };
}

function buildBirthday(): Event {
  const id = newId("event");
  const date = addDays(TODAY, 45);
  const d = (daysBefore: number) => addDays(date, -daysBefore);

  const tasks: Task[] = [
    mkTask(id, "Book venue (terrace lounge)", d(35), "done", "venue", "Riya"),
    mkTask(id, "Order birthday cake", d(5), "todo", "other", "Riya"),
    mkTask(id, "Send invites to friends & family", d(25), "doing", "invitations", "Riya"),
    mkTask(id, "Book photographer for the evening", d(20), "todo", "photography", "Riya"),
    mkTask(id, "Order decorations & balloon setup", d(15), "todo", "decor", "Riya's sister"),
    mkTask(id, "Finalize playlist / music", d(10), "todo", "music-dj", "Riya"),
    mkTask(id, "Order return gifts", d(12), "todo", "other", "Riya's sister"),
    mkTask(id, "Confirm catering & snacks count", d(8), "doing", "catering", "Riya"),
  ];

  const budgetItems: BudgetItem[] = [
    mkBudget(id, "Venue", 15000, 15000),
    mkBudget(id, "Catering", 20000, 12000),
    mkBudget(id, "Decor", 10000, 8000),
    mkBudget(id, "Cake", 5000, 0),
    mkBudget(id, "Photography", 10000, 0),
  ];

  const vendors: Vendor[] = [
    mkVendor(id, "Venue", "Sunset Terrace Lounge", "+91 90000 11111", "booked", 15000),
    mkVendor(id, "Catering", "Spice Route Catering", "+91 90000 22222", "booked", 20000, "Finger food + mocktails package."),
    mkVendor(id, "Decor", "Balloon Bliss", "+91 90000 33333", "quoted", 9500),
    mkVendor(id, "Photography", "Candid Clicks", "+91 90000 44444", "shortlisted", null, "Need to check availability."),
  ];

  return {
    id,
    name: "Riya's 25th Birthday",
    type: "birthday",
    date,
    city: "Pune",
    guestCount: 40,
    totalBudget: 60000,
    notes: "Casual terrace evening with close friends and family.",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    tasks,
    budgetItems,
    vendors,
    ideas: [],
  };
}

function buildCommunity(): Event {
  const id = newId("event");
  const date = addDays(TODAY, 25);
  const d = (daysBefore: number) => addDays(date, -daysBefore);

  const tasks: Task[] = [
    mkTask(id, "Get society committee NOC for the event", d(22), "done", "permissions", "Secretary"),
    mkTask(id, "Book open ground / clubhouse lawn", d(20), "done", "venue", "Secretary"),
    mkTask(id, "Finalize DJ & sound system vendor", d(15), "doing", "music-dj", "Events Committee"),
    mkTask(id, "Arrange decor & lighting", d(10), "todo", "decor", "Events Committee"),
    mkTask(id, "Confirm food stall vendors", d(12), "doing", "catering", "Events Committee"),
    mkTask(id, "Arrange security personnel for the ground", d(8), "todo", "security", "Secretary"),
    mkTask(id, "Recruit volunteers for entry & registration", d(14), "doing", "volunteers", "Events Committee"),
    mkTask(id, "Finalize sponsor agreements", d(18), "todo", "sponsors", "Treasurer"),
    mkTask(id, "Print and distribute entry passes", d(6), "todo", "logistics", "Events Committee"),
    mkTask(id, "Arrange generator backup", d(5), "todo", "logistics", "Secretary"),
    mkTask(id, "Set up registration desk & collect entry fees", d(2), "todo", "volunteers", "Events Committee"),
    mkTask(id, "Book garba/dandiya instructor for opening", d(16), "done", "other", "Events Committee"),
  ];

  const budgetItems: BudgetItem[] = [
    mkBudget(id, "Ground & Permissions", 20000, 20000),
    mkBudget(id, "Decor & Lighting", 60000, 55000),
    mkBudget(id, "Sound & DJ", 70000, 70000),
    mkBudget(id, "Security", 30000, 15000),
    mkBudget(id, "Catering / Food Stalls", 50000, 10000),
    mkBudget(id, "Printing & Passes", 20000, 5000),
  ];

  const vendors: Vendor[] = [
    mkVendor(id, "Sound & DJ", "Beat Street Entertainment", "+91 98765 66677", "booked", 70000, "Same vendor as a referral — good rates."),
    mkVendor(id, "Decor & Lighting", "Festive Glow Decor", "+91 90000 55555", "booked", 55000, "String lights + stage backdrop."),
    mkVendor(id, "Security", "SafeGuard Security Services", "+91 90000 66666", "quoted", 18000),
    mkVendor(id, "Catering / Food Stalls", "Mumbai Chaat Co.", "+91 90000 77777", "booked", 0, "Stall vendor pays society a flat fee, not a cost to us."),
    mkVendor(id, "Sponsors", "Sunrise Housing Finance (Sponsor)", "+91 90000 88888", "booked", 0, "Sponsoring Rs 50,000 cash + banner placement at entrance."),
  ];

  const ideas: Idea[] = [
    mkIdea(
      id,
      "theme",
      "Rajasthani folk corner near the entrance",
      "A small folk-art photo corner (puppets, mirror work backdrop) near the entry gives people a spot to take photos while they wait to register — keeps the queue from feeling dead time.",
      false
    ),
  ];

  return {
    id,
    name: "Society Navratri Garba Night",
    type: "community",
    date,
    city: "Ahmedabad",
    guestCount: 400,
    totalBudget: 250000,
    notes: "Open-to-all-residents Garba night. Needs society NOC, sponsor coordination and volunteer rostering.",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    tasks,
    budgetItems,
    vendors,
    ideas,
  };
}

export function buildDemoEvents(): Event[] {
  return [buildWedding(), buildBirthday(), buildCommunity()];
}

export function buildDemoStyleProfile(): StyleProfile {
  return {
    tone:
      "Warm, direct and a little playful — like a friend helping plan the event, never a corporate email. Short sentences. No jargon.",
    vocabulary: ["let's", "honestly", "quick heads up", "no stress", "sorted", "ping me"],
    avoidPhrases: [
      "Dear Sir/Madam",
      "We regret to inform",
      "As per our previous conversation",
      "kindly revert",
      "circle back",
      "synergy",
      "leverage",
    ],
    samples: [
      "Hey! Just locked in the caterer — tasting session is Friday 5pm, bring your mom along if she's free.",
      "Quick one: decor budget's creeping up again, we're about 18% over on flowers. Want to trim the mandap order or just eat the cost?",
    ],
    formatRules: {
      linkedin: "Keep it short, no hashtag spam, one clear takeaway, sound like a real person, not a brand.",
      invitation: "Warm and personal, mention both families where relevant, keep RSVP info clear and near the end.",
      vendorMessage: "Polite but to the point — what we need, by when, and our budget range. No fluff.",
      whatsapp: "Casual, short lines, emojis okay sparingly, always end with a clear question or ask.",
    },
  };
}
