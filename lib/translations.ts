export type Language = 'hi' | 'en';

const translations = {
  // ─── Language Selector ──────────────────────────────────────────────────
  'lang.question.hi': { hi: 'आप कौनसी भाषा पसंद करते हैं?', en: 'आप कौनसी भाषा पसंद करते हैं?' },
  'lang.question.en': { hi: 'Which language do you prefer?', en: 'Which language do you prefer?' },
  'lang.hindi': { hi: 'हिन्दी', en: 'हिन्दी' },
  'lang.hindi.sub': { hi: 'Hindi', en: 'Hindi' },
  'lang.english': { hi: 'English', en: 'English' },
  'lang.english.sub': { hi: 'अंग्रेज़ी', en: 'अंग्रेज़ी' },

  // ─── Welcome ────────────────────────────────────────────────────────────
  'welcome.family': { hi: 'सांवलराम मखुदेवी परिवार', en: 'Sanwalram Makhudevi Family' },
  'welcome.invite': { hi: 'अपनी जीवन की कहानी इस परिवार के साथ साझा करें।', en: 'Share your life story with our family.' },
  'welcome.begin': { hi: 'शुरू करें →', en: 'Begin →' },

  // ─── Progress petals aria ───────────────────────────────────────────────
  'progress.step': { hi: 'चरण', en: 'Step' },
  'progress.of': { hi: 'में से', en: 'of' },

  // ─── Screen 2 — Photo ───────────────────────────────────────────────────
  'photo.heading': { hi: 'आपकी तस्वीर', en: 'Your photo' },
  'photo.dropzone': { hi: 'तस्वीर यहाँ डालें', en: 'Drop your photo here' },
  'photo.camera': { hi: 'कैमरा', en: 'Camera' },
  'photo.gallery': { hi: 'गैलरी', en: 'Gallery' },
  'photo.skip': { hi: 'अभी छोड़ दें', en: 'Skip for now' },
  'photo.remove': { hi: 'हटाएं', en: 'Remove' },
  'photo.change': { hi: 'बदलें', en: 'Change' },
  'photo.compressing': { hi: 'तस्वीर तैयार हो रही है...', en: 'Preparing photo...' },
  'photo.required': { hi: 'कृपया अपनी तस्वीर जोड़ें', en: 'Please add your photo' },

  // ─── Screen 3 — Basics ──────────────────────────────────────────────────
  'basics.heading': { hi: 'आपके बारे में', en: 'About you' },
  'basics.name': { hi: 'नाम', en: 'Name' },
  'basics.name.placeholder': { hi: 'आपका पूरा नाम', en: 'Your full name' },
  'basics.dob': { hi: 'जन्म तिथि', en: 'Date of birth' },
  'basics.dob.day': { hi: 'दिन', en: 'Day' },
  'basics.dob.month': { hi: 'महीना', en: 'Month' },
  'basics.dob.year': { hi: 'वर्ष', en: 'Year' },
  'basics.father': { hi: 'पिता का नाम', en: "Father's name" },
  'basics.father.placeholder': { hi: 'पिता का नाम', en: "Your father's name" },
  'basics.mother': { hi: 'माता का नाम', en: "Mother's name" },
  'basics.mother.placeholder': { hi: 'माता का नाम', en: "Your mother's name" },
  'basics.phone': { hi: 'मोबाइल नंबर', en: 'Mobile number' },
  'basics.phone.placeholder': { hi: 'जैसे: 9876543210', en: 'e.g. 9876543210' },
  'basics.required': { hi: 'यह ज़रूरी है', en: 'This field is required' },

  // ─── Screen 4 — About ───────────────────────────────────────────────────
  'about.heading': { hi: 'आपका जीवन', en: 'Your life' },
  'about.qualifications': { hi: 'शिक्षा', en: 'Academic qualifications' },
  'about.qualifications.placeholder': { hi: 'जैसे: B.A., M.A., Ph.D.', en: 'e.g. B.A., MBA, self-taught engineer' },
  'about.qualifications.hint': { hi: 'आपकी पढ़ाई, डिग्री, या कोई विशेष प्रशिक्षण', en: 'Your degrees, diplomas, or special training' },
  'about.achievements': { hi: 'व्यावसायिक उपलब्धियाँ', en: 'Professional achievements' },
  'about.achievements.placeholder': { hi: 'जैसे: 30 वर्षों तक शिक्षक रहे', en: 'e.g. Taught for 30 years, built a business' },
  'about.achievements.hint': { hi: 'काम, व्यापार, या सेवा में जो आपने हासिल किया', en: 'What you achieved in work, trade, or service' },
  'about.hobbies': { hi: 'शौक', en: 'Hobbies' },
  'about.hobbies.placeholder': { hi: 'जैसे: बागवानी, संगीत, खाना बनाना', en: 'e.g. gardening, music, cooking' },
  'about.hobbies.hint': { hi: 'जो चीज़ें आपको खुशी देती हैं', en: 'The things that bring you joy' },

  // ─── Screen 5 — Story ───────────────────────────────────────────────────
  'story.heading': { hi: 'आपकी कहानी', en: 'Your story' },
  'story.subhead': { hi: 'जैसे आप चाहें', en: 'Share it your way' },
  'story.prompt1': { hi: 'जो मुझे प्रेरित करता है...', en: 'What inspires me...' },
  'story.prompt2': { hi: 'एक मुश्किल जो मैंने पार की...', en: 'A difficulty I overcame...' },
  'story.prompt3': { hi: 'परिवार के बारे में मेरे विचार...', en: 'My thoughts on our family...' },
  'story.method.write': { hi: 'लिखिए', en: 'Write it' },
  'story.method.audio': { hi: 'बोलिए', en: 'Record audio' },
  'story.method.video': { hi: 'दिखाइए', en: 'Record video' },
  'story.method.upload': { hi: 'अपलोड', en: 'Upload file' },
  'story.write.placeholder': { hi: 'अपनी कहानी यहाँ लिखें...', en: 'Write your story here...' },
  'story.words': { hi: 'शब्द', en: 'words' },
  'story.autosave': { hi: 'सेव हो रहा है...', en: 'Saving...' },
  'story.saved': { hi: 'सेव हुआ', en: 'Saved' },
  'story.min_words': { hi: 'कम से कम 50 शब्द लिखें', en: 'Please write at least 50 words' },
  'story.audio.record': { hi: 'रिकॉर्ड करें', en: 'Record' },
  'story.audio.stop': { hi: 'रोकें', en: 'Stop' },
  'story.audio.rerecord': { hi: 'फिर से रिकॉर्ड करें', en: 'Re-record' },
  'story.audio.keep': { hi: 'यही रखें', en: 'Keep this' },
  'story.audio.warning': { hi: '30 सेकंड बचे हैं', en: '30 seconds remaining' },
  'story.video.record': { hi: 'वीडियो रिकॉर्ड करें', en: 'Record video' },
  'story.video.stop': { hi: 'रोकें', en: 'Stop' },
  'story.video.rerecord': { hi: 'फिर से रिकॉर्ड करें', en: 'Re-record' },
  'story.video.keep': { hi: 'यही रखें', en: 'Keep this' },
  'story.upload.label': { hi: 'फ़ाइल चुनें या यहाँ डालें', en: 'Choose a file or drag it here' },
  'story.upload.types': { hi: 'ऑडियो या वीडियो फ़ाइल (अधिकतम 50MB)', en: 'Audio or video file (max 50MB)' },
  'story.upload.toobig': { hi: 'फ़ाइल बहुत बड़ी है (अधिकतम 50MB)', en: 'File is too large (max 50MB)' },
  'story.required': { hi: 'कहानी साझा करना ज़रूरी है', en: 'Please share your story' },

  // ─── Screen 6 — Review ──────────────────────────────────────────────────
  'review.heading': { hi: 'एक बार देख लें', en: 'Review your story' },
  'review.photo': { hi: 'तस्वीर', en: 'Photo' },
  'review.basics': { hi: 'जानकारी', en: 'Details' },
  'review.about': { hi: 'जीवन', en: 'Life' },
  'review.story': { hi: 'कहानी', en: 'Story' },
  'review.edit': { hi: 'बदलें', en: 'Edit' },
  'review.submit': { hi: 'मेरी कहानी भेजें 💌', en: 'Send my story 💌' },
  'review.no_photo': { hi: 'कोई तस्वीर नहीं', en: 'No photo added' },

  // ─── Upload overlay ──────────────────────────────────────────────────────
  'upload.photo': { hi: 'तस्वीर अपलोड हो रही है...', en: 'Uploading your photo...' },
  'upload.media': { hi: 'मीडिया अपलोड हो रहा है...', en: 'Uploading your story...' },
  'upload.saving': { hi: 'कहानी भेजी जा रही है...', en: 'Sending your story...' },
  'upload.done': { hi: 'हो गया!', en: 'Done!' },

  // ─── Screen 7 — Success ─────────────────────────────────────────────────
  'success.thanks': { hi: 'धन्यवाद 🙏', en: 'Thank you 🙏' },
  'success.message': { hi: 'आपकी कहानी अब परिवार के संग्रह का हिस्सा है। आने वाली पीढ़ियाँ इसे पढ़ेंगी और आपको याद करेंगी।', en: 'Your story is now part of the family archive. Future generations will read it and remember you.' },
  'success.fill_another': { hi: 'किसी और के लिए भरें', en: 'Fill for someone else' },
  'success.whatsapp': { hi: 'WhatsApp पर शेयर करें', en: 'Share on WhatsApp' },

  // ─── Navigation ─────────────────────────────────────────────────────────
  'nav.back': { hi: 'वापस', en: 'Back' },
  'nav.next': { hi: 'आगे →', en: 'Next →' },
  'nav.continue': { hi: 'जारी रखें →', en: 'Continue →' },

  // ─── Months ─────────────────────────────────────────────────────────────
  'month.1': { hi: 'जनवरी', en: 'January' },
  'month.2': { hi: 'फरवरी', en: 'February' },
  'month.3': { hi: 'मार्च', en: 'March' },
  'month.4': { hi: 'अप्रैल', en: 'April' },
  'month.5': { hi: 'मई', en: 'May' },
  'month.6': { hi: 'जून', en: 'June' },
  'month.7': { hi: 'जुलाई', en: 'July' },
  'month.8': { hi: 'अगस्त', en: 'August' },
  'month.9': { hi: 'सितंबर', en: 'September' },
  'month.10': { hi: 'अक्टूबर', en: 'October' },
  'month.11': { hi: 'नवंबर', en: 'November' },
  'month.12': { hi: 'दिसंबर', en: 'December' },

  // ─── Admin ───────────────────────────────────────────────────────────────
  'admin.title': { hi: 'परिवार कहानियाँ', en: 'Pariwar Kahaniyaan' },
  'admin.search': { hi: 'नाम से खोजें...', en: 'Search by name...' },
  'admin.sort.newest': { hi: 'नए पहले', en: 'Newest first' },
  'admin.sort.oldest': { hi: 'पुराने पहले', en: 'Oldest first' },
  'admin.sort.az': { hi: 'अ-ज क्रम', en: 'A-Z' },
  'admin.filter.all': { hi: 'सभी', en: 'All' },
  'admin.filter.text': { hi: 'लिखित', en: 'Text' },
  'admin.filter.audio': { hi: 'ऑडियो', en: 'Audio' },
  'admin.filter.video': { hi: 'वीडियो', en: 'Video' },
  'admin.filter.upload': { hi: 'अपलोड', en: 'Upload' },
  'admin.hide': { hi: 'छुपाएं', en: 'Hide' },
  'admin.show': { hi: 'दिखाएं', en: 'Show' },
  'admin.entries': { hi: 'कहानियाँ', en: 'entries' },
  'admin.password': { hi: 'पासवर्ड दर्ज करें', en: 'Enter password' },
  'admin.password.wrong': { hi: 'गलत पासवर्ड', en: 'Wrong password' },
  'admin.enter': { hi: 'प्रवेश करें', en: 'Enter' },
  'admin.print': { hi: 'प्रिंट व्यू', en: 'Print view' },

  // ─── Errors ──────────────────────────────────────────────────────────────
  'error.generic': { hi: 'कुछ गलत हुआ। फिर कोशिश करें।', en: 'Something went wrong. Please try again.' },
  'error.submit': { hi: 'कहानी भेजने में दिक्कत हुई। फिर कोशिश करें।', en: 'Failed to submit your story. Please try again.' },

  // ─── No-JS fallback ──────────────────────────────────────────────────────
  'noscript': { hi: 'इस वेबसाइट के लिए JavaScript ज़रूरी है। कृपया अपने ब्राउज़र में JavaScript चालू करें।', en: 'This website requires JavaScript. Please enable JavaScript in your browser.' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Language): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] ?? key;
}

export default translations;
