-- ==============================================================================
-- Foodgo Gourmet Ordering Platform - Default Seed Data
-- ==============================================================================

-- 1. Default Categories
INSERT IGNORE INTO `categories` (`id`, `name`, `icon`, `sort_order`, `active`) VALUES
('all', 'All', 'Sparkles', 1, 1),
('porotta', 'Porotta', 'Flame', 2, 1),
('biriyani', 'Biriyani', 'Utensils', 3, 1),
('fried-items', 'Fried Items', 'Drumstick', 4, 1),
('snacks', 'Snacks', 'Cookie', 5, 1),
('burgers', 'Burgers', 'Sandwich', 6, 1),
('drinks', 'Drinks', 'Coffee', 7, 1),
('combos', 'Combos', 'ShoppingBag', 8, 1);

-- 2. Master Toppings
INSERT IGNORE INTO `customization_toppings` (`id`, `name`, `icon`, `image`, `price`, `available`, `sort_order`) VALUES
('top-tomato', 'Tomato', '🍅', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&auto=format&fit=crop&q=80', 0.50, 1, 1),
('top-onion', 'Onions', '🧅', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=100&auto=format&fit=crop&q=80', 0.50, 1, 2),
('top-pickles', 'Pickles', '🥒', 'https://images.unsplash.com/photo-1589135233689-d56d354a8b79?w=100&auto=format&fit=crop&q=80', 0.50, 1, 3),
('top-bacon', 'Bacon', '🥓', 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=100&auto=format&fit=crop&q=80', 1.50, 1, 4),
('top-cheese', 'Cheese', '🧀', 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=100&auto=format&fit=crop&q=80', 1.00, 1, 5),
('top-jalapenos', 'Jalapeños', '🌶️', 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=100&auto=format&fit=crop&q=80', 0.75, 1, 6);

-- 3. Master Sides
INSERT IGNORE INTO `customization_sides` (`id`, `name`, `icon`, `image`, `price`, `available`, `sort_order`) VALUES
('side-fries', 'French Fries', '🍟', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=100&auto=format&fit=crop&q=80', 2.99, 1, 1),
('side-coke', 'Coca-Cola', '🥤', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=100&auto=format&fit=crop&q=80', 1.99, 1, 2),
('side-onion-rings', 'Onion Rings', '🧅', 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=100&auto=format&fit=crop&q=80', 3.49, 1, 3),
('side-coleslaw', 'Coleslaw', '🥗', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&auto=format&fit=crop&q=80', 2.49, 1, 4);

-- 4. Products
INSERT IGNORE INTO `products` (`id`, `name`, `subtitle`, `category_id`, `price`, `rating`, `review_count`, `prep_time`, `calories`, `description`, `image`, `spicy_level`, `portion_weight`, `is_veg`, `popular`, `featured`, `available`, `sort_order`) VALUES
('kerala-porotta', 'Porotta', 'Kerala Layered Flaky Porotta', 'porotta', 1.99, 4.9, 142, '10 mins', '280 kcal', 'Authentic handmade Kerala layered flatbread, flaky on the outside and wonderfully soft inside. Made fresh on the griddle with premium golden crust.', 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80', 0, '1 pc (85g)', 1, 1, 1, 1, 1),
('thalassery-biriyani', 'Thalassery Biriyani', 'Malabar Spiced Kaima Rice Feast', 'biriyani', 11.99, 4.9, 210, '20 mins', '650 kcal', 'Authentic North Malabar dum biriyani cooked with fragrant Jeerakasala (Kaima) rice, tender chicken, pure ghee, fried onions (bista), cashews, raisins, and Malabar garam masala.', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', 2, 'Full Serving', 0, 1, 1, 1, 2),
('kerala-chicken-fry', 'Chicken Fry', 'Nadan Crispy Spiced Fry', 'fried-items', 8.99, 4.8, 95, '15 mins', '450 kcal', 'Kerala style crispy bone-in chicken fry marinated in crushed shallots, garlic, ginger, kashmiri chili, black pepper, and fried with fresh curry leaves and green chilies.', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80', 3, '4 pcs', 0, 1, 0, 1, 3),
('beef-fry', 'Beef Fry (BFF)', 'Kerala Slow-Roasted Coconut Beef', 'fried-items', 10.49, 5.0, 320, '15 mins', '520 kcal', 'Signature Kerala style beef roast tossed with roasted coconut slivers, crushed black pepper, fennel, and fragrant curry leaves. A must-have with hot Porotta.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', 3, '300g portion', 0, 1, 1, 1, 4),
('cheeseburger', 'Cheeseburger', 'Wendy\'s Burger Double Patty', 'burgers', 8.24, 4.9, 128, '15-20 mins', '550 kcal', 'Our signature smash patty cheeseburger loaded with 100% grass-fed beef, melted aged cheddar, fresh lettuce, tomato, pickles, and our house secret burger sauce on a brioche bun.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', 1, 'Single Patty', 0, 1, 1, 1, 5),
('veggie-burger', 'Veggie Burger', 'Garden Fresh Crispy Patty', 'burgers', 9.99, 4.8, 86, '15 mins', '420 kcal', 'Crispy spiced vegetable and potato patty topped with crunchy romaine lettuce, fresh tomatoes, creamy avocado slices, and tangy vegan herb mayo on a toasted sesame bun.', 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&auto=format&fit=crop&q=80', 1, '220g', 1, 0, 0, 1, 6),
('chicken-burger', 'Crispy Chicken Burger', 'Spicy Fried Fillet with Slaw', 'burgers', 12.48, 4.6, 94, '15 mins', '580 kcal', 'Buttermilk marinated crispy fried chicken breast fillet tossed in mild buffalo glaze, stacked high with creamy coleslaw and dill pickles on a buttered brioche bun.', 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80', 2, '280g', 0, 1, 0, 1, 7),
('porotta-beef-combo', 'Porotta & Beef Combo', '3 Hot Porottas + Kerala Beef Roast', 'combos', 13.99, 4.9, 184, '15 mins', '850 kcal', 'The ultimate Kerala comfort feast: 3 hot flaky porottas served with spicy slow-roasted beef roast, coconut slices, onion salad, and hot gravy.', 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80', 3, 'Combo Meal', 0, 1, 1, 1, 8);

-- 5. Option Groups for Products
INSERT IGNORE INTO `product_option_groups` (`id`, `product_id`, `name`, `description`, `required`, `selection_type`, `min_selections`, `max_selections`, `sort_order`) VALUES
('og-porotta-curry', 'kerala-porotta', 'Choose Your Curry', 'Select curry accompaniment', 1, 'single', 1, 1, 1),
('og-porotta-addons', 'kerala-porotta', 'Add-ons & Extras', 'Extra items to go with porotta', 0, 'multiple', 0, 5, 2),
('og-biri-size', 'thalassery-biriyani', 'Choose Portion Size', 'Select your serving portion', 1, 'single', 1, 1, 1),
('og-biri-addons', 'thalassery-biriyani', 'Biriyani Add-ons', 'Enhance your biriyani experience', 0, 'multiple', 0, 4, 2),
('og-burger-size', 'cheeseburger', 'Patty & Size Options', 'Select patty count', 1, 'single', 1, 1, 1),
('og-burger-addons', 'cheeseburger', 'Extra Cheeses & Toppings', 'Gourmet add-ons', 0, 'multiple', 0, 5, 2);

-- 6. Product Options
INSERT IGNORE INTO `product_options` (`id`, `group_id`, `name`, `price`, `price_type`, `available`, `is_default`, `description`, `sort_order`) VALUES
('opt-c-chicken', 'og-porotta-curry', 'Chicken Curry', 4.50, 'adjustment', 1, 1, 'Spiced Kerala gravy', 1),
('opt-c-beef', 'og-porotta-curry', 'Beef Curry', 5.20, 'adjustment', 1, 0, 'Slow cooked tender beef', 2),
('opt-c-veg', 'og-porotta-curry', 'Vegetable Kurma', 3.00, 'adjustment', 1, 0, 'Mild coconut kurma', 3),
('opt-add-egg', 'og-porotta-addons', 'Boiled Egg', 1.00, 'adjustment', 1, 0, 'Farm fresh egg', 1),
('opt-add-gravy', 'og-porotta-addons', 'Extra Gravy Cup', 1.20, 'adjustment', 1, 0, 'Rich aromatic gravy', 2),
('opt-bs-half', 'og-biri-size', 'Half Portion', 7.99, 'fixed', 1, 0, 'Light serving', 1),
('opt-bs-full', 'og-biri-size', 'Full Portion', 11.99, 'fixed', 1, 1, 'Standard dum pot', 2),
('opt-ba-raita', 'og-biri-addons', 'Special Raita Cup', 1.00, 'adjustment', 1, 0, 'Chilled yogurt & onion', 1),
('opt-ba-egg', 'og-biri-addons', 'Extra Boiled Egg', 1.00, 'adjustment', 1, 0, 'Farm fresh egg', 2),
('opt-bg-single', 'og-burger-size', 'Single Patty', 8.24, 'fixed', 1, 1, 'Classic single patty', 1),
('opt-bg-double', 'og-burger-size', 'Double Patty', 11.49, 'fixed', 1, 0, 'Double beef & cheese', 2),
('opt-bg-cheese', 'og-burger-addons', 'Extra Aged Cheddar', 1.25, 'adjustment', 1, 0, 'Melted cheese slice', 1),
('opt-bg-bacon', 'og-burger-addons', 'Crispy Bacon', 1.85, 'adjustment', 1, 0, 'Smoked crispy strip', 2);

-- 7. Default Site Settings
INSERT IGNORE INTO `site_settings` (`setting_key`, `setting_value`) VALUES
('store_info', '{"storeName":"Foodgo","storeOpen":true,"deliveryFee":2.00,"taxRate":0.08,"minOrder":5.00,"currency":"INR (₹)","contactEmail":"support@foodgo.com","contactPhone":"+91 98765 43210","address":"Foodgo Kitchens, High Street, Kochi, Kerala"}'),
('payment_settings', '{"upi":{"enabled":true,"upiId":"foodgo@upi","merchantName":"Foodgo Foods Pvt Ltd","qrCodeUrl":"","allowManualVerification":true},"card":{"enabled":true,"provider":"mock","publishableKey":""},"cod":{"enabled":true,"maxAmount":1000,"additionalFee":0}}');
