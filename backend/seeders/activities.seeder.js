'use strict';

const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../src/config/db.config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Fetch city IDs from DB
    const [cities] = await sequelize.query('SELECT id, name FROM cities');
    const cityMap = {};
    cities.forEach((c) => { cityMap[c.name] = c.id; });

    const now = new Date();

    const activities = [
      // Tokyo
      { city: 'Tokyo', name: 'Shibuya Crossing Visit', type: 'sightseeing', cost: 0, duration_minutes: 60, description: 'Experience the world\'s busiest pedestrian crossing at the iconic Shibuya scramble.' },
      { city: 'Tokyo', name: 'Tsukiji Outer Market Food Tour', type: 'food', duration_minutes: 120, cost: 2905, description: 'Sample fresh sushi, tamagoyaki, and street snacks at the famous Tsukiji Market.' },
      { city: 'Tokyo', name: 'Senso-ji Temple Visit', type: 'culture', cost: 0, duration_minutes: 90, description: 'Visit Tokyo\'s oldest and most significant Buddhist temple in Asakusa.' },
      { city: 'Tokyo', name: 'TeamLab Borderless', type: 'culture', cost: 2656, duration_minutes: 180, description: 'Immerse yourself in stunning digital art installations at this world-famous museum.' },
      { city: 'Tokyo', name: 'Shinjuku Izakaya Pub Crawl', type: 'food', cost: 4150, duration_minutes: 240, description: 'Explore the vibrant Golden Gai and Kabukicho areas with drinks and Japanese small plates.' },

      // Kyoto
      { city: 'Kyoto', name: 'Fushimi Inari Shrine Hike', type: 'sightseeing', cost: 0, duration_minutes: 180, description: 'Walk through thousands of vermilion torii gates winding up the sacred Mount Inari.' },
      { city: 'Kyoto', name: 'Arashiyama Bamboo Grove', type: 'sightseeing', cost: 0, duration_minutes: 60, description: 'Stroll through an ethereal pathway of towering bamboo stalks in western Kyoto.' },
      { city: 'Kyoto', name: 'Traditional Tea Ceremony', type: 'culture', cost: 3735, duration_minutes: 90, description: 'Participate in an authentic Japanese tea ceremony with a kimono-clad host.' },
      { city: 'Kyoto', name: 'Nishiki Market Tasting', type: 'food', cost: 2075, duration_minutes: 120, description: 'Sample pickles, tofu, skewered seafood, and regional specialties at Kyoto\'s "kitchen."' },
      { city: 'Kyoto', name: 'Kinkaku-ji Golden Pavilion', type: 'sightseeing', cost: 415, duration_minutes: 90, description: 'See the breathtaking Zen Buddhist temple covered entirely in gold leaf.' },

      // Bangkok
      { city: 'Bangkok', name: 'Grand Palace & Wat Phra Kaew', type: 'sightseeing', cost: 1494, duration_minutes: 180, description: 'Thailand\'s most visited site — a dazzling complex of halls, pavilions, and the Emerald Buddha.' },
      { city: 'Bangkok', name: 'Chatuchak Weekend Market', type: 'shopping', cost: 0, duration_minutes: 240, description: 'One of the world\'s largest markets with 15,000 stalls of everything imaginable.' },
      { city: 'Bangkok', name: 'Thai Cooking Class', type: 'food', cost: 3320, duration_minutes: 240, description: 'Learn to make pad thai, tom yum, and mango sticky rice from local chefs.' },
      { city: 'Bangkok', name: 'Chao Phraya Boat Tour', type: 'sightseeing', cost: 1245, duration_minutes: 120, description: 'Cruise along the "River of Kings" past temples, markets, and historic riverfront.' },

      // Bali
      { city: 'Bali', name: 'Tegallalang Rice Terraces', type: 'sightseeing', cost: 166, duration_minutes: 120, description: 'Walk through stunning UNESCO-listed rice paddies carved into the hillside near Ubud.' },
      { city: 'Bali', name: 'Tanah Lot Sunset Temple', type: 'sightseeing', cost: 415, duration_minutes: 120, description: 'Watch the sun set behind this iconic sea temple perched on a rocky outcrop.' },
      { city: 'Bali', name: 'Ubud Traditional Cooking Class', type: 'food', cost: 2905, duration_minutes: 300, description: 'Visit a local market then cook authentic Balinese dishes in a lush tropical kitchen.' },
      { city: 'Bali', name: 'Kuta Surf Lesson', type: 'adventure', cost: 2490, duration_minutes: 150, description: 'Learn to surf on Bali\'s famous Kuta Beach with professional instructors.' },
      { city: 'Bali', name: 'Balinese Wellness Spa', type: 'wellness', cost: 4565, duration_minutes: 180, description: 'Experience traditional Balinese massage, flower bath, and healing ritual.' },

      // Singapore
      { city: 'Singapore', name: 'Gardens by the Bay', type: 'sightseeing', cost: 1660, duration_minutes: 180, description: 'Marvel at the futuristic Supertrees and the stunning Cloud Forest and Flower Dome.' },
      { city: 'Singapore', name: 'Marina Bay Sands SkyPark', type: 'sightseeing', cost: 2158, duration_minutes: 90, description: 'Visit the iconic infinity pool observation deck 200m above Singapore skyline.' },
      { city: 'Singapore', name: 'Hawker Centre Food Trail', type: 'food', cost: 1660, duration_minutes: 150, description: 'Discover Singapore\'s UNESCO-recognized hawker culture with laksa, chilli crab, and char kway teow.' },
      { city: 'Singapore', name: 'Sentosa Island Adventure', type: 'adventure', cost: 4565, duration_minutes: 300, description: 'Universal Studios, beach clubs, and cable cars at Singapore\'s resort island.' },

      // Paris
      { city: 'Paris', name: 'Eiffel Tower Visit', type: 'sightseeing', cost: 2324, duration_minutes: 120, description: 'Visit the iconic iron lady — take the elevator to the summit for breathtaking city views.' },
      { city: 'Paris', name: 'Louvre Museum', type: 'culture', cost: 1411, duration_minutes: 240, description: 'Explore the world\'s largest art museum — home to the Mona Lisa, Venus de Milo, and thousands more.' },
      { city: 'Paris', name: 'Seine River Cruise', type: 'sightseeing', cost: 1328, duration_minutes: 90, description: 'Glide past Notre-Dame, the Eiffel Tower, and other landmarks along the Seine.' },
      { city: 'Paris', name: 'Montmartre & Sacré-Cœur', type: 'sightseeing', cost: 0, duration_minutes: 150, description: 'Wander the bohemian artists\' quarter and climb to the stunning white basilica.' },
      { city: 'Paris', name: 'French Pastry Baking Class', type: 'food', cost: 7055, duration_minutes: 180, description: 'Learn to make croissants, macarons, and éclairs with a professional Parisian pastry chef.' },
      { city: 'Paris', name: 'Versailles Palace Day Trip', type: 'culture', cost: 1660, duration_minutes: 360, description: 'Explore the opulent Palace of Versailles and its spectacular Hall of Mirrors and gardens.' },

      // Rome
      { city: 'Rome', name: 'Colosseum & Roman Forum', type: 'sightseeing', cost: 1328, duration_minutes: 240, description: 'Step into ancient Rome at the iconic amphitheater and the heart of the Republic.' },
      { city: 'Rome', name: 'Vatican Museums & Sistine Chapel', type: 'culture', cost: 1660, duration_minutes: 300, description: 'See Michelangelo\'s breathtaking ceiling and thousands of years of papal art treasures.' },
      { city: 'Rome', name: 'Trastevere Food Walk', type: 'food', cost: 3735, duration_minutes: 180, description: 'Discover authentic Roman cuisine in the charming, ivy-covered Trastevere neighborhood.' },
      { city: 'Rome', name: 'Trevi Fountain & Spanish Steps', type: 'sightseeing', cost: 0, duration_minutes: 90, description: 'Toss a coin in the iconic baroque fountain and climb Rome\'s famous landmark staircase.' },

      // Barcelona
      { city: 'Barcelona', name: 'Sagrada Família', type: 'sightseeing', cost: 2158, duration_minutes: 150, description: 'Tour Gaudí\'s unfinished masterpiece — a breathtaking basilica unlike anything else on Earth.' },
      { city: 'Barcelona', name: 'Park Güell', type: 'sightseeing', cost: 830, duration_minutes: 120, description: 'Wander Gaudí\'s colorful mosaic park with stunning panoramic views of Barcelona.' },
      { city: 'Barcelona', name: 'La Boqueria Market', type: 'food', cost: 2075, duration_minutes: 120, description: 'Browse and taste jamón ibérico, fresh seafood, olives, and Spanish delicacies.' },
      { city: 'Barcelona', name: 'Barceloneta Beach', type: 'wellness', cost: 0, duration_minutes: 240, description: 'Relax on Barcelona\'s beautiful urban beach with tapas bars and Mediterranean vibes.' },

      // New York City
      { city: 'New York City', name: 'Central Park Bike Tour', type: 'adventure', cost: 2905, duration_minutes: 180, description: 'Cycle through 843 acres of urban oasis with a guided tour of the park\'s highlights.' },
      { city: 'New York City', name: 'Metropolitan Museum of Art', type: 'culture', cost: 2075, duration_minutes: 240, description: 'One of the world\'s greatest art museums spanning 5,000 years of human creativity.' },
      { city: 'New York City', name: 'Brooklyn Food Tour', type: 'food', cost: 5395, duration_minutes: 210, description: 'Sample artisan foods across Brooklyn\'s diverse neighborhoods with a local guide.' },
      { city: 'New York City', name: 'Times Square & Broadway Show', type: 'culture', cost: 9130, duration_minutes: 180, description: 'Experience the "Crossroads of the World" and catch a world-class Broadway performance.' },
      { city: 'New York City', name: 'Statue of Liberty & Ellis Island', type: 'sightseeing', cost: 1992, duration_minutes: 300, description: 'Ferry to Liberty Island and trace America\'s immigration history at Ellis Island.' },

      // Dubai
      { city: 'Dubai', name: 'Burj Khalifa Sky Deck', type: 'sightseeing', cost: 3320, duration_minutes: 120, description: 'Visit the observation deck of the world\'s tallest building with 360-degree views.' },
      { city: 'Dubai', name: 'Desert Safari & Dune Bashing', type: 'adventure', cost: 6225, duration_minutes: 360, description: 'Thrilling 4x4 dune bashing, camel rides, and Bedouin camp dinner under the stars.' },
      { city: 'Dubai', name: 'Dubai Mall & Aquarium', type: 'shopping', cost: 1660, duration_minutes: 240, description: 'Shop at the world\'s largest mall and see the massive indoor aquarium and ice rink.' },

      // Marrakech
      { city: 'Marrakech', name: 'Medina Souk Walking Tour', type: 'shopping', cost: 1660, duration_minutes: 180, description: 'Navigate the labyrinthine souks with a guide — spices, lanterns, leather, and textiles.' },
      { city: 'Marrakech', name: 'Moroccan Cooking Class', type: 'food', cost: 4150, duration_minutes: 300, description: 'Visit the spice market, then cook tagine, couscous, and bastilla with a local family.' },
      { city: 'Marrakech', name: 'Djemaa el-Fna at Night', type: 'culture', cost: 830, duration_minutes: 150, description: 'Experience the world\'s greatest outdoor spectacle — storytellers, musicians, and food stalls.' },
      { city: 'Marrakech', name: 'Hammam & Spa Experience', type: 'wellness', cost: 3320, duration_minutes: 150, description: 'Authentic traditional Moroccan hammam with black soap scrub and argan oil massage.' },

      // Cape Town
      { city: 'Cape Town', name: 'Table Mountain Cable Car', type: 'sightseeing', cost: 1826, duration_minutes: 180, description: 'Ride to the flat-topped summit for dramatic views of the Cape Peninsula and city.' },
      { city: 'Cape Town', name: 'Cape Winelands Tour', type: 'food', cost: 6640, duration_minutes: 420, description: 'Day trip to Stellenbosch and Franschhoek for award-winning wine and food pairing.' },
      { city: 'Cape Town', name: 'Boulders Beach Penguin Colony', type: 'sightseeing', cost: 996, duration_minutes: 120, description: 'Get up close with thousands of African penguins at this magical seaside colony.' },
    ];

    const rows = activities.map((a) => ({
      id: uuidv4(),
      city_id: cityMap[a.city],
      name: a.name,
      description: a.description || null,
      type: a.type,
      cost: a.cost || 0,
      duration_minutes: a.duration_minutes || null,
      image_url: null,
      createdAt: now,
      updatedAt: now,
    })).filter((a) => a.city_id); // skip if city not found

    await queryInterface.bulkInsert('activities', rows, {});
    console.log(`[Seeder] Inserted ${rows.length} activities`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('activities', null, {});
  },
};
