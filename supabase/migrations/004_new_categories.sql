-- ============================================================================
-- Florence With Locals Forum - New Categories
-- Migration: 004_new_categories.sql
-- Adds 4 new Explore categories for travel info, recipes, activities, transport
-- Copy-paste into Supabase SQL Editor to run
-- ============================================================================

INSERT INTO categories (name, slug, description, icon, color, display_order, is_active) VALUES
('Tourist Info & Travel Tips', 'tourist-info', 'Essential travel information, visa tips, transportation guides, and practical advice for visiting Florence and Tuscany.', '🗺️', '#0288D1', 9, true),
('Typical Tuscan Recipes', 'tuscan-recipes', 'Share and discover authentic Tuscan recipes — from ribollita to bistecca alla fiorentina. Cook like a local!', '👨‍🍳', '#E65100', 10, true),
('What to Do in Tuscany', 'what-to-do', 'Activities, excursions, day trips, and unique experiences throughout Tuscany. Wine tastings, cooking classes, hiking, and more.', '🎯', '#7B1FA2', 11, true),
('Traveling in Tuscany', 'traveling-tuscany', 'Getting around Tuscany — trains, buses, car rentals, driving tips, and route planning for exploring beyond Florence.', '🚂', '#00695C', 12, true);
