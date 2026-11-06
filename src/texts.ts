/** Every piece of text the user sees, in one place. */

export const APP_NAME = "מייק-כפל";

/** 05:00–11:59 morning, 12:00–16:59 day, otherwise evening. */
export function greeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "בוקר טוב מייקי";
  if (hour >= 12 && hour < 17) return "יום טוב מייקי";
  return "ערב טוב מייקי";
}

export const T = {
  back: "חזרה למסך הבית",

  home: {
    settings: "הגדרות",
    todayLabel: "היום:",
    exercises: "תרגילים",
    streakLabel: "רצף:",
    days: (n: number) => (n === 1 ? "יום" : "ימים"),
    start: "התחל תרגול",
    pandaHappy: "כל הכבוד! תרגלת היום 🎉",
    pandaWorried: "עוד לא תרגלנו היום… בוא נתחיל?",
    pandaHappyAlt: "פנדה אדומה שמחה",
    pandaWorriedAlt: "פנדה אדומה מודאגת",
    history: "היסטוריית תרגול",
  },

  practice: {
    title: "יאללה מייקי, תן עבודה!",
    progress: "התקדמות",
    exerciseOf: (n: string, total: string) => `תרגיל ${n} מתוך ${total}`,
    praise: ["מעולה!", "בול!", "אלוף!", "יפה מאוד!"],
    almost: "כמעט!",
    timeUp: "נגמר הזמן.",
    delete: "מחק",
    check: "בדוק",
    seconds: "שניות",
  },

  summary: {
    title: "סיימת!",
    pass: "כל הכבוד, אתה חופשי!",
    fail: "יאללה מייקי, אתה יכול! עשה שוב, שיגעת אותי",
    dadHappyAlt: "אבא שמח",
    dadSadAlt: "אבא לא שמח",
    correctOf: (c: string, t: string) => `${c} תשובות נכונות מתוך ${t}`,
    again: "עוד סבב",
    retry: "עשה שוב",
    home: "חזרה למסך הבית",
  },

  history: {
    title: "היסטוריית תרגול",
    chartLabel: "ציון יומי בעשרת הימים האחרונים",
    today: "היום",
    noPractice: "—",
    practiceDays: "ימי תרגול",
    average: "ציון ממוצע",
    streak: "ימים ברצף",
  },

  settings: {
    title: "הגדרות",
    section: "תרגול",
    secondsPerQ: "זמן לכל תרגיל",
    seconds: (n: number) => `${n} שניות`,
    noLimit: "בלי הגבלה",
    roundSize: "תרגילים בכל סבב",
    dailyGoal: "יעד יומי",
    dailyGoalHint: "כמה תרגילים ביום, מכל הסבבים יחד",
    minTable: "מאיזה מספר",
    minTableHint: "להשמיט את לוח ה-1 הקל",
    maxTable: "עד איזה מספר",
    sound: "צלילים",
    save: "שמור הגדרות",
    saved: "ההגדרות נשמרו",
  },
} as const;
