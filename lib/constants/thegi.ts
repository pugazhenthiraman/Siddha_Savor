export const THEGI_INFO = {
  VATHAM: {
    name: 'VATHAM',
    element: 'Air Element',
    description: 'The energy of movement',
    characteristics: [
      'Increased food intake but less energy availability',
      'Likes sweet, sour and salty foods',
      'Crepitation is seen while walking',
      'Likes hot food rather than cold food',
      'Presence of dry skin and dry hair with split ends'
    ],
    color: 'blue'
  },
  PITHAM: {
    name: 'PITHAM',
    element: 'Fire Element',
    description: 'The energy of digestion and metabolism',
    characteristics: [
      'Likes sweet, bitter and astringent foods',
      'Presence of increased sweating with foul smell',
      'Presence of oily skin and is prone to acne',
      'Excessive thirst'
    ],
    color: 'red'
  },
  KABAM: {
    name: 'KABAM',
    element: 'Water Element',
    description: 'The energy of lubrication and retention',
    characteristics: [
      'Decreased food intake but increased availability of energy',
      'Likes bitter, astringent and pungent foods',
      'Presence of smooth skin',
      'Excessive hunger'
    ],
    color: 'green'
  }
} as const;

export type ThegiType = keyof typeof THEGI_INFO;
