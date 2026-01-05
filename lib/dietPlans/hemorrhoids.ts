import { DiagnosisDietPlan } from '@/lib/types/dietPlan';

export const hemorrhoidsDietPlan: DiagnosisDietPlan = {
  diagnosis: 'Hemorrhoids',
  description: 'A Siddha-based high-fiber diet plan to help manage hemorrhoids and promote digestive health',
  duration: 7,
  days: [
    {
      day: 1,
      meals: {
        breakfast: ['Ragi porridge + banana'],
        lunch: ['Red rice + Mullangi (Radish) sambar + beetroot/kovakai (scarlet gourd) poriyal'],
        dinner: ['Vegetable khichdi'],
        notes: 'Ragi cools Pitham; Radish softens stool.'
      },
      instructions: 'Monday - Focus on Pitham-cooling foods and stool-softening radish'
    },
    {
      day: 2,
      meals: {
        breakfast: ['Idli + garlic chutney'],
        lunch: ['Millet rice + moong dal + senai kilangu (elephant foot yam) masiyal'],
        dinner: ['Wheat chapati + bottle gourd gravy'],
        notes: 'Yam is a promising vegetable prescribed in Siddha medicine. Ash gourd is a top cooling food.'
      },
      instructions: 'Tuesday - Therapeutic yam and cooling ash gourd'
    },
    {
      day: 3,
      meals: {
        breakfast: ['Wheat upma + papaya'],
        lunch: ['Native rice + pumpkin sambar + vazhai poo (plantain flower) poriyal'],
        dinner: ['Veg soup + 2 chapatis'],
        notes: 'Pumpkin aids easy stool passage. Astringent taste of vazhai poo reduces bleeding in hemorrhoids.'
      },
      instructions: 'Wednesday - Fiber-rich papaya and bleeding-reducing plantain flower'
    },
    {
      day: 4,
      meals: {
        breakfast: ['Millet pongal (less spice)'],
        lunch: ['Rice + drumstick sambar + green leaf'],
        dinner: ['Rice kanji + boiled veg'],
        notes: 'Green leaves are rich in fiber content.'
      },
      instructions: 'Thursday - High-fiber green leaves for digestive health'
    },
    {
      day: 5,
      meals: {
        breakfast: ['Sago (Javvarisi) porridge/ native rice porridge'],
        lunch: ['Native rice + mor kuzhambu + karunai kilangu (yam) masiyal'],
        dinner: ['Millet dosa + veg kurma'],
        notes: 'Yam is a promising vegetable prescribed in Siddha medicine.'
      },
      instructions: 'Friday - Therapeutic yam with digestive buttermilk curry'
    },
    {
      day: 6,
      meals: {
        breakfast: ['Overnight soaked raisins'],
        lunch: ['Millet rice + dal + lady\'s finger poriyal'],
        dinner: ['Wheat dosa + tomato soup'],
        notes: 'Lady\'s finger helps soften stools.'
      },
      instructions: 'Saturday - Fiber-rich raisins and stool-softening okra'
    },
    {
      day: 7,
      meals: {
        breakfast: ['Ragi idiyappam + coconut milk'],
        lunch: ['Millet vegetable biryani (mild spice) + onion raita/ chicken soup with less spices'],
        dinner: ['Light kanji + mashed veggies'],
        notes: 'Coconut milk soothes intestines.'
      },
      instructions: 'Sunday - Intestine-soothing coconut milk with mild spices'
    }
  ],
  generalInstructions: [
    'Millet Options: Thinai (foxtail millet), Varagu (kodo millet), Saamai (little millet)',
    'Native Rice Options: Jeeraga samba, Mapillai samba, Kowni rice, Red rice',
    'Green Leaf Options: Siru keerai, Paruppu keerai, Ponnangkanni keerai, Karisalakanni keerai, Venthaya keerai, Thandu keerai',
    'Foods that increase Pitham must be avoided',
    'Avoid foods that are highly sour or spicy taste',
    'Foods that are rich in fiber content can be included',
    'Adding ghee in your food is beneficial',
    'Fruits rich in fiber can be included in your meal',
    'Radish and lady\'s finger help soften stools naturally',
    'Yam (elephant foot yam) is specifically prescribed in Siddha medicine for hemorrhoids',
    'Plantain flower\'s astringent taste reduces bleeding',
    'Pumpkin aids easy stool passage',
    'Coconut milk soothes intestines and reduces inflammation',
    'Green leafy vegetables provide essential fiber for digestive health',
    'Ragi helps cool Pitham dosha',
    'Use mild spices and avoid excessive heat-generating foods',
    'Stay well-hydrated and include cooling foods regularly'
  ]
};
