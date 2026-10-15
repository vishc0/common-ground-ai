export const TAG_IDS=new Set(['home','costs','community','work','wellbeing','education','environment']);
const profanity=/\b(?:fuck|shit|bitch|cunt|asshole|bastard)\w*\b/i;
const malicious=/\b(?:build|make|create|write|plan|help|teach|instructions?)\b.{0,45}\b(?:bomb|weapon|malware|ransomware|poison|doxx|kidnap|explosive|phishing|steal|attack|kill|harm)\b|\b(?:how (?:can|do) i|i want to|ways? to)\b.{0,55}\b(?:attack|kill|harm|poison|doxx|kidnap|steal|phish)\b|\b(?:evade|bypass)\b.{0,30}\b(?:security|moderation|police|detection)\b/i;
const pii=/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b|\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b|\b\d{3}-\d{2}-\d{4}\b/i;
export function screen(text){const value=String(text||'').trim();if(!value)return{ok:false,reason:'empty'};if(value.length>1000)return{ok:false,reason:'too_long'};if(profanity.test(value))return{ok:false,reason:'abusive_language'};if(pii.test(value))return{ok:false,reason:'possible_pii'};if(malicious.test(value))return{ok:false,reason:'malicious_intent'};return{ok:true,value}}
export function validateTags(tags){return Array.isArray(tags)&&tags.length<=5&&new Set(tags).size===tags.length&&tags.every(tag=>TAG_IDS.has(tag))}
