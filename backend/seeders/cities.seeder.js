'use strict';

const { v4: uuidv4 } = require('uuid');

const cities = [
  // Asia
  { name: 'Tokyo', country: 'Japan', region: 'Asia', cost_index: 85.5, popularity_score: 98, description: 'A dazzling blend of ultramodern and traditional, from neon-lit skyscrapers to historic temples.', image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800' },
  { name: 'Kyoto', country: 'Japan', region: 'Asia', cost_index: 70.0, popularity_score: 92, description: 'Japan\'s cultural heart, known for thousands of classical Buddhist temples, gardens, and geisha districts.', image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800' },
  { name: 'Bangkok', country: 'Thailand', region: 'Asia', cost_index: 35.5, popularity_score: 90, description: 'A city of contrasts with ornate shrines, vibrant street life, and world-class dining.', image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0a0?w=800' },
  { name: 'Bali', country: 'Indonesia', region: 'Asia', cost_index: 30.0, popularity_score: 95, description: 'Island of Gods — stunning terraced rice fields, ancient temples, and beautiful beaches.', image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800' },
  { name: 'Singapore', country: 'Singapore', region: 'Asia', cost_index: 95.0, popularity_score: 88, description: 'A gleaming city-state known for futuristic architecture, hawker food culture, and lush gardens.', image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800' },
  { name: 'Mumbai', country: 'India', region: 'Asia', cost_index: 28.0, popularity_score: 82, description: 'India\'s financial capital — a city of dreams with Bollywood glamour and colonial heritage.', image_url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800' },
  { name: 'Delhi', country: 'India', region: 'Asia', cost_index: 25.0, popularity_score: 80, description: 'India\'s capital spanning several centuries of history, from Mughal grandeur to modern India Gate.', image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800' },
  { name: 'Seoul', country: 'South Korea', region: 'Asia', cost_index: 65.0, popularity_score: 87, description: 'Where K-pop meets tradition — palaces, street food alleys, and cutting-edge technology.', image_url: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800' },
  { name: 'Dubai', country: 'UAE', region: 'Middle East', cost_index: 90.0, popularity_score: 91, description: 'The city of superlatives — record-breaking towers, luxury shopping, and desert adventures.', image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800' },

  // Europe
  { name: 'Paris', country: 'France', region: 'Europe', cost_index: 92.0, popularity_score: 99, description: 'The City of Light — the Eiffel Tower, world-class cuisine, and unparalleled art and culture.', image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800' },
  { name: 'Rome', country: 'Italy', region: 'Europe', cost_index: 75.0, popularity_score: 95, description: 'The Eternal City — millennia of art, architecture, and Italian culinary perfection.', image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800' },
  { name: 'Barcelona', country: 'Spain', region: 'Europe', cost_index: 72.0, popularity_score: 93, description: 'Gaudí\'s masterpieces, vibrant nightlife, and golden Mediterranean beaches.', image_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800' },
  { name: 'Amsterdam', country: 'Netherlands', region: 'Europe', cost_index: 88.0, popularity_score: 89, description: 'A city of canals, cycling culture, world-class museums, and liberal spirit.', image_url: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5702?w=800' },
  { name: 'Prague', country: 'Czech Republic', region: 'Europe', cost_index: 52.0, popularity_score: 88, description: 'A fairy-tale city of Gothic cathedrals, baroque palaces, and cobblestone old town squares.', image_url: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800' },
  { name: 'Santorini', country: 'Greece', region: 'Europe', cost_index: 110.0, popularity_score: 96, description: 'Iconic white-washed villages clinging to volcanic cliffs with breathtaking Aegean sunsets.', image_url: 'https://images.unsplash.com/photo-1507501336603-6760a7f1f9c9?w=800' },

  // Americas
  { name: 'New York City', country: 'USA', region: 'North America', cost_index: 120.0, popularity_score: 97, description: 'The Big Apple — Times Square, Central Park, diverse neighborhoods, and world-class everything.', image_url: 'https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?w=800' },
  { name: 'Cancún', country: 'Mexico', region: 'North America', cost_index: 55.0, popularity_score: 86, description: 'Turquoise Caribbean waters, ancient Mayan ruins, and an iconic resort strip.', image_url: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800' },
  { name: 'Rio de Janeiro', country: 'Brazil', region: 'South America', cost_index: 48.0, popularity_score: 90, description: 'Carnaval, Christ the Redeemer, Copacabana Beach, and the spirit of samba.', image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800' },
  { name: 'Buenos Aires', country: 'Argentina', region: 'South America', cost_index: 35.0, popularity_score: 82, description: 'The Paris of South America — tango, steak, colonial architecture, and passionate culture.', image_url: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800' },

  // Africa
  { name: 'Marrakech', country: 'Morocco', region: 'Africa', cost_index: 32.0, popularity_score: 89, description: 'A sensory explosion of souks, riads, spices, and the vibrant Djemaa el-Fna square.', image_url: 'https://images.unsplash.com/photo-1539020140153-e479b8f22986?w=800' },
  { name: 'Cape Town', country: 'South Africa', region: 'Africa', cost_index: 45.0, popularity_score: 90, description: 'Table Mountain, Cape Winelands, stunning coastlines, and a rich cultural tapestry.', image_url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800' },
  { name: 'Cairo', country: 'Egypt', region: 'Africa', cost_index: 22.0, popularity_score: 85, description: 'Home to the Great Pyramids and Sphinx — ancient wonders on the banks of the Nile.', image_url: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800' },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const rows = cities.map((city) => ({
      id: uuidv4(),
      ...city,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert('cities', rows, {});
    console.log(`[Seeder] Inserted ${rows.length} cities`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('cities', null, {});
  },
};
