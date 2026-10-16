# ECLIPSE: REALMS OF RUIN

A mobile-friendly 2D dark-fantasy RPG prototype. This package preserves the existing game and resets the Android packaging/build structure.

## Included game features
- Canvas-drawn pixel-style world, player, monsters, and NPCs
- Touch controls and keyboard controls
- Top-down movement, combat, monster respawning
- Multiple zones, NPC interaction, quests, XP and leveling
- Races, classes, attributes, inventory, equipment, potions, gold, and local save
- Optional WebSocket player presence and world chat (requires a separately deployed server)

## Build an Android APK with GitHub Actions
1. Extract this ZIP.
2. Upload the **contents** of this folder to the root of a new GitHub repository (not the enclosing folder itself). Include hidden files/folders, especially `.github/workflows/build-apk.yml`.
3. Ensure the default branch is named `main`.
4. Open the repository's **Actions** tab and select **Build ECLIPSE Android APK**. Press **Run workflow**, choose `main`, and run it. A push to `main` also triggers the workflow.
5. When the run succeeds, open it and download the `ECLIPSE-REALMS-OF-RUIN-APK` artifact. Extract the downloaded ZIP to get `app-debug.apk`.

The workflow installs Capacitor, creates the Android platform, syncs the web app, builds the debug APK, and uploads it. The generated `android/` folder is intentionally ignored/not committed; GitHub Actions creates it during each build.

## Optional multiplayer server
The game can be played offline. Online presence and chat require the included `server.js` to be deployed to a Node.js host. `render.yaml` is included as a starting blueprint. After deploying, enter the secure WebSocket URL (`wss://...`) in the game's Online screen. The current prototype synchronizes player presence/position and chat; combat, inventory, quests, and monster state remain local to each device.

## Local server
```sh
npm install
npm start
```
