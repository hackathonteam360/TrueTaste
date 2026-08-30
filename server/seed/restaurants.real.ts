export interface SeedRestaurant {
  name: string;
  description: string;
  cuisine: string[];
  dishes: { name: string; price: number; description: string }[];
  priceLevel: 1 | 2 | 3 | 4;
  city: string;
  latitude: number;
  longitude: number;
  address: string;
  openingHours: string;
  isOpen: boolean;
  reviews: {
    text: string;
    rating: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    categories: {
      taste: number;
      service: number;
      ambience: number;
      value: number;
      cleanliness: number;
    };
    tags: string[];
  }[];
}

const cat = (
  taste: number,
  service: number,
  ambience: number,
  value: number,
  cleanliness: number
) => ({ taste, service, ambience, value, cleanliness });

const review = (
  text: string,
  rating: number,
  sentiment: 'positive' | 'neutral' | 'negative',
  categories: ReturnType<typeof cat>,
  tags: string[]
) => ({ text, rating, sentiment, categories, tags });

export const realRestaurants: SeedRestaurant[] = [
  {
    name: "Salt'n Pepper Restaurant",
    description:
      'A Lahore institution since 1983, serving classic Pakistani and continental dishes in a refined heritage setting.',
    cuisine: ['Pakistani', 'Continental'],
    dishes: [
      { name: 'Chicken Karahi', price: 1450, description: 'Signature wok-tossed karahi with hand-ground spices' },
      { name: 'Chicken Handi', price: 1550, description: 'Slow-cooked chicken in creamy tomato gravy' },
      { name: 'Beef Boti', price: 1750, description: 'Char-grilled beef boti skewers, seared over coals' },
      { name: 'Tandoori Roti', price: 60, description: 'Bleached in ghee, straight from the tandoor' },
      { name: 'Fruit Cream', price: 350, description: 'House dessert, layered fresh fruits and cream' },
    ],
    priceLevel: 3,
    city: 'Lahore',
    latitude: 31.493,
    longitude: 74.3465,
    address: 'MM Alam Road, Gulberg III, Lahore',
    openingHours: '12:00 PM - 12:30 AM',
    isOpen: true,
    reviews: [
      review(
        'The chicken karahi here is legendary. Rich, smoky and perfectly balanced. A truly memorable meal with great service.',
        5,
        'positive',
        cat(5, 4, 4, 3, 4),
        ['Great food', 'Friendly staff', 'Spicy']
      ),
      review(
        'Classic Lahore experience. Portions are generous and the handi is delicious. Gets crowded at dinner so book ahead.',
        4,
        'positive',
        cat(4, 4, 4, 4, 4),
        ['Great food', 'Good value']
      ),
      review(
        'A bit pricey for what you get but the beef boti is worth it. Ambience feels elegant and traditional.',
        4,
        'positive',
        cat(5, 4, 5, 3, 4),
        ['Great food', 'Nice ambience']
      ),
      review(
        'Waited around 25 minutes for a table on a Sunday. Food was good but service felt rushed.',
        3,
        'neutral',
        cat(4, 3, 3, 3, 4),
        ['Slow service']
      ),
    ],
  },
  {
    name: 'Coco Cubano',
    description:
      'Trendy café and grill on MM Alam Road known for juicy burgers, steaks and strong coffee in a lively streetside setting.',
    cuisine: ['Continental', 'Cafe'],
    dishes: [
      { name: 'Coco Burger', price: 950, description: 'House-ground beef patty with smoked cheddar and secret sauce' },
      { name: 'Beef Steak', price: 2200, description: 'Sizzling ribeye with mushroom gravy and fries' },
      { name: 'Chicken Alfredo', price: 1150, description: 'Creamy fettuccine with grilled chicken' },
      { name: 'Cappuccino', price: 450, description: 'Double-shot espresso with velvety microfoam' },
    ],
    priceLevel: 3,
    city: 'Lahore',
    latitude: 31.492,
    longitude: 74.3452,
    address: 'MM Alam Road, Gulberg III, Lahore',
    openingHours: '8:00 AM - 12:30 AM',
    isOpen: true,
    reviews: [
      review(
        'Best burger on MM Alam Road, hands down. Juicy patty, soft bun and fries on point. Coffee is great too.',
        5,
        'positive',
        cat(5, 4, 4, 3, 4),
        ['Great food', 'Great coffee']
      ),
      review(
        'Great vibe for a casual evening. The steak was cooked perfectly but the bill added up quickly.',
        4,
        'positive',
        cat(4, 4, 4, 3, 4),
        ['Great food', 'Nice ambience']
      ),
      review(
        'Crowded on weekends and the music is loud. Food is consistently good though.',
        4,
        'positive',
        cat(4, 3, 3, 3, 4),
        ['Great food']
      ),
    ],
  },
  {
    name: 'Butt Karahi',
    description:
      'One of Lahore’s most famous karahi houses on Food Street — a no-frills desi spot where the karahi is always the star.',
    cuisine: ['Pakistani'],
    dishes: [
      { name: 'Chicken Karahi', price: 1600, description: 'Whole chicken in fresh tomatoes, garlic and green chillies' },
      { name: 'Mutton Karahi', price: 2800, description: 'Tender mutton slow-cooked in the signature gravy' },
      { name: 'Roghni Naan', price: 120, description: 'Soft naan baked in a clay tandoor' },
      { name: 'Lassie', price: 200, description: 'Refreshing sweetened yogurt drink' },
    ],
    priceLevel: 1,
    city: 'Lahore',
    latitude: 31.5645,
    longitude: 74.3172,
    address: '22 Food Street, Lakshmi Chowk, Lahore',
    openingHours: '12:00 PM - 12:00 AM',
    isOpen: true,
    reviews: [
      review(
        'Simply the best karahi in Lahore. Fresh tomatoes, real desi ghee and that unbeatable coal flavour. Messy and perfect.',
        5,
        'positive',
        cat(5, 3, 3, 5, 3),
        ['Great food', 'Good value', 'Spicy']
      ),
      review(
        'Authentic desi experience. The mutton karahi melts off the bone. Crowded and chaotic but that is part of the charm.',
        5,
        'positive',
        cat(5, 3, 4, 5, 3),
        ['Great food', 'Good value']
      ),
      review(
        'Very tasty but seating is basic and it gets packed in the evening. Go early to avoid the rush.',
        4,
        'positive',
        cat(5, 3, 3, 4, 3),
        ['Great food']
      ),
      review(
        'Food was good, but service is chaotic and you wait a while. Worth it for the taste though.',
        3,
        'neutral',
        cat(4, 2, 3, 4, 3),
        ['Slow service']
      ),
    ],
  },
  {
    name: 'Bundu Khan',
    description:
      'Century-old Mughlai restaurant at Fortress Stadium, legendary for tandoori kebabs and traditional Pakistani cuisine.',
    cuisine: ['Pakistani', 'BBQ'],
    dishes: [
      { name: 'Chicken Tikka', price: 1150, description: 'Char-grilled chicken tikka, smoky and juicy' },
      { name: 'Mutton Chops', price: 2100, description: 'Marinated mutton chops flame-grilled to order' },
      { name: 'Seekh Kebab', price: 1050, description: 'Hand-minced beef kebabs with fresh herbs' },
      { name: 'Chicken Biryani', price: 750, description: 'Fragrant basmati biryani with spiced chicken' },
    ],
    priceLevel: 3,
    city: 'Lahore',
    latitude: 31.5189,
    longitude: 74.3424,
    address: 'Food Street, Fortress Stadium, Lahore',
    openingHours: '12:00 PM - 12:00 AM',
    isOpen: true,
    reviews: [
      review(
        'The chicken tikka is outstanding — smoky, juicy and perfectly spiced. A true Lahore tradition for a reason.',
        5,
        'positive',
        cat(5, 4, 4, 3, 4),
        ['Great food', 'Nice ambience']
      ),
      review(
        'Great kebabs and a lovely open-air seating area at Fortress. Slightly slow on busy nights.',
        4,
        'positive',
        cat(4, 3, 4, 3, 4),
        ['Great food', 'Nice ambience']
      ),
      review(
        'Legendary place but prices have crept up over the years. The chops are still worth it.',
        4,
        'positive',
        cat(4, 4, 4, 3, 4),
        ['Great food']
      ),
    ],
  },
  {
    name: 'Andaaz Restaurant',
    description:
      'Heritage-style Pakistani fine dining at Fortress Stadium with a view over a serene lake — perfect for family dinners.',
    cuisine: ['Pakistani'],
    dishes: [
      { name: 'Andaaz Paneer Karahi', price: 1650, description: 'Cottage cheese in a rich tomatoes-and-cream gravy' },
      { name: 'Malai Boti', price: 1450, description: 'Creamy marinated chicken boti griddled soft' },
      { name: 'Chicken Lahori', price: 1550, description: 'Home-style Lahori chicken curry' },
      { name: 'Gulab Jamun', price: 300, description: 'Warm dumplings soaked in rose syrup' },
    ],
    priceLevel: 3,
    city: 'Lahore',
    latitude: 31.5197,
    longitude: 74.3385,
    address: 'Fortress Stadium, Lahore',
    openingHours: '12:00 PM - 12:00 AM',
    isOpen: true,
    reviews: [
      review(
        'Beautiful setting overlooking the water. The paneer karahi is a standout and the service is warm and attentive.',
        5,
        'positive',
        cat(4, 5, 5, 4, 5),
        ['Great food', 'Nice ambience', 'Friendly staff']
      ),
      review(
        'Elegant atmosphere, perfect for a family celebration. Food is consistently delicious and well presented.',
        5,
        'positive',
        cat(5, 4, 5, 4, 5),
        ['Great food', 'Nice ambience']
      ),
      review(
        'Gorgeous views at sunset and the malai boti is fantastic. A little pricier than similar spots but worth it.',
        4,
        'positive',
        cat(4, 4, 5, 3, 5),
        ['Great food', 'Nice ambience']
      ),
    ],
  },
  {
    name: 'Haveli Restaurant',
    description:
      'Rooftop dining in the Old City with breathtaking views over Wazir Khan Mosque, serving authentic Lahori cuisine by night.',
    cuisine: ['Pakistani'],
    dishes: [
      { name: 'Chicken Karahi', price: 1500, description: 'Classic street-style karahi with fresh herbs' },
      { name: 'Daal Makhani', price: 700, description: 'Slow-simmered black lentils in butter and cream' },
      { name: 'Seekh Kebab', price: 1000, description: 'Charred beef kebabs with mint chutney' },
      { name: 'Kheer', price: 300, description: 'Traditional rice pudding served chilled' },
    ],
    priceLevel: 2,
    city: 'Lahore',
    latitude: 31.5844,
    longitude: 74.3233,
    address: 'Food Street, Old City, Lahore',
    openingHours: '5:00 PM - 12:00 AM',
    isOpen: true,
    reviews: [
      review(
        'The rooftop view of the Old City at night is magical. Food is solid traditional Lahori fare.',
        5,
        'positive',
        cat(4, 4, 5, 4, 4),
        ['Great food', 'Nice ambience']
      ),
      review(
        'Stunning scenery above Wazir Khan Mosque. The karahi is tasty but service slows down badly when full.',
        4,
        'positive',
        cat(4, 3, 5, 4, 4),
        ['Nice ambience']
      ),
      review(
        'Went for the view, stayed for the food. Reasonable prices for such a setting.',
        4,
        'positive',
        cat(4, 4, 5, 4, 4),
        ['Good value', 'Nice ambience']
      ),
    ],
  },
  {
    name: "Freddy's Cafe",
    description:
      'A Gulberg classic for over two decades — trusted for breakfast, continental classics and the famous Freddy’s chicken.',
    cuisine: ['Continental', 'Cafe'],
    dishes: [
      { name: "Freddy's Chicken", price: 1350, description: 'Their legendary honey-glazed fried chicken' },
      { name: 'Club Sandwich', price: 850, description: 'Triple-layer grilled sandwich with fries' },
      { name: 'Beef Stroganoff', price: 1750, description: 'Creamy mushroom sauce over rice' },
      { name: 'Brownie Sundae', price: 600, description: 'Warm brownie with vanilla ice cream' },
    ],
    priceLevel: 2,
    city: 'Lahore',
    latitude: 31.4898,
    longitude: 74.356,
    address: '43-C Main Boulevard, Gulberg III, Lahore',
    openingHours: '9:00 AM - 12:00 AM',
    isOpen: true,
    reviews: [
      review(
        "Freddy's chicken is comfort food perfection — sweet, sticky and juicy. A Gulberg institution that never disappoints.",
        5,
        'positive',
        cat(5, 4, 4, 4, 4),
        ['Great food', 'Good value']
      ),
      review(
        'Reliable for family breakfasts and brunches. Huge portions and friendly staff.',
        4,
        'positive',
        cat(4, 4, 4, 4, 4),
        ['Friendly staff', 'Great food']
      ),
      review(
        'A bit dated inside but the food is consistently good and the brownie sundae is a must.',
        4,
        'positive',
        cat(4, 4, 3, 4, 4),
        ['Great food']
      ),
    ],
  },
  {
    name: 'The Monal',
    description:
      'Well-loved for high-altitude views in Islamabad and a Gulberg outlet in Lahore — continental favourites and Pakistani grills.',
    cuisine: ['Pakistani', 'BBQ', 'Continental'],
    dishes: [
      { name: 'BBQ Platter', price: 2400, description: 'Mixed tandoori grill for sharing' },
      { name: 'Chicken Karahi', price: 1550, description: 'Classic karahi simmered with tomatoes and ginger' },
      { name: 'Chicken Barbeque', price: 1400, description: 'Charcoal-grilled classics with raita' },
      { name: 'Cold Coffee', price: 500, description: 'Blended iced coffee with whipped cream' },
    ],
    priceLevel: 3,
    city: 'Lahore',
    latitude: 31.55,
    longitude: 74.35,
    address: 'Main Boulevard, Gulberg III, Lahore',
    openingHours: '12:00 PM - 12:00 AM',
    isOpen: true,
    reviews: [
      review(
        'The BBQ platter is generous and delicious. Lovely family atmosphere, always a reliable choice.',
        5,
        'positive',
        cat(5, 4, 4, 4, 4),
        ['Great food', 'Good value']
      ),
      review(
        'Consistent quality and efficient service. Gets busy on weekends so expect a short wait.',
        4,
        'positive',
        cat(4, 4, 4, 4, 4),
        ['Great food']
      ),
      review(
        'Decent continental menu and good coffee. Nothing exceptional but always dependable.',
        3,
        'neutral',
        cat(3, 4, 4, 3, 4),
        ['Nice ambience']
      ),
    ],
  },
  {
    name: 'Howdy',
    description:
      'Smoky American-style BBQ in DHA, famous for slow-cooked ribs, loaded burgers and hearty Southern sides.',
    cuisine: ['BBQ', 'Fast Food'],
    dishes: [
      { name: 'BBQ Ribs', price: 2450, description: 'Slow-cooked ribs glazed with tangy house sauce' },
      { name: 'Howdy Burger', price: 1250, description: 'Double beef patty with cheddar and jalapeños' },
      { name: 'Loaded Fries', price: 800, description: 'Fries smothered in melted cheese and beef chilli' },
      { name: 'Smoked Chicken Wings', price: 950, description: 'Sticky honey-barbecue wings' },
    ],
    priceLevel: 2,
    city: 'Lahore',
    latitude: 31.474,
    longitude: 74.4,
    address: 'Y-Block, DHA Phase 3, Lahore',
    openingHours: '12:00 PM - 12:30 AM',
    isOpen: true,
    reviews: [
      review(
        'The ribs are unreal — fall-off-the-bone tender with that smoky flavour. A meat lover’s paradise.',
        5,
        'positive',
        cat(5, 4, 4, 3, 4),
        ['Great food']
      ),
      review(
        'Great burgers and wings, generous portions. The place gets packed on weekends.',
        4,
        'positive',
        cat(4, 4, 4, 4, 4),
        ['Great food', 'Good value']
      ),
      review(
        'Slightly slow service when full but the loaded fries and wings are worth the wait.',
        4,
        'positive',
        cat(4, 3, 4, 4, 4),
        ['Great food']
      ),
    ],
  },
  {
    name: 'Yum Chinese & Thai',
    description:
      'Long-running Gulberg favourite for Cantonese and Thai classics — spicy dry chicken and perfect fried rice.',
    cuisine: ['Chinese', 'Thai'],
    dishes: [
      { name: 'Spicy Dry Chicken', price: 1450, description: 'Wok-fried chicken with dried red chillies' },
      { name: 'Thai Green Curry', price: 1350, description: 'Aromatic coconut curry with jasmine rice' },
      { name: 'Chicken Fried Rice', price: 700, description: 'Smoky wok-fried rice with egg and spring onion' },
      { name: 'Chilli Garlic Noodles', price: 800, description: 'Stir-fried noodles with chilli garlic sauce' },
    ],
    priceLevel: 2,
    city: 'Lahore',
    latitude: 31.489,
    longitude: 74.348,
    address: 'MM Alam Road, Gulberg III, Lahore',
    openingHours: '12:00 PM - 12:30 AM',
    isOpen: true,
    reviews: [
      review(
        'The spicy dry chicken is addictive — wok-fired, crunchy and just the right heat. Best Chinese in Gulberg.',
        5,
        'positive',
        cat(5, 4, 4, 4, 4),
        ['Great food', 'Spicy']
      ),
      review(
        'Great Thai green curry and fried rice. Quick service and fair prices for the area.',
        4,
        'positive',
        cat(4, 4, 4, 4, 4),
        ['Great food', 'Good value']
      ),
      review(
        'Consistent favourite for years. The chilli garlic noodles are a solid pick.',
        4,
        'positive',
        cat(4, 4, 3, 4, 4),
        ['Great food']
      ),
    ],
  },
  {
    name: 'Monal Restaurant',
    description:
      'Escape the city at this famous Pir Sohawa landmark — panoramic Margalla views with Pakistani grills and continental classics.',
    cuisine: ['Pakistani', 'BBQ'],
    dishes: [
      { name: 'BBQ Platter', price: 2600, description: 'Signature mixed grill with views to match' },
      { name: 'Chicken Karahi', price: 1600, description: 'Tomato-rich karahi simmered to order' },
      { name: 'Mutton Raan', price: 3200, description: 'Slow-roasted leg of mutton, family size' },
      { name: 'Boneless Chicken Handi', price: 1650, description: 'Creamy Lahori-style handi' },
    ],
    priceLevel: 3,
    city: 'Islamabad',
    latitude: 33.7309,
    longitude: 72.9013,
    address: 'Pir Sohawa Road, Margalla Hills, Islamabad',
    openingHours: '12:00 PM - 11:00 PM',
    isOpen: true,
    reviews: [
      review(
        'Unforgettable views of Islamabad with genuinely good BBQ to match. The drive up is half the fun.',
        5,
        'positive',
        cat(5, 4, 5, 4, 4),
        ['Great food', 'Nice ambience']
      ),
      review(
        'Spectacular sunset spot. Food is good and portions generous, though it is packed on weekends.',
        4,
        'positive',
        cat(4, 3, 5, 4, 4),
        ['Nice ambience', 'Great food']
      ),
      review(
        'The setting is world-class. Karahi is tasty and the service is decent given how busy it gets.',
        4,
        'positive',
        cat(4, 4, 5, 4, 4),
        ['Great food', 'Nice ambience']
      ),
    ],
  },
  {
    name: 'Savour Foods',
    description:
      'Islamabad’s famous name for biryani and pulao — queues out the door for the signature chicken biryani.',
    cuisine: ['Pakistani'],
    dishes: [
      { name: 'Chicken Biryani', price: 550, description: 'The famous sealed-pot biryani with raita' },
      { name: 'Chicken Pulao', price: 500, description: 'Fragrant rice with tender chicken and whole spices' },
      { name: 'Mutton Pulao', price: 900, description: 'Slow-cooked mutton over aromatic rice' },
      { name: 'Tandoori Chicken', price: 900, description: 'Flash-grilled chicken straight from the tandoor' },
    ],
    priceLevel: 1,
    city: 'Islamabad',
    latitude: 33.498,
    longitude: 73.055,
    address: 'I-8 Markaz, Islamabad',
    openingHours: '11:00 AM - 11:00 PM',
    isOpen: true,
    reviews: [
      review(
        'The biryani is worth every minute of the queue — fluffy rice, perfect spice and generous chicken. Superb value.',
        5,
        'positive',
        cat(5, 3, 3, 5, 3),
        ['Great food', 'Good value']
      ),
      review(
        'Fast and delicious. The chicken pulao is a standout and the tandoori chicken pairs perfectly.',
        4,
        'positive',
        cat(4, 4, 3, 5, 3),
        ['Great food', 'Good value']
      ),
      review(
        'Long queues at lunchtime but it moves fast. Great desi food at unbeatable prices.',
        4,
        'positive',
        cat(4, 3, 3, 5, 3),
        ['Good value']
      ),
    ],
  },
  {
    name: 'Chaaye Khana',
    description:
      'An F-7 institution for chai, comfort food and desserts — the cosy spot where Islamabad catches up over cups of tea.',
    cuisine: ['Cafe', 'Desserts'],
    dishes: [
      { name: 'Kashmiri Chai', price: 250, description: 'Pink salty-sweet chai served steaming hot' },
      { name: 'Chicken Sandwich', price: 650, description: 'Grilled chicken and aioli on sourdough' },
      { name: 'Honey Cake', price: 450, description: 'Sticky honey layer cake with walnuts' },
      { name: 'Doodh Patti', price: 220, description: 'Strong brewed-milk chai, the house favourite' },
    ],
    priceLevel: 2,
    city: 'Islamabad',
    latitude: 33.705,
    longitude: 73.051,
    address: 'F-7 Markaz, Islamabad',
    openingHours: '9:00 AM - 1:00 AM',
    isOpen: true,
    reviews: [
      review(
        'The Kashmiri chai and honey cake are perfection. Cozy, artsy vibe — the perfect place to unwind.',
        5,
        'positive',
        cat(4, 4, 5, 4, 4),
        ['Nice ambience', 'Great coffee', 'Great food']
      ),
      review(
        'Always busy but always worth it. Doodh patti done right and lovely desserts.',
        4,
        'positive',
        cat(4, 4, 4, 4, 4),
        ['Great food', 'Nice ambience']
      ),
      review(
        'Great spot for chai with friends. Service can be a little slow when it fills up.',
        4,
        'positive',
        cat(4, 3, 5, 4, 4),
        ['Nice ambience']
      ),
    ],
  },
  {
    name: 'Des Pardes',
    description:
      'A desi-food mainstay since 1988, famous for Lahori karahis, parathas and house-made lassi in a warm traditional interior.',
    cuisine: ['Pakistani'],
    dishes: [
      { name: 'Chicken Karahi', price: 1500, description: 'Their famous desi karahi with fresh tomatoes' },
      { name: 'Chicken Cook', price: 1450, description: 'A Des Pardes speciality — spiced chicken in butter' },
      { name: 'Malai Boti', price: 1350, description: 'Cream-marinated chicken, gently cooked' },
      { name: 'Desi Ghee Paratha', price: 150, description: 'Flaky paratha fried in pure ghee' },
    ],
    priceLevel: 2,
    city: 'Islamabad',
    latitude: 33.6935,
    longitude: 73.046,
    address: '22-B School Road, F-6 Markaz, Islamabad',
    openingHours: '12:00 PM - 12:00 AM',
    isOpen: true,
    reviews: [
      review(
        'The chicken cook is unlike anything else — buttery, rich and delicious. A true Islamabad classic.',
        5,
        'positive',
        cat(5, 4, 4, 4, 4),
        ['Great food', 'Good value']
      ),
      review(
        'Old-school desi cooking done right. Karahi and paratha are superb, staff are welcoming.',
        4,
        'positive',
        cat(4, 4, 4, 5, 4),
        ['Great food', 'Friendly staff']
      ),
      review(
        'Reliable, homely and tasty. The malai boti is creamy and soft. Slightly dated interior but full of character.',
        4,
        'positive',
        cat(4, 4, 3, 5, 4),
        ['Great food', 'Good value']
      ),
    ],
  },
  {
    name: 'China Grill',
    description:
      'Established Blue Area favourite for Cantonese and Szechuan classics, from crispy honey chicken to fiery stir-fries.',
    cuisine: ['Chinese'],
    dishes: [
      { name: 'Honey Chicken', price: 1250, description: 'Crispy fried chicken tossed in glossy honey glaze' },
      { name: 'Chicken Manchurian', price: 1250, description: 'Wok-tossed chicken in spicy soy-garlic sauce' },
      { name: 'Beef with Vegetables', price: 1550, description: 'Velveted beef stir-fried with crunchy greens' },
      { name: 'Egg Fried Rice', price: 650, description: 'Classic bed of wok-fried rice' },
    ],
    priceLevel: 2,
    city: 'Islamabad',
    latitude: 33.711,
    longitude: 73.053,
    address: '1-E Blue Area, Islamabad',
    openingHours: '12:00 PM - 11:30 PM',
    isOpen: true,
    reviews: [
      review(
        'The honey chicken is the best in town — crispy, sticky and moreish. An Islamabad classic for good reason.',
        5,
        'positive',
        cat(5, 4, 4, 4, 4),
        ['Great food', 'Good value']
      ),
      review(
        'Solid Cantonese food with generous portions. The manchurian packs a nice punch.',
        4,
        'positive',
        cat(4, 4, 3, 4, 4),
        ['Great food']
      ),
      review(
        'No-frills but dependable. Beef with vegetables is fresh and well seasoned.',
        4,
        'positive',
        cat(4, 4, 3, 4, 4),
        ['Great food']
      ),
    ],
  },
  {
    name: 'Kolachi Restaurant',
    description:
      'Iconic Clifton eatery where classic Pakistani cooking meets the sea breeze — famous for BBQ, fish and family dining.',
    cuisine: ['Pakistani', 'BBQ', 'Seafood'],
    dishes: [
      { name: 'BBQ Platter', price: 2700, description: 'Mixed grill for sharing, flame-charred' },
      { name: 'Grilled Fish', price: 2200, description: 'Whole pomfret marinated and char-grilled' },
      { name: 'Chicken Karahi', price: 1500, description: 'Classic tomato karahi, bolder by the sea' },
      { name: 'Kashmiri Pulao', price: 900, description: 'Aromatic rice with nuts and dry fruits' },
    ],
    priceLevel: 3,
    city: 'Karachi',
    latitude: 24.814,
    longitude: 67.03,
    address: 'Khayaban-e-Shahbaz, Clifton, Karachi',
    openingHours: '12:00 PM - 12:00 AM',
    isOpen: true,
    reviews: [
      review(
        'A Karachi institution. The BBQ platter is generously portioned and the sea breeze makes it magical at dusk.',
        5,
        'positive',
        cat(5, 4, 5, 4, 4),
        ['Great food', 'Nice ambience']
      ),
      review(
        'Been coming for years. Fish is always fresh, kebabs are smoky and the family atmosphere is unbeatable.',
        5,
        'positive',
        cat(5, 4, 5, 4, 4),
        ['Great food', 'Nice ambience', 'Friendly staff']
      ),
      review(
        'Busy on weekends but worth it. The grilled pomfret is superb, service is attentive.',
        4,
        'positive',
        cat(4, 4, 4, 4, 4),
        ['Great food']
      ),
    ],
  },
  {
    name: 'BBQ Tonight',
    description:
      'Karachi’s best-known name in barbecue — an open-kitchen grill house on Clifton where the seekh kebabs never stop coming.',
    cuisine: ['BBQ', 'Pakistani'],
    dishes: [
      { name: 'Seekh Kebab', price: 900, description: 'Hand-rolled beef kebabs, charred in the show kitchen' },
      { name: 'Chicken Tikka', price: 1150, description: 'Chunky chicken pieces marinated and flame-grilled' },
      { name: 'Malai Boti', price: 1250, description: 'Creamy, mildly spiced chicken boti' },
      { name: 'BBQ Roomali', price: 100, description: 'Paper-thin bread, warm from the grill' },
    ],
    priceLevel: 3,
    city: 'Karachi',
    latitude: 24.8095,
    longitude: 67.0335,
    address: 'Khayaban-e-Shahbaz, Clifton, Karachi',
    openingHours: '12:00 PM - 1:00 AM',
    isOpen: true,
    reviews: [
      review(
        'This is what Karachi BBQ is all about. Kebabs fresh off the grill, smoky, juicy and fast.',
        5,
        'positive',
        cat(5, 4, 4, 3, 4),
        ['Great food']
      ),
      review(
        'The open kitchen is the main event — watch your food cook and it arrives perfectly charred. Always busy.',
        4,
        'positive',
        cat(4, 4, 4, 3, 4),
        ['Great food', 'Nice ambience']
      ),
      review(
        'Great tikka and kebabs, fair prices. Gets crowded so come early or expect a wait.',
        4,
        'positive',
        cat(4, 3, 4, 4, 4),
        ['Great food', 'Good value']
      ),
    ],
  },
  {
    name: 'Do Darya Food Street',
    description:
      'A stretch of open-air seafood restaurants right on the Clifton waterfront — fresh catch, barbecue and the sound of the waves.',
    cuisine: ['Seafood', 'BBQ', 'Pakistani'],
    dishes: [
      { name: 'Barbecued Lobster', price: 4200, description: 'Fresh lobster flame-grilled with garlic butter' },
      { name: 'Prawn Karahi', price: 2400, description: 'Jumbo prawns in spicy tomato gravy' },
      { name: 'BBQ Fish', price: 1800, description: 'Local catch charred over coals' },
      { name: 'Chicken Tikka', price: 950, description: 'Classic charcoal tikka with mint chutney' },
    ],
    priceLevel: 2,
    city: 'Karachi',
    latitude: 24.8015,
    longitude: 67.027,
    address: 'Do Darya, Khayaban-e-Sehar, Clifton, Karachi',
    openingHours: '4:00 PM - 12:30 AM',
    isOpen: true,
    reviews: [
      review(
        'Dinner with the sea breeze and fresh seafood — the prawn karahi is outstanding. A proper Karachi experience.',
        5,
        'positive',
        cat(5, 4, 5, 3, 4),
        ['Great food', 'Nice ambience']
      ),
      review(
        'Great place for an evening out. The BBQ fish is fresh and the open-air vibe is unbeatable.',
        4,
        'positive',
        cat(4, 4, 5, 3, 4),
        ['Great food', 'Nice ambience']
      ),
      review(
        'Food is excellent but prices are on the higher side for seafood. Worth it for the atmosphere.',
        4,
        'positive',
        cat(4, 4, 5, 3, 4),
        ['Nice ambience']
      ),
    ],
  },
  {
    name: 'Boat Basin BBQ',
    description:
      'Karachi’s beloved nightly food street by the Boat Basin — bare-bones stalls serving sensational kebabs and karahi.',
    cuisine: ['BBQ', 'Pakistani'],
    dishes: [
      { name: 'Chicken Tikka', price: 700, description: 'Street-style tikka, smoky and spicy' },
      { name: 'Beef Seekh Kebab', price: 650, description: 'Freshly minced kebabs with green chutney' },
      { name: 'Chicken Karahi', price: 1200, description: 'Pot-cooked karahi bursting with flavour' },
      { name: 'Tandoori Naan', price: 100, description: 'Fresh naan from the clay oven' },
    ],
    priceLevel: 1,
    city: 'Karachi',
    latitude: 24.8167,
    longitude: 67.0512,
    address: 'Khayaban-e-Iqbal, Boat Basin, Karachi',
    openingHours: '5:00 PM - 1:00 AM',
    isOpen: true,
    reviews: [
      review(
        'Street food at its absolute best. The chicken tikka is smoky, charred and ridiculously good for the price.',
        5,
        'positive',
        cat(5, 3, 4, 5, 3),
        ['Great food', 'Good value', 'Spicy']
      ),
      review(
        'Classic late-night fix. Grab a table, order kebabs and karahi, and you will leave very happy.',
        4,
        'positive',
        cat(4, 3, 4, 5, 3),
        ['Good value', 'Great food']
      ),
      review(
        'Simple, loud, delicious. Not the place for fancy dining but unbeatable for flavour.',
        4,
        'positive',
        cat(4, 3, 3, 5, 3),
        ['Great food', 'Good value']
      ),
    ],
  },
  {
    name: 'Café Aylanto',
    description:
      'Karachi’s long-running fine-dining name — Mediterranean, Italian and continental dishes with impeccable service.',
    cuisine: ['Italian', 'Continental', 'Mediterranean'],
    dishes: [
      { name: 'NZ Lamb Chops', price: 4200, description: 'Pan-seared lamb with rosemary jus' },
      { name: 'Margherita Pizza', price: 1400, description: 'Hand-stretched dough, San Marzano tomatoes' },
      { name: 'Chicken Milanese', price: 1850, description: 'Crisp breaded chicken with lemon butter sauce' },
      { name: 'Tiramisu', price: 900, description: 'Classic Italian dessert, made in-house' },
    ],
    priceLevel: 3,
    city: 'Karachi',
    latitude: 24.8115,
    longitude: 67.032,
    address: 'Khayaban-e-Bukhari, DHA Phase 5, Karachi',
    openingHours: '12:00 PM - 11:30 PM',
    isOpen: true,
    reviews: [
      review(
        'Easily one of Karachi’s best restaurants. The lamb chops are superb and the service is genuinely impeccable.',
        5,
        'positive',
        cat(5, 5, 5, 3, 5),
        ['Great food', 'Friendly staff', 'Nice ambience']
      ),
      review(
        'Fine dining done right. Perfect for a special occasion, with a lovely quiet ambience.',
        5,
        'positive',
        cat(5, 4, 5, 3, 5),
        ['Great food', 'Nice ambience']
      ),
      review(
        'Beautiful food and presentation. On the expensive side, but a special treat.',
        4,
        'positive',
        cat(4, 4, 5, 3, 5),
        ['Great food', 'Nice ambience']
      ),
    ],
  },
];