export type SocialPlatform = "facebook" | "instagram";

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  text: string;
  postUrl: string;
  date: string;
}

export const socialPosts: SocialPost[] = [
  {
    id: "1",
    platform: "instagram",
    text: "Another beautiful sunset from Piazzale Michelangelo. Our guests loved this view during yesterday's evening tour!",
    postUrl: "https://www.instagram.com/florencewithlocals/",
    date: "2026-02-14",
  },
  {
    id: "2",
    platform: "facebook",
    text: "Spring is coming to Florence! Our food tours are filling up fast for March and April. Book your spot now!",
    postUrl: "https://www.facebook.com/florencewithlocals",
    date: "2026-02-12",
  },
  {
    id: "3",
    platform: "instagram",
    text: "Behind the scenes at the leather workshop in Santa Croce. A hidden gem our guests always love discovering!",
    postUrl: "https://www.instagram.com/florencewithlocals/",
    date: "2026-02-10",
  },
];

export const socialAccounts = {
  facebook: {
    url: "https://www.facebook.com/florencewithlocals",
    name: "Florence With Locals",
    handle: "florencewithlocals",
    followers: "122K",
  },
  instagram: {
    url: "https://www.instagram.com/florencewithlocals/",
    name: "Florence With Locals",
    handle: "florencewithlocals",
    followers: "471",
  },
} as const;
