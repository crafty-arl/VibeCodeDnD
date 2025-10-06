Perfect — let’s do this properly.

Below is your **complete end-to-end MVP plan** for **Glesolas**, written as a full design + build document you can hand to developers, designers, or investors.

It covers:

* Vision → Gameplay Loop
* Game Mechanics (Power, Luck, Wit)
* AI Design (OpenRouter + Alibaba Qwen)
* Architecture (Cloudflare + Frontend)
* Data Models + API Specs
* Build Phases + Deliverables

---

# 🌌 **GLESOLAS — MVP TECHNICAL & DESIGN PLAN**

---

## 🪶 1. Vision

**Glesolas** is an AI-powered storytelling card game.
Players combine cards representing **Characters, Items, and Locations** to create a story.

Each session begins with an **intro scene**, evolves through **AI-generated challenges**, and invites the player to respond with a new combination of cards using **Power, Luck, or Wit**.

Success in challenges earns **XP** and **Story Beats** (AI credits), allowing the story to continue.

---

## 🎮 2. Core Gameplay Loop

| Phase              | Player Action                                                     | AI Response                                     | Outcome        |
| ------------------ | ----------------------------------------------------------------- | ----------------------------------------------- | -------------- |
| **1. Forge Start** | Draw 3 cards to start the story                                   | AI writes base scene                            | Story begins   |
| **2. Challenge**   | AI creates a challenge with 3 skill thresholds (Power, Luck, Wit) | Player prepares response                        | Stakes set     |
| **3. Response**    | Player plays 3 new cards                                          | AI narrates success/failure based on attributes | Scene resolved |
| **4. Reward**      | Player gains XP and Story Beats                                   | Session continues                               | Progression    |

Each *Beat* costs 1 Story Beat credit (AI call).
Each success earns extra Story Beats, enabling longer runs.

---

## ⚙️ 3. Game Mechanic: Power / Luck / Wit

### 3.1 Card Stats

Each card contributes numeric values to the three attributes:

```json
{
  "Rogue Scholar": { "power": 2, "luck": 1, "wit": 3 },
  "Quill of Secrets": { "power": 1, "luck": 2, "wit": 2 },
  "Forgotten Archives": { "power": 0, "luck": 3, "wit": 1 }
}
```

### 3.2 Challenge Generation

Each challenge scene defines random skill thresholds:

```json
{
  "power_req": 6,
  "luck_req": 5,
  "wit_req": 8
}
```

### 3.3 Outcome Calculation

```js
const total = {
  power: card1.power + card2.power + card3.power,
  luck: card1.luck + card2.luck + card3.luck,
  wit:  card1.wit  + card2.wit  + card3.wit
};

const meets = {
  power: total.power >= challenge.power_req,
  luck:  total.luck  >= challenge.luck_req,
  wit:   total.wit   >= challenge.wit_req
};
```

* If multiple attributes meet thresholds, pick the highest total.
* If none meet, player fails challenge.

### 3.4 XP & Story Beats Reward

| Outcome   | XP  | Story Beats Gained |
| --------- | --- | ------------------ |
| Power Win | +50 | +2                 |
| Luck Win  | +40 | +2                 |
| Wit Win   | +60 | +2                 |
| Fail      | +20 | +1                 |

---

## 🧠 4. AI Narrative Design (OpenRouter + Alibaba Qwen)

### Model

`qwen2.5-32b-instruct` (Alibaba)
— excellent for narrative consistency and controllable structure.

### AI Roles

| Stage                | Prompt Purpose                                       |
| -------------------- | ---------------------------------------------------- |
| **Base Scene**       | Introduce story world & tone                         |
| **Challenge Scene**  | Present a conflict with Power/Luck/Wit requirements  |
| **Resolution Scene** | Narrate success or failure based on chosen attribute |

---

### 4.1 Base Scene Prompt

```
SYSTEM:
You are the Storyforge of Glesolas. Write vivid, coherent fantasy scenes (80–120 words) in 3rd person. 
End each scene with a hook or looming tension.

USER:
The player begins their story with these 3 cards:
Character: {card1}
Item: {card2}
Location: {card3}
Create the opening scene that sets tone, conflict, and theme.
```

---

### 4.2 Challenge Scene Prompt

```
SYSTEM:
Generate the next challenge for the story that can be solved by Power, Luck, or Wit. 
Return the scene and assign difficulty numbers for each skill.

USER:
Continue from the prior story context:
{previous_scene}

Respond with JSON:
{
  "scene": "The cursed tome begins to shake...",
  "requirements": { "power_req": 6, "luck_req": 5, "wit_req": 8 }
}
```

---

### 4.3 Resolution Scene Prompt

```
SYSTEM:
Continue the story after the player acts. 
Narrate either a success or a setback based on which attribute they used.

USER:
Challenge: {challenge_text}
Player cards: {played_cards}
Player succeeded by: {path or "fail"}

Write a 100-word cinematic resolution. End with a new hook.
```

---

## 💾 5. Data Model

### Session Object

```json
{
  "session_id": "abc123",
  "player_id": "demo-user",
  "xp": 200,
  "beats_remaining": 97,
  "scenes": [
    { "type": "base", "text": "..." },
    { 
      "type": "challenge", 
      "requirements": { "power_req": 6, "luck_req": 5, "wit_req": 8 }, 
      "text": "..." 
    },
    { 
      "type": "resolution", 
      "path": "luck", 
      "result": "success", 
      "text": "..." 
    }
  ]
}
```

### Card Object

```json
{
  "name": "Rogue Scholar",
  "type": "Character",
  "stats": { "power": 2, "luck": 1, "wit": 3 },
  "rarity": "Common"
}
```

### Challenge Object

