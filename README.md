# decidedtohateyou — Blacksite dossier

A single-card, monochrome dossier for the alias **decidedtohateyou**. The page keeps everything centered against a moody looping
video backdrop while polling Spotify listening activity and Discord presence in real time.

## 🚀 Quick Start

1. Serve the site with any static server:
   ```bash
   npm install -g serve
   serve .
   ```
   Or use `python -m http.server` from this folder.

2. Open `http://localhost:3000` (or the port printed by your server) to view the page.

## 🔐 Configuration

All editable values live in [`config.js`](./config.js). Update the placeholders with your own credentials and IDs.

```js
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
    // { label: "Instagram", url: "https://instagram.com/...", icon: "ri-instagram-line" },
  ],
};
```

### Spotify Setup

1. Create a Spotify application at <https://developer.spotify.com/dashboard/>.
2. In the app settings, add a Redirect URI (e.g., `http://localhost:8888/callback`).
3. Authorize your account using the [Authorization Code Flow](https://developer.spotify.com/documentation/web-api/tutorials/code-flow) with the scopes `user-read-currently-playing user-read-recently-played`.
4. Exchange the authorization code for a **refresh token**.
5. Paste the resulting `clientId`, `clientSecret`, and `refreshToken` into `config.js`.

> ⚠️ **Security note:** Storing the client secret in a front-end bundle exposes it to visitors. Deploy behind a small serverless
proxy if you need to keep your credentials private. The README provides the direct approach for quick personal hosting.

### Discord Presence via Lanyard

This project uses the public [Lanyard API](https://github.com/Phineas/lanyard) for presence data — no token required.

1. Join the Lanyard Discord server to opt-in: <https://discord.gg/UrXF2cfJ7F>.
2. Copy your numerical Discord user ID (enable Developer Mode → right-click profile → **Copy ID**).
3. Replace `YOUR_DISCORD_USER_ID` in `config.js`.
4. Optionally update `username` and `avatarFallback` if you want a fixed display when offline.

### Social Links

Add or remove items from the `socials` array in `config.js`. The `icon` field accepts any [Remix Icon](https://remixicon.com/) class name. Each link renders as minimalist uppercase pill text with an optional icon.

## 🎨 Design Notes

- Cinematic, desaturated palette with a frosted-glass card kept perfectly centered on every viewport.
- Slow smoke footage paired with drifting film grain, light glitch echoes on the username, and a muted signal LED for Spotify state.
- Clean mono/sans typography (JetBrains Mono + Inter) with understated fades and focus outlines for accessibility.

## 🔄 Auto Refresh

- Spotify data refreshes every `pollInterval` milliseconds (default 60s).
- Discord presence refreshes every `pollInterval` milliseconds (default 45s).

## 🛠️ Customization Tips

- Swap the background video by updating the `<source>` in `index.html`.
- Adjust palette, film grain intensity, and glass blur from the variables near the top of `styles.css`.
- Tune polling cadence by editing the `pollInterval` values in `config.js`.
- Modify the intro copy, glitch effect, or status messages directly in `index.html` and `app.js`.

## 📄 License

This project is provided as-is for personal showcase purposes. Use, remix, or adapt freely.
