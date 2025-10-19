import { CONFIG } from "./config.js";

const spotifyTrackEl = document.getElementById("spotify-track");
const spotifyArtistEl = document.getElementById("spotify-artist");
const spotifyStateEl = document.getElementById("spotify-state");
const discordTagEl = document.getElementById("discord-tag");
const discordStatusEl = document.getElementById("discord-status");
const discordActivityEl = document.getElementById("discord-activity");
const discordAvatarEl = document.getElementById("discord-avatar");
const socialsListEl = document.querySelector("#social-links .social-list");
const lastSyncEl = document.getElementById("last-sync");

const STATUS_CLASS_MAP = {
  online: "online",
  idle: "idle",
  dnd: "dnd",
  offline: "offline",
};

const STATUS_LABEL_MAP = {
  online: "online",
  idle: "idle",
  dnd: "dnd",
  offline: "offline",
};

function timestamp() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function updateLastSync() {
  lastSyncEl.textContent = timestamp();
}

function setSpotifyState(state) {
  if (spotifyStateEl) {
    spotifyStateEl.setAttribute("data-state", state);
  }
}

function setSpotifyFallback(primary, secondary, state = "idle") {
  spotifyTrackEl.textContent = primary;
  spotifyArtistEl.textContent = secondary;
  setSpotifyState(state);
}

function renderSocialLinks() {
  socialsListEl.innerHTML = "";
  if (!Array.isArray(CONFIG.socials)) return;
  CONFIG.socials.forEach((item) => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = item.label;

    const labelWrapper = document.createElement("span");

    if (item.icon) {
      const iconEl = document.createElement("i");
      iconEl.className = item.icon;
      iconEl.setAttribute("aria-hidden", "true");
      labelWrapper.appendChild(iconEl);
    }

    const labelEl = document.createElement("span");
    labelEl.textContent = item.label;
    labelWrapper.appendChild(labelEl);

    link.appendChild(labelWrapper);
    li.appendChild(link);
    socialsListEl.appendChild(li);
  });
}

async function refreshSpotify() {
  if (
    !CONFIG.spotify.clientId ||
    !CONFIG.spotify.clientSecret ||
    !CONFIG.spotify.refreshToken
  ) {
    setSpotifyFallback("configure your spotify keys", "set them inside config.js", "disabled");
    return;
  }

  try {
    setSpotifyState("loading");
    const accessToken = await getSpotifyAccessToken();
    const nowPlaying = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (nowPlaying.status === 204 || nowPlaying.status === 202) {
      return loadLastPlayed(accessToken);
    }

    if (!nowPlaying.ok) {
      throw new Error(`Spotify error: ${nowPlaying.status}`);
    }

    const payload = await nowPlaying.json();

    if (!payload.item) {
      return loadLastPlayed(accessToken);
    }

    updateSpotifyDisplay(payload.item, payload.is_playing);
  } catch (error) {
    console.error(error);
    setSpotifyFallback("signal lost", "spotify api request failed", "error");
  }
}

async function getSpotifyAccessToken() {
  const { clientId, clientSecret, refreshToken } = CONFIG.spotify;
  const auth = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Spotify token");
  }

  const data = await response.json();
  return data.access_token;
}

async function loadLastPlayed(accessToken) {
  try {
    const recent = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!recent.ok) {
      throw new Error("Spotify recently-played request failed");
    }

    const payload = await recent.json();
    const track = payload.items?.[0]?.track;
    if (track) {
      updateSpotifyDisplay(track, false, true);
    } else {
      setSpotifyFallback("no playback detected", "the deck is quiet", "idle");
    }
  } catch (error) {
    console.error(error);
    setSpotifyFallback("signal lost", "spotify history fetch failed", "error");
  }
}

function updateSpotifyDisplay(track, isPlaying = false, fromHistory = false) {
  if (!track) {
    setSpotifyFallback("no data", "no track information available", "error");
    return;
  }
  const artists = track.artists.map((artist) => artist.name).join(", ");
  spotifyTrackEl.textContent = track.name;
  const prefix = isPlaying ? "live" : fromHistory ? "last played" : "paused";
  spotifyArtistEl.textContent = `${prefix} — ${artists}`;
  const state = isPlaying ? "live" : fromHistory ? "history" : "paused";
  setSpotifyState(state);
  updateLastSync();
}

function setDiscordStatus(status) {
  const normalized = STATUS_CLASS_MAP[status] ? status : "offline";
  const className = STATUS_CLASS_MAP[normalized];
  discordStatusEl.className = `status-indicator ${className}`;
  discordStatusEl.setAttribute("data-status", normalized);
  discordStatusEl.textContent = STATUS_LABEL_MAP[normalized];
}

async function refreshDiscord() {
  if (!CONFIG.discord.userId) {
    setDiscordStatus("offline");
    discordTagEl.textContent = "configure your discord userId";
    discordActivityEl.textContent = "set it inside config.js";
    if (CONFIG.discord.avatarFallback) {
      discordAvatarEl.src = CONFIG.discord.avatarFallback;
    }
    return;
  }

  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${CONFIG.discord.userId}`);
    if (!response.ok) {
      throw new Error(`Discord presence fetch failed ${response.status}`);
    }
    const { data } = await response.json();

    const status = data.discord_status ?? "offline";
    setDiscordStatus(status);

    if (data.discord_user?.username) {
      const { username, discriminator } = data.discord_user;
      const tag = discriminator && discriminator !== "0" ? `${username}#${discriminator}` : username;
      discordTagEl.textContent = tag;
    } else {
      discordTagEl.textContent = CONFIG.discord.username;
    }

    const activity = data.activities?.find((act) => act.type === 0);
    if (activity) {
      const parts = [activity.name, activity.details, activity.state].filter(Boolean);
      discordActivityEl.textContent = parts.join(" • ");
    } else {
      discordActivityEl.textContent = "idle in the matrix";
    }

    const avatar = data.discord_user?.avatar
      ? `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=128`
      : CONFIG.discord.avatarFallback;
    if (avatar) {
      discordAvatarEl.src = avatar;
    }
    discordAvatarEl.alt = data.discord_user?.username
      ? `${data.discord_user.username}'s avatar`
      : "Discord avatar";
    updateLastSync();
  } catch (error) {
    console.error(error);
    setDiscordStatus("offline");
    discordTagEl.textContent = CONFIG.discord.username || "discord";
    discordActivityEl.textContent = "discord signal jammed";
    if (CONFIG.discord.avatarFallback) {
      discordAvatarEl.src = CONFIG.discord.avatarFallback;
    }
  }
}

function initialize() {
  renderSocialLinks();
  if (CONFIG.discord.avatarFallback) {
    discordAvatarEl.src = CONFIG.discord.avatarFallback;
    discordAvatarEl.alt = "Discord avatar";
  }
  if (CONFIG.discord.username) {
    discordTagEl.textContent = CONFIG.discord.username;
  }
  refreshSpotify();
  refreshDiscord();

  setInterval(refreshSpotify, CONFIG.spotify.pollInterval || 60000);
  setInterval(refreshDiscord, CONFIG.discord.pollInterval || 45000);
}

initialize();
