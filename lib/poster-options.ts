// Editorial choices, not automatic festival-date calculations.
export const occasions = [
  { id: 'daily', en: 'Daily blessings', ta: 'இன்றைய இறைவழிபாடு', deity: 'ganesha' },
  { id: 'ekadashi', en: 'Ekadashi', ta: 'ஏகாதசி', deity: 'vishnu' },
  { id: 'pradosham', en: 'Pradosham', ta: 'பிரதோஷம்', deity: 'shiva' },
  { id: 'sashti', en: 'Sashti', ta: 'சஷ்டி', deity: 'murugan' },
  { id: 'chaturthi', en: 'Chaturthi', ta: 'சதுர்த்தி', deity: 'ganesha' },
  { id: 'krishna', en: 'Krishna Jayanti', ta: 'கிருஷ்ண ஜெயந்தி', deity: 'krishna' },
  { id: 'rama', en: 'Rama Navami', ta: 'ராம நவமி', deity: 'rama' },
  { id: 'custom', en: 'Custom occasion', ta: 'சிறப்பு வழிபாடு', deity: 'ganesha' },
] as const;
export const deities = [
  { id: 'ganesha', name: 'Ganesha / விநாயகர்', prompt: 'Lord Ganesha, elephant head, one broken tusk, four arms, modak and mouse vahana' },
  { id: 'vishnu', name: 'Vishnu / பெருமாள்', prompt: 'Lord Vishnu, four arms, shankha and chakra, traditional Vaishnava tilak' },
  { id: 'shiva', name: 'Shiva / சிவன்', prompt: 'Lord Shiva, crescent moon in matted hair, trident and Nandi' },
  { id: 'murugan', name: 'Murugan / முருகன்', prompt: 'Lord Murugan, youthful single face, sacred Vel spear and peacock vahana' },
  { id: 'krishna', name: 'Krishna / கிருஷ்ணர்', prompt: 'Lord Krishna, flute, peacock feather crown, blue skin' },
  { id: 'rama', name: 'Rama / ராமர்', prompt: 'Lord Rama, bow and quiver, traditional royal attire' },
  { id: 'lakshmi', name: 'Lakshmi / லட்சுமி', prompt: 'Goddess Lakshmi seated on a lotus, four arms, lotus flowers' },
  { id: 'durga', name: 'Durga / துர்க்கை', prompt: 'Goddess Durga with traditional attributes and lion vahana' },
] as const;
export const styles = ['Traditional temple painting', 'Devotional illustration', 'Elegant gold and cream'] as const;
