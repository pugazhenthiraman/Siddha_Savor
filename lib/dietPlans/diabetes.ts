import { DiagnosisDietPlan } from '@/lib/types/dietPlan';

export const diabetesDietPlan: DiagnosisDietPlan = {
  diagnosis: 'Diabetes Mellitus',
  description: 'A Siddha-based diet plan to help manage blood sugar levels naturally',
  duration: 7,
  days: [
    {
      day: 1,
      meals: {
        breakfast: ['Ragi kali + groundnut chutney'],
        lunch: ['Native rice + keerai sambar + pavakkai (bitter gourd) poriyal'],
        dinner: ['Millet upma + vegetable soup'],
        notes: 'Pavakkai reduces sugar; millets regulate Pitham and have low glycemic index.'
      },
      instructions: 'Monday - Focus on bitter gourd and millets for blood sugar control'
    },
    {
      day: 2,
      meals: {
        breakfast: ['Kambu (pearl millet) porridge (unsweetened)'],
        lunch: ['Chapati + green gram dal + keerai (green leaves)'],
        dinner: ['Ragi dosa + groundnut chutney'],
        notes: 'Kambu improves Saaram and lowers glucose. Ragi controls Neerizhivu (diabetes) as per Siddha texts. Cooking keerai with salt and pepper is recommended.'
      },
      instructions: 'Tuesday - Pearl millet and ragi for diabetes management'
    },
    {
      day: 3,
      meals: {
        breakfast: ['Adai (dal dosa) + mint chutney'],
        lunch: ['Thinai rice + avaraikai (flat beans) sambar + kovakkai (scarlet gourd) poriyal'],
        dinner: ['Sundal vegetable salad'],
        notes: 'Kovakkai controls Neerizhivu (diabetes) as per Siddha texts. Sundal is a good protein source; vegetables provide fiber.'
      },
      instructions: 'Wednesday - Protein-rich day with scarlet gourd benefits'
    },
    {
      day: 4,
      meals: {
        breakfast: ['Ragi idiyappam + vegetable kurma'],
        lunch: ['Native rice + rasam + suraikai (bottle gourd) poriyal'],
        dinner: ['Poha upma (Aval) + coconut chutney'],
        notes: 'Ragi controls Neerizhivu (diabetes) as per Siddha texts. Ash gourd is cooling and balances Pitham.'
      },
      instructions: 'Thursday - Cooling foods to balance Pitham'
    },
    {
      day: 5,
      meals: {
        breakfast: ['Broken samba wheat upma + sprouts salad'],
        lunch: ['Ponni rice + brinjal sambar + keerai (green leaves)'],
        dinner: ['Uthappam + vegetable curry'],
        notes: 'Keerai supports glucose control.'
      },
      instructions: 'Friday - Green leafy vegetables for glucose support'
    },
    {
      day: 6,
      meals: {
        breakfast: ['Thinai dosa + coconut chutney + 1 boiled egg or paneer'],
        lunch: ['Native rice + pavakkai (bitter gourd) fry + moong dal'],
        dinner: ['Sundal + vegetable salad'],
        notes: 'Bitter gourd supports pancreas naturally. Sundal is rich in protein; vegetable salad provides fiber to help reduce diabetes.'
      },
      instructions: 'Saturday - Protein boost with bitter gourd for pancreas support'
    },
    {
      day: 7,
      meals: {
        breakfast: ['Overnight soaked venthayam (fenugreek) water + 2 idli + tomato chutney'],
        lunch: ['Ponni rice + drumstick sambar + snake gourd poriyal'],
        dinner: ['Vegetable soup + chapatti + 1 boiled egg'],
        notes: 'Drumstick improves Saaram. Millets regulate Pitham and have low glycemic index.'
      },
      instructions: 'Sunday - Fenugreek water and drumstick for Saaram improvement'
    }
  ],
  generalInstructions: [
    'Native Rice Options: Jeeraga samba, Mapillai samba, Kowni rice, Red rice',
    'Ponni rice can be taken twice a week only',
    'Millet Options: Thinai (foxtail millet), Varagu (kodo millet), Saamai (little millet)',
    'Sundal Options: Pattani (peas), Karamani, Kadalai (groundnut)',
    'Keerai Options: Siru keerai, Paruppu keerai, Mulai keerai, Ponnangkanni keerai, Karisalakanni keerai, Pasalai keerai, Agathi keerai, Keerai thandu',
    'Agathi keerai can be taken once a month',
    'Mulai keerai is good for geriatric population',
    'Keerai thandu is rich in fiber content',
    'Seasonal fruits like guava and naaval pazham (Indian blackberry) can be taken at night',
    'Follow Siddha principles: Balance Vatham, Pitham, and Kabam doshas',
    'Drink plenty of water throughout the day',
    'Avoid refined sugars and processed foods'
  ]
};
