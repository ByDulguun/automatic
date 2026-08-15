import type { AnalysisResult } from "@/lib/schema";

export const mockAnalysisResult: AnalysisResult = {
  dataAvailability: {
    website: false,
    facebook: true,
    instagram: true,
    notes: true,
  },
  dataLimitationsNote:
    "This analysis is based only on the public page names/handles and notes supplied. Facebook and Instagram content, follower counts, and post history could not be retrieved automatically — private analytics were not accessed.",
  businessSnapshot: {
    businessName: "ARINGOO JEWELRY",
    industry: "Jewelry / Fashion",
    businessType: "Social media-based online shop",
    whatTheyOffer: "Handmade and curated jewelry pieces sold via social media",
    summary:
      "The business primarily uses social media to showcase products and communicate with customers, with no dedicated website found.",
  },
  topOpportunity: {
    title: "ECOMMERCE WEBSITE",
    whyItMatters:
      "The business appears to rely heavily on social media for product discovery and customer communication. A centralized website could make products easier to browse and improve the path from discovery to purchase.",
    recommendation: [
      "Product catalog",
      "Categories",
      "Product detail pages",
      "Search",
      "Shopping cart",
      "Order system",
      "Payment integration",
    ],
    priority: "HIGH",
    expectedImpact:
      "Better customer experience and a more structured sales process.",
  },
  opportunities: [
    {
      title: "CONTENT STRATEGY",
      priority: "HIGH",
      possibleNeed: "More structured and consistent content.",
      why: "Current public presence suggests an opportunity to diversify content beyond simple product posts.",
      whatWeOffer: [
        "Content strategy",
        "Monthly content plan",
        "Poster concepts",
        "Reel concepts",
        "Scripts",
        "Captions",
      ],
    },
    {
      title: "BRANDING IMPROVEMENT",
      priority: "MEDIUM",
      possibleNeed: "A more consistent visual identity.",
      why: "A cohesive visual identity across channels can increase recognition and perceived quality.",
      whatWeOffer: [
        "Brand direction",
        "Color palette",
        "Typography",
        "Social media templates",
        "Visual guidelines",
      ],
    },
    {
      title: "WEBSITE / PRODUCT CATALOG",
      priority: "HIGH",
      possibleNeed: "A centralized place for customers to explore products.",
      why: "Without a website, customers must browse and order entirely through chat and social posts.",
      whatWeOffer: [
        "Modern website",
        "Product catalog",
        "Product pages",
        "Cart",
        "Ordering system",
        "Payment integration",
      ],
    },
    {
      title: "REELS & VIDEO CONTENT",
      priority: "MEDIUM",
      possibleNeed: "More engaging short-form content.",
      why: "Short-form video tends to outperform static posts for reach and discovery on these platforms.",
      whatWeOffer: [
        "Reel concepts",
        "Scripts",
        "Video editing",
        "Product showcase videos",
        "Promotional videos",
      ],
    },
  ],
  bestOffer: {
    name: "DIGITAL SHOP UPGRADE",
    includes: [
      "Product catalog website",
      "Content strategy",
      "10 poster concepts",
      "10 reel ideas",
      "Visual direction",
    ],
    reason: "This combination addresses the business's biggest opportunities.",
    complexity: "Medium",
  },
  approach: {
    whatToLeadWith:
      "Start by talking about how customers currently discover and browse products. Do not immediately sell a website. Instead, explain the potential benefit of creating a more organized product discovery and ordering experience.",
    openingMessage:
      "Сайн байна уу 😊 Танай бүтээгдэхүүнүүд болон page-ийн ерөнхий төрхийг хараад онлайн захиалга болон бүтээгдэхүүнээ хэрэглэгчдэд илүү ойлгомжтой харуулах тал дээр хөгжүүлэх боломж байна гэж бодлоо.\n\nБид website болон social media content чиглэлээр ажилладаг бөгөөд танай бизнест тохирсон хэдэн санаа гаргасан байгаа.\n\nХэрэв сонирхож байвал богинохон санал болон санаануудаа явуулж болох уу? 🙌",
  },
  insufficientData: false,
};
