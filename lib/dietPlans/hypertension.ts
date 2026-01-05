import { DiagnosisDietPlan } from '@/lib/types/dietPlan';

export const hypertensionDietPlan: DiagnosisDietPlan = {
  diagnosis: 'Hypertension',
  description: 'A Siddha-based heart-healthy diet plan to help manage blood pressure naturally',
  duration: 7,
  days: [
    {
      day: 1,
      meals: {
        breakfast: ['Fermented rice (overnight soaked rice) with curd'],
        lunch: ['Native rice + ash gourd sambar + green leafy vegetable stir-fry + raw banana stir-fry'],
        dinner: ['Millet upma + vegetable soup + figs + 1 glass of cow milk'],
        notes: 'Ash gourd reduces Pitham. Hibiscus leaves and Centella asiatica are beneficial for hypertension.'
      },
      instructions: 'Monday - Focus on Pitham-reducing foods and fermented rice'
    },
    {
      day: 2,
      meals: {
        breakfast: ['Sago porridge or native rice porridge'],
        lunch: ['Millet rice + moong dal + cucumber curry + buttermilk'],
        dinner: ['Idli + mint chutney + 1 glass of cow milk'],
        notes: 'Porridge helps maintain blood pressure. Cucumber cools Vatham and Pitham.'
      },
      instructions: 'Tuesday - Cooling foods with porridge for blood pressure control'
    },
    {
      day: 3,
      meals: {
        breakfast: ['Ragi porridge (unsalted)'],
        lunch: ['Rice + drumstick sambar + flat beans stir-fry + buttermilk'],
        dinner: ['2 bananas + wheat chapati + bottle gourd curry + 1 glass of cow milk'],
        notes: 'Ragi porridge maintains Pitham. Drumstick supports circulation. Flat beans are considered pathiya unavu.'
      },
      instructions: 'Wednesday - Pathiya unavu (therapeutic foods) for circulation'
    },
    {
      day: 4,
      meals: {
        breakfast: ['Vegetable uthappam + 1 boiled egg'],
        lunch: ['Low-salt millet vegetable biryani + onion raita'],
        dinner: ['Millet idiyappam + mixed vegetable gravy + amla juice + 1 glass of cow milk'],
        notes: 'Amla reduces Pitham. Onion supports lowering blood pressure.'
      },
      instructions: 'Thursday - Amla and onion for natural blood pressure support'
    },
    {
      day: 5,
      meals: {
        breakfast: ['Ragi dosa + onion chutney'],
        lunch: ['Low-salt millet curd rice + beetroot'],
        dinner: ['Tomato soup + 2 chapatis + 1 glass of cow milk'],
        notes: 'Low-salt curd cools Pitham. Onion supports blood pressure control.'
      },
      instructions: 'Friday - Low-salt preparations with Pitham-cooling foods'
    },
    {
      day: 6,
      meals: {
        breakfast: ['Wheat dosa + garlic chutney'],
        lunch: ['Rice + sambar + brinjal stir-fry + green leafy vegetable mash'],
        dinner: ['Flattened rice (poha) upma with lemon juice + 2 bananas + 1 glass of cow milk'],
        notes: 'Garlic helps reduce blood pressure. Brinjal is pathiya unavu. Sour-tasting poha reduces Pitha disorders. Hibiscus leaves and Centella asiatica are beneficial for hypertension.'
      },
      instructions: 'Saturday - Garlic and therapeutic foods for blood pressure management'
    },
    {
      day: 7,
      meals: {
        breakfast: ['Pongal with ghee + coconut chutney or moong dal sambar'],
        lunch: ['Rice with mutton or quail gravy OR paneer gravy'],
        dinner: ['Vegetable khichdi (low salt) + pineapple + 1 glass of milk'],
        notes: 'Mutton and quail are pathiya unavu that help maintain blood pressure. Pineapple reduces Pitha disorders.'
      },
      instructions: 'Sunday - Pathiya unavu proteins with Pitha-reducing fruits'
    }
  ],
  generalInstructions: [
    'Millet Options: Foxtail millet, Kodo millet, Little millet',
    'Native Rice Options: Jeeraga samba rice, Mapillai samba rice, Kowni rice, Red rice',
    'Green Leafy Vegetables: Amaranth greens, Red amaranth, Alternanthera sessilis, Balloon vine spinach',
    'Avoid foods that increase Pitham dosha',
    'Reduce highly sour, spicy, and astringent foods',
    'Include foods that improve hemoglobin levels',
    'Use low-salt preparations throughout the diet',
    'Fermented rice helps balance doshas and maintain blood pressure',
    'Cooling foods like cucumber, ash gourd, and buttermilk are beneficial',
    'Pathiya unavu (therapeutic foods) like flat beans, brinjal, mutton are recommended',
    'Garlic and onion naturally support blood pressure reduction',
    'Amla juice helps reduce Pitham and supports circulation',
    'If non-vegetarian, mutton liver soup may be included',
    'Hibiscus leaves and Centella asiatica are beneficial herbs for hypertension',
    'Follow Siddha principles: Focus on reducing Pitham dosha',
    'Drink plenty of water and avoid excessive salt intake'
  ]
};
