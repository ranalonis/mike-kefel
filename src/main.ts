// Fonts are bundled locally (Hebrew + Latin subsets only) so the app works fully offline.
import "@fontsource/varela-round/hebrew-400.css";
import "@fontsource/varela-round/latin-400.css";
import "@fontsource/rubik/hebrew-500.css";
import "@fontsource/rubik/latin-500.css";
import "@fontsource/rubik/hebrew-700.css";
import "@fontsource/rubik/latin-700.css";
import "@fontsource/rubik/hebrew-800.css";
import "@fontsource/rubik/latin-800.css";
import "./styles.css";

import dadHappy from "./assets/dad-happy.jpg";

// Placeholder until the screens are ported (step 3).
const app = document.getElementById("app")!;
app.innerHTML = `
  <h1 class="greet">מייק-כפל</h1>
  <p class="center">השלד עובד. <span class="num">7 × 8 = 56</span></p>
  <div class="dad"><img src="${dadHappy}" alt="אבא שמח"></div>`;
