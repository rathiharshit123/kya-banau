export interface YouTubeVideo {
  video_id: string;
  title: string;
  thumbnail_url: string;
  channel_name: string;
  video_url: string;
}

interface YouTubeSearchItem {
  id: { videoId?: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium?: { url: string };
      default?: { url: string };
    };
  };
}

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
  error?: { message: string };
}

export function buildRecipeSearchQuery(dishName: string): string {
  return `indian ${dishName.trim()} recipe home cooking`;
}

export async function searchRecipeVideos(
  dishName: string,
  maxResults = 4
): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YouTube API key is not configured");
  }

  const query = buildRecipeSearchQuery(dishName);
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: String(maxResults),
    relevanceLanguage: "hi",
    regionCode: "IN",
    safeSearch: "strict",
    key: apiKey,
  });

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
  );

  const data = (await res.json()) as YouTubeSearchResponse;

  if (!res.ok) {
    throw new Error(data.error?.message ?? `YouTube API error (${res.status})`);
  }

  return (data.items ?? [])
    .filter((item) => item.id.videoId)
    .map((item) => {
      const videoId = item.id.videoId!;
      return {
        video_id: videoId,
        title: item.snippet.title,
        thumbnail_url:
          item.snippet.thumbnails.medium?.url ??
          item.snippet.thumbnails.default?.url ??
          "",
        channel_name: item.snippet.channelTitle,
        video_url: `https://www.youtube.com/watch?v=${videoId}`,
      };
    });
}
