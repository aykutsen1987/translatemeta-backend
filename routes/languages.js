const express = require('express');
const router = express.Router();
const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect', native_name: 'Auto', flag: '🌐' },
  { code: 'en', name: 'English', native_name: 'English', flag: '🇬🇧' },
  { code: 'tr', name: 'Turkish', native_name: 'Türkçe', flag: '🇹🇷' },
  { code: 'de', name: 'German', native_name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', native_name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', native_name: 'Español', flag: '🇪🇸' },
  { code: 'ru', name: 'Russian', native_name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', native_name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', native_name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', native_name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', native_name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'sw', name: 'Swahili', native_name: 'Kiswahili', flag: '🇰🇪' },
];
router.get('/', (req, res) => res.json(LANGUAGES));
module.exports = router;