-- ============================================================================
-- Florence With Locals Forum - Seed Data
-- Run after 001_initial_schema.sql
-- ============================================================================

INSERT INTO categories (name, slug, description, icon, color, display_order) VALUES
(
    'Trip Reports & Photos',
    'trip-reports',
    'Share your Florence experiences, trip reports, and travel photos with the community.',
    '📸',
    '#C75B39',
    1
),
(
    'Planning Your Florence Visit',
    'planning',
    'Get help planning your trip — itineraries, logistics, budgets, and travel tips.',
    '🗺️',
    '#1565C0',
    2
),
(
    'Food & Wine in Tuscany',
    'food-wine',
    'Discuss the best restaurants, trattorias, wine bars, and culinary experiences in Florence and Tuscany.',
    '🍷',
    '#8B0000',
    3
),
(
    'Art, History & Culture',
    'art-history-culture',
    'Explore the Uffizi, Duomo, Renaissance art, and the rich cultural heritage of Florence.',
    '🎨',
    '#6B8E23',
    4
),
(
    'Ask a Local Guide',
    'ask-a-guide',
    'Have a question only a local would know? Ask our verified Florence guides directly.',
    '🙋',
    '#5D4037',
    5
),
(
    'Seasonal Florence',
    'seasonal',
    'What''s happening in Florence right now? Festivals, weather, crowds, and seasonal tips.',
    '🌸',
    '#E91E63',
    6
),
(
    'Tour Reviews & Feedback',
    'reviews',
    'Share your honest reviews of tours, guides, and experiences in Florence.',
    '⭐',
    '#FF8F00',
    7
),
(
    'Off the Beaten Path',
    'off-beaten-path',
    'Discover hidden gems, lesser-known neighborhoods, and secret spots around Florence and Tuscany.',
    '🧭',
    '#2E7D32',
    8
);
