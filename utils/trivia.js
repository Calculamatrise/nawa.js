export const DifficultyTypes = ['easy', 'medium', 'hard'];
export default Object.defineProperties([{
	answer: '(Adhan) أذان',
	difficulty: "easy",
	question: "What is the Arabic term for the call to prayer?",
	regex: /(?<!\S)(a((d|t)h|z)aa?n|أَذَان|أذان)(?!\S)/i
}, {
	answer: "(Halimah Al-Sa'adiyah) حليمةؓ بنت أبي ذؤيب",
	difficulty: "easy",
	question: "Who was the wet nurse of Muhammad ﷺ?",
	regex: /(?<!\S)(halim(ah?|e)|حليمة)(?!\S)/i
}, {
	answer: '(Muhammad) محمد ﷺ',
	difficulty: "easy",
	question: "Who was the last messenger of Allah?",
	regex: /(?<!\S)(m(o|u)ham{1,2}(a|e)d|مُحَمَّد|محمد)(?!\S)/i
}, {
	answer: '(Muharram) محرم',
	difficulty: "easy",
	question: "What is the first month in the Hijri calendar?",
	regex: /(?<!\S)(m(o|u)har{1,2}(a|e)m|مُحَرَّم|محرم)(?!\S)/i
}, {
	answer: '(Five) خمسة',
	difficulty: "easy",
	question: "How many pillars are there in Islam?",
	regex: /(?<!\S)(5|five|٥|خمسة)(?!\S)/i
}, {
	answer: '(Shahada) الشهادة',
	difficulty: "easy",
	question: "What is the first pillar of Islam?",
	regex: /(?<!\S)((sh|ş)ahadah?|شَّهَادَةُ|شهادة)(?!\S)/i
}, {
	answer: '(Tawhid) توحيد',
	difficulty: "easy",
	question: "What is the first pillar of Iman?",
	regex: /(?<!\S)(belie(f|ve)\s+in\s+allah|ta(u|w)h(e{1,2}|i)d|(تَوْحِيد|توحيد)?(ال)?)(?!\S)/i
}, {
	answer: '(Laylat-ul-Qadr) لیلة القدر',
	difficulty: "easy",
	question: "What makes the last ten nights of Ramadan significant?",
	regex: /(?<!\S)(la(i|y)la(h|t)?[\s-]{0,1}(a|u)l[\s-]qadr|لیلة\s+القدر)(?!\S)/i
}, {
	answer: '(Tahajjud) تهجد',
	difficulty: "easy",
	question: "What is another word for Qiyam-ul-layl (قـيـام الـلـيـل)?",
	regex: /(?<!\S)(tahajj?ud|تَهَجُّد|تهجد)(?!\S)/i
}, {
	answer: '(Eleven) أحد عشر',
	difficulty: "medium",
	question: "How many women did Muhammad ﷺ marry?",
	regex: /(?<!\S)((1|١){2}|eleven|أَحَدَ\s+عَشَرَ|أحد\s+عشر)(?!\S)/i
}, {
	answer: '(Khadijah) خديجة',
	difficulty: "medium",
	question: "Who was the first wife of Muhammad ﷺ?",
	regex: /(?<!\S)(khad(e{1,2}|i)jah?|خَدِيجَة|خديجة)(?!\S)/i
}, {
	answer: '(Ibaadah) عبادة',
	difficulty: "medium",
	question: "What is an Arabic term for the worship of Allah?",
	regex: /(?<!\S)((3|i)baa?dah?|عبادة)(?!\S)/i
}, {
	answer: 'Sob (😭)',
	difficulty: "unrated",
	question: "What is cal's favourite emoji?",
	regex: /(?<!\S)(😭|cry(ing)?|sob)(?!\S)/i
}], {
	random: {
		value(difficulty) {
			let entries = this;
			difficulty && (entries = entries.filter(({ difficulty: entryDifficulty }) => difficulty.toLowerCase() === entryDifficulty));
			// make it more difficult to roll harder-difficulty questions
			return entries[Math.floor(entries.length * Math.random())];
		}
	}
})