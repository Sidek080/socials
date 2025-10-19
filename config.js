export const CONFIG = {
  spotify: {
    clientId: "YOUR_SPOTIFY_CLIENT_ID",
    clientSecret: "YOUR_SPOTIFY_CLIENT_SECRET",
    refreshToken: "YOUR_SPOTIFY_REFRESH_TOKEN",
    pollInterval: 60000,
  },
  discord: {
    userId: "YOUR_DISCORD_USER_ID",
    username: "decidedtohateyou#0000",
    avatarFallback: "https://cdn.discordapp.com/embed/avatars/0.png",
    pollInterval: 45000,
  },
  socials: [
    {
      label: "Instagram",
      url: "https://instagram.com/decidedtohateyou",
      icon: "ri-instagram-line",
    },
    {
      label: "TikTok",
      url: "https://tiktok.com/@decidedtohateyou",
      icon: "ri-tiktok-line",
    },
    {
      label: "GitHub",
      url: "https://github.com/decidedtohateyou",
      icon: "ri-github-line",
    },
  ],
};
