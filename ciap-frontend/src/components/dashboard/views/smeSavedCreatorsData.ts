export interface SavedCreator {
  id: string;
  name: string;
  niche: string;
  followers: string;
  engagementReach: string;
  avgViews: string;
  avatarSeed: string;
  profileImage: string;
  score: number;
  reachScore: string;
  trustFactor: string;
  totalReach: string;
  cpm: string;
}

export const savedCreators: SavedCreator[] = [
  {
    id: "john-paul-kosi",
    name: "John-Paul Kosi",
    niche: "Architect",
    followers: "142K",
    engagementReach: "4.8%",
    avgViews: "22K",
    avatarSeed: "John-Paul Kosi",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=John-Paul%20Kosi&backgroundColor=b6a083",
    score: 88,
    reachScore: "92.4",
    trustFactor: "84.1",
    totalReach: "2.4M",
    cpm: "$18.40",
  },
  {
    id: "marcel-onyeukuzi",
    name: "Marcel Onyeukuzi",
    niche: "Tech & Future Hardware",
    followers: "142K",
    engagementReach: "4.8%",
    avgViews: "22K",
    avatarSeed: "Marcel Onyeukuzi",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcel%20Onyeukuzi&backgroundColor=b6a083",
    score: 86,
    reachScore: "89.7",
    trustFactor: "82.8",
    totalReach: "1.9M",
    cpm: "$16.20",
  },
  {
    id: "shukee-edwin",
    name: "Shukee Edwin",
    niche: "Visual Arts & CGI",
    followers: "142K",
    engagementReach: "4.8%",
    avgViews: "22K",
    avatarSeed: "Shukee Edwin",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shukee%20Edwin&backgroundColor=b6a083",
    score: 91,
    reachScore: "94.2",
    trustFactor: "87.5",
    totalReach: "2.8M",
    cpm: "$21.10",
  },
];
