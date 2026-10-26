import type { EventType } from "@/types/event";
import type { TaskCategory, TaskStatus } from "@/types/task";
import type { VendorStatus } from "@/types/vendor";
import type { IdeaType } from "@/types/idea";

export const IDEA_TYPE_LABELS: Record<IdeaType, string> = {
  theme: "Theme",
  decor: "Decor",
  menu: "Menu",
  activities: "Activities",
  invitation: "Invitation wording",
  "return-gifts": "Return gifts",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  doing: "Doing",
  done: "Done",
};

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  venue: "Venue",
  catering: "Catering",
  decor: "Decor",
  photography: "Photography",
  attire: "Attire",
  invitations: "Invitations",
  mehendi: "Mehendi",
  haldi: "Haldi",
  sangeet: "Sangeet",
  "music-dj": "Music / DJ",
  logistics: "Logistics",
  guests: "Guests",
  permissions: "Permissions",
  sponsors: "Sponsors",
  volunteers: "Volunteers",
  security: "Security",
  other: "Other",
};

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  shortlisted: "Shortlisted",
  contacted: "Contacted",
  quoted: "Quoted",
  booked: "Booked",
};

export const VENDOR_STATUS_ORDER: VendorStatus[] = [
  "shortlisted",
  "contacted",
  "quoted",
  "booked",
];

/** Suggested vendor categories per event type (user can still type a custom category). */
export const VENDOR_CATEGORIES_BY_EVENT_TYPE: Record<EventType, string[]> = {
  wedding: [
    "Venue",
    "Catering",
    "Decor",
    "Photography & Video",
    "Makeup Artist",
    "Mehendi Artist",
    "Music / DJ",
    "Invitations",
    "Transport",
    "Priest / Pandit",
  ],
  birthday: [
    "Venue",
    "Catering",
    "Decor",
    "Photography",
    "Cake",
    "Entertainment",
    "Invitations",
    "Return Gifts",
  ],
  community: [
    "Venue / Ground Permission",
    "Catering / Food Stalls",
    "Decor & Lighting",
    "Sound & DJ",
    "Security",
    "Sponsors",
    "Volunteers",
    "Photography",
    "Permissions & Licensing",
  ],
};

/** Baseline checklist of questions to ask a vendor, keyed by a lowercase category match. */
export const VENDOR_QUESTION_CHECKLISTS: Record<string, string[]> = {
  venue: [
    "Is the date available and can it be held with a token advance?",
    "What is the total capacity and layout flexibility?",
    "Is outside catering/decor allowed, or is it in-house only?",
    "What are the parking and guest access arrangements?",
    "Is there a backup power/generator for outages?",
    "What is the cancellation and refund policy?",
  ],
  catering: [
    "What is the per-plate cost for veg / non-veg / Jain food?",
    "Can we do a tasting session before confirming the menu?",
    "What is included (service staff, crockery, live counters)?",
    "How do you handle a last-minute change in guest count?",
    "What are the timelines for final headcount confirmation?",
  ],
  decor: [
    "Can we share reference photos and get a mock-up/quote?",
    "What is included in the quote (flowers, lighting, mandap, backdrop)?",
    "How many days before the event will setup happen?",
    "Do you handle teardown, and is it included in the cost?",
  ],
  photography: [
    "What packages do you offer (candid, traditional, drone, video)?",
    "How many photographers/videographers will be present?",
    "What is the delivery timeline for edited photos and albums?",
    "Do you provide a same-day highlight reel?",
  ],
  "makeup artist": [
    "What is included (trial, hairstyling, draping)?",
    "Do you travel to the venue, and is travel charged separately?",
    "What products/brands do you use (any allergy concerns)?",
    "How many looks are included for multi-event functions?",
  ],
  "mehendi artist": [
    "What is the per-hand / per-arm pricing?",
    "How many artists will be available for the guest count?",
    "Can you share a design portfolio beforehand?",
    "How long will a full bridal mehendi session take?",
  ],
  "music / dj": [
    "What sound equipment and lighting is included?",
    "Can we share a playlist or do you take live requests?",
    "What is the setup and sound-check timeline?",
    "Do you have backup equipment in case of failure?",
  ],
  invitations: [
    "What are the material and printing options?",
    "What is the minimum order quantity and lead time?",
    "Do you offer digital/video invitation options too?",
  ],
  transport: [
    "What vehicles are available and what is the capacity?",
    "Is fuel and driver allowance included in the quote?",
    "What is the cancellation policy for a booked slot?",
  ],
  security: [
    "How many personnel will be deployed and for what hours?",
    "Do you coordinate with local police for large gatherings?",
    "What is your protocol for medical/fire emergencies?",
  ],
  sponsors: [
    "What sponsorship tiers and benefits are being offered?",
    "What branding placement and announcement slots are included?",
    "What is the payment and invoicing process?",
  ],
  default: [
    "What is included in the quoted price, and what costs extra?",
    "What is the advance payment and cancellation policy?",
    "Can you share references or past work for this type of event?",
    "What is the timeline for confirming details before the event?",
  ],
};

export function getVendorChecklist(category: string): string[] {
  const key = category.trim().toLowerCase();
  return VENDOR_QUESTION_CHECKLISTS[key] ?? VENDOR_QUESTION_CHECKLISTS.default;
}

/** Chart palette: restrained, desaturated, no neon. */
export const CHART_COLORS = [
  "#7B79E0",
  "#5FA777",
  "#D2A74C",
  "#6FA8C7",
  "#B07CC6",
  "#C78A5F",
  "#8A8A90",
  "#E0756B",
];
