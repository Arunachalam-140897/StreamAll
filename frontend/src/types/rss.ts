export interface RSSFeed {
  id: string;
  url: string;
  label: string;
  lastChecked: string;
  createdAt: string;
  updatedAt: string;
}

export interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  enclosure?: {
    url: string;
    type: string;
    length?: string;
  };
}

export interface RSSState {
  feeds: RSSFeed[];
  currentFeedItems: RSSItem[];
  isLoading: boolean;
  error: string | null;
}