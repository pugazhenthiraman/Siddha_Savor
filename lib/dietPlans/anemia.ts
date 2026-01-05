import { DiagnosisDietPlan } from '@/lib/types/dietPlan';

export const anemiaDietPlan: DiagnosisDietPlan = {
  diagnosis: 'Anemia',
  description: 'A Siddha-based iron-rich diet plan to help manage anemia and boost hemoglobin levels',
  duration: 7,
  days: [
    {
      day: 1,
      meals: {
        breakfast: ['Ice biryani (pazhaya soru) with curd + sundal'],
        lunch: ['Native rice + drumstick sambar + keerai (green leaf)'],
        dinner: ['Vegetable upma + pomegranate'],
        notes: 'Pazhaya soru balances the three dosham and acts as a prebiotic improving gut health. Cooking keerai with salt and pepper is recommended for anemia. Drumstick improves general wellbeing. Mathulai (pomegranate) enhances blood.'
      },
      instructions: 'Monday - Focus on prebiotic foods and blood-enhancing fruits'
    },
    {
      day: 2,
      meals: {
        breakfast: ['Ragi porridge + palm jaggery'],
        lunch: ['Rice + murungai keerai (moringa leaves) kootu'],
        dinner: ['Idli + tomato chutney + green or black grapes'],
        notes: 'Palm jaggery improves Saaram and is rich in iron. Murungai keerai boosts hemoglobin.'
      },
      instructions: 'Tuesday - Iron-rich palm jaggery and hemoglobin-boosting moringa'
    },
    {
      day: 3,
      meals: {
        breakfast: ['Vegetable uthappam + mint chutney'],
        lunch: ['Millet rice + fish or chicken curry (optional) + beetroot poriyal'],
        dinner: ['Urud dhal adai made with banana, ghee and jaggery'],
        notes: 'Fish and egg strengthen muscles. Beetroot enriches hemoglobin levels.'
      },
      instructions: 'Wednesday - Protein boost with beetroot for hemoglobin enhancement'
    },
    {
      day: 4,
      meals: {
        breakfast: ['Ragi dosa + groundnut chutney'],
        lunch: ['Lemon rice + keerai (green leaf) masiyal'],
        dinner: ['Vegetable uthappam + mixed vegetable soup'],
        notes: 'Cooking keerai with salt and pepper is recommended for anemia. Citrus fruits like lemon enhance iron absorption.'
      },
      instructions: 'Thursday - Vitamin C from lemon to enhance iron absorption'
    },
    {
      day: 5,
      meals: {
        breakfast: ['Millet pongal + moong dhal sambar'],
        lunch: ['Native rice + avarakai (flat beans) poriyal'],
        dinner: ['Vegetable khichdi + athi (figs) with cow\'s milk'],
        notes: 'Figs are recommended for anemia. Millets balance Pitham.'
      },
      instructions: 'Friday - Figs for anemia management and Pitham balance'
    },
    {
      day: 6,
      meals: {
        breakfast: ['Adai dosa (dal-rich) + coriander chutney'],
        lunch: ['Thinai rice + murungakai (drumstick) sambar + buttermilk'],
        dinner: ['Poha upma (Aval) + coconut chutney + 1 orange'],
        notes: 'Citrus fruits enhance iron absorption. Dal is Thani Amilam and improves muscle strength. Drumstick enhances general wellbeing.'
      },
      instructions: 'Saturday - Dal for muscle strength with citrus for iron absorption'
    },
    {
      day: 7,
      meals: {
        breakfast: ['Idiyappam + vegetable kurma + nellikai (amla) juice'],
        lunch: ['Rice + mutton soup or paneer gravy'],
        dinner: ['Dosa + tomato chutney + 2 bananas'],
        notes: 'Mutton soup is a Siddha remedy for weakness. Nellikai is Kayakarpam, a blood purifier that enhances iron absorption.'
      },
      instructions: 'Sunday - Amla juice for blood purification and iron absorption'
    }
  ],
  generalInstructions: [
    'Millet Options: Thinai (foxtail millet), Varagu (kodo millet), Saamai (little millet)',
    'Native Rice Options: Jeeraga samba, Mapillai samba, Kowni rice, Red rice',
    'Green Leaf Options: Siru keerai, Paruppu keerai, Ponnangkanni keerai, Karisalakanni keerai',
    'Sundal Options: Pattani, Karamani, Groundnut (kadalai)',
    'Cook keerai with salt and pepper for maximum anemia benefits',
    'Include iron-rich foods with vitamin C sources to enhance absorption as per Siddha principles',
    'Seasonal fruits can be taken at night',
    'Palm jaggery is preferred over regular sugar for iron content',
    'Citrus fruits (lemon, orange, amla) enhance iron absorption',
    'Pazhaya soru (fermented rice) acts as prebiotic and balances doshas',
    'Figs and pomegranate are specifically recommended for anemia',
    'Follow Siddha principles: Balance Vatham, Pitham, and Kabam doshas',
    'Drink plenty of water and fresh juices throughout the day'
  ]
};
