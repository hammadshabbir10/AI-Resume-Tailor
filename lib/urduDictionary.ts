const dictionary: Record<string, string> = {
  "blog": "بلاگ",
  "summary": "خلاصہ",
  "ai": "مصنوعی ذہانت",
  "technology": "ٹیکنالوجی",
  "content": "مواد",
  "write": "لکھیں",
  "paste": "چسپاں کریں",
  "your": "آپ کا",
  "instant": "فوری",
  "urdu": "اردو",
  "english": "انگریزی",
  "generate": "پیدا کریں",
  "insights": "بصیرت",
  "key": "اہم",
  "step": "مرحلہ",
  "steps": "مراحل",
  "simple": "آسان",
  "how": "کیسے",
  "works": "کام کرتا ہے",
  "get": "حاصل کریں",
  "start": "شروع کریں",
  "started": "شروع کیا",
  "convert": "تبدیل کریں",
  "summarize": "خلاصہ بنائیں",
  "and": "اور",
  "in": "میں",
  "for": "کے لئے",
  "to": "کو",
  "by": "کی طرف سے",
  "with": "کے ساتھ",
  "user": "صارف",
  "click": "کلک کریں",
  "button": "بٹن",
  "see": "دیکھیں",
  "result": "نتیجہ",
  "results": "نتائج",
  "save": "محفوظ کریں",
  "database": "ڈیٹا بیس",
  "powered": "پاورڈ",
  "one": "ایک",
  "sentence": "جملہ",
  "sentences": "جملے",
  "instantly": "فوری طور پر",
  // Blog-specific words
  "exploring": "دریافت کرنا",
  "transforming": "تبدیل کرنا",
  "industries": "صنعتیں",
  "reshaping": "دوبارہ تشکیل دینا",
  "daily": "روزانہ",
  "lives": "زندگیاں",
  "practical": "عملی",
  "tips": "مشورے",
  "reducing": "کم کرنا",
  "carbon": "کاربن",
  "footprint": "نشان",
  "living": "رہنا",
  "urban": "شہری",
  "areas": "علاقے",
  "sustainable": "پائیدار",
  "cities": "شہر",
  "latest": "تازہ ترین",
  "strategies": "حکمت عملیاں",
  "tools": "اوزار",
  "dominating": "غالب آنا",
  "digital": "ڈیجیٹل",
  "marketing": "مارکیٹنگ",
  "trends": "رجحانات",
  "landscape": "منظرنامہ",
  "mental": "ذہنی",
  "health": "صحت",
  "age": "عمر",
  "affects": "اثر انداز ہوتا ہے",
  "wellbeing": "فلاح",
  "wellness": "خیریت",
  "image": "تصویر",
  "while": "جبکہ",
  "our": "ہمارا"
};

export default function translateToUrdu(text: string): string {
  if (typeof text !== 'string') return '';
  return text
    .split(" ")
    .map(word => {
      const clean = word.toLowerCase().replace(/[^a-z]/gi, "");
      return dictionary[clean] || word;
    })
    .join(" ");
} 