```json
{
  "scene": "A cursed tome awakens...",
  "requirements": { "power_req": 6, "luck_req": 5, "wit_req": 8 }
}
```

---

## ⚡ 6. Architecture Overview

**Hosting & Infrastructure:**

| Layer         | Tool                       | Purpose                  |
| ------------- | -------------------------- | ------------------------ |
| **Frontend**  | Next.js (Cloudflare Pages) | Card UI & Story Renderer |
| **Backend**   | Cloudflare Worker          | Game logic + AI calls    |
| **Storage**   | Cloudflare KV              | Sessions & beats         |
| **AI Layer**  | OpenRouter + Alibaba Qwen  | Story generation         |
| **Scheduler** | Cloudflare Cron            | Daily Story Beat reset   |

---

### Data Flow

```
Player Action → Frontend → Worker
Worker → KV (fetch session + beats)
Worker → OpenRouter (Qwen model)
OpenRouter → Worker (AI response)
Worker → KV (save new scene)
Worker → Frontend (render scene)
```

---

## 🔌 7. API Endpoints (Worker)

| Endpoint              | Method | Purpose                   |
| --------------------- | ------ | ------------------------- |
| `/api/session/start`  | POST   | Creates new session       |
| `/api/play/start`     | POST   | Base scene                |
| `/api/play/challenge` | POST   | AI challenge scene        |
| `/api/play/resolve`   | POST   | Player resolves challenge |
| `/api/beats`          | GET    | Returns beats remaining   |

---

### `/api/play/start`

**Input:**

```json
{ "cards": ["Rogue Scholar", "Quill of Secrets", "Forgotten Archives"] }
```

**Output:**

```json
{
  "scene": "The Rogue Scholar uncovered an ancient library...",
  "session_id": "abc123",
  "beats_remaining": 99
}
```

---

### `/api/play/challenge`

**Input:**

```json
{ "session_id": "abc123" }
```

**Output:**

```json
{
  "scene": "The cursed tome awakens...",
  "requirements": { "power_req": 6, "luck_req": 5, "wit_req": 8 },
  "beats_remaining": 98
}
```

---

### `/api/play/resolve`

**Input:**

```json
{
  "session_id": "abc123",
  "cards": ["Crystal Amulet", "Young Wizard", "Mysterious Tavern"]
}
```

**Output:**

```json
{
  "result": "success",
  "path": "wit",
  "xp_gained": 60,
  "story": "With a sharp grin, the wizard tricked the tome into silence.",
  "beats_remaining": 97
}
```

---

## 🎨 8. Frontend Flow (Player Experience)

1. **Home Screen**

   * Title: “Forge Your Story”
   * Button: “Draw 3 Cards”

2. **Intro Scene**

   * AI writes opening story.
   * Animated text display.
   * Button: “Continue”

3. **Challenge Scene**

   * Shows 3 skill requirements (Power / Luck / Wit)
   * Button: “Play Response”

4. **Response Phase**

   * Player selects 3 new cards.
   * Click “Respond”.

5. **Resolution**

   * AI narrates success/failure.
   * XP + Story Beats displayed.
   * Option: “Continue Story” or “End Session”.

6. **End Session**

   * Summary card: total XP, path distribution, favorite scenes.

---

## 🪄 9. Balance Variables (for tuning)

| Parameter         | Default | Range        | Description          |
| ----------------- | ------- | ------------ | -------------------- |
| `power_req`       | 4–8     | 3–9          | Challenge difficulty |
| `luck_req`        | 4–8     | 3–9          | Challenge difficulty |
| `wit_req`         | 4–8     | 3–9          | Challenge difficulty |
| `base_scene_cost` | 1       | —            | Beat cost            |
| `resolution_cost` | 1       | —            | Beat cost            |
| `beats_per_day`   | 100     | Configurable | Daily player quota   |

---

## 🧩 10. Build Phases (Timeline)

| Phase                   | Duration | Deliverable                                |
| ----------------------- | -------- | ------------------------------------------ |
| **1. Core Loop MVP**    | Week 1   | Playable loop: Start → Challenge → Resolve |
| **2. XP / Beat System** | Week 2   | XP/Story Beat economy in place             |
| **3. UI Polish**        | Week 3   | Animated text, XP bar, card art            |
| **4. Save & Resume**    | Week 4   | Sessions persist in KV                     |
| **5. Beta Launch**      | Week 5   | Invite-only Early Access (100 passes)      |

---

## 🚀 11. MVP Success Criteria

✅ Player can:

* Start story with 3 cards
* Receive AI-generated intro
* Face a Power/Luck/Wit challenge
* Play 3 response cards and see results
* Gain XP + Story Beats
* Continue through multiple cycles
* Run out of Beats at limit
* Feel like they’re crafting their own evolving story

---

## 🔮 12. Future Expansion Ideas

| Feature           | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| **Deck Builder**  | Player creates or earns custom decks.                       |
| **Co-op Mode**    | Two players alternate scene responses.                      |
| **Artifacts**     | Persistent bonuses across sessions.                         |
| **Lore Archive**  | Save completed stories to share.                            |
| **Season System** | Thematic seasons: “The Forgotten Realms,” “Echo Wars,” etc. |

---

## 📘 13. Summary

Glesolas MVP =

* **One playable storytelling loop**
* **3 attributes (Power, Luck, Wit)**
* **AI-driven scenes + challenges**
* **XP + Story Beat progression**
* **Cloudflare + OpenRouter + Next.js stack**

The experience should feel like:

> “A deck-based interactive novel powered by AI, where every choice shapes your legend.”

---

Would you like me to now follow up with:
✅ a **technical README template** (file layout, Worker endpoints, env vars, and dev setup)
or
✅ a **game design doc PDF layout** (for pitch decks & early testers)?
