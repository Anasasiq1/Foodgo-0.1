-- ==============================================================================
-- Foodgo Gourmet Ordering Platform - Database Schema
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+
-- Character set: utf8mb4 / utf8mb4_unicode_ci
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ------------------------------------------------------------------------------
-- 1. Admins Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(150) NOT NULL DEFAULT 'Administrator',
  `role` VARCHAR(50) NOT NULL DEFAULT 'Super Admin',
  `avatar` VARCHAR(500) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_admin_username` (`username`),
  INDEX `idx_admin_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Admin Sessions Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_sessions` (
  `token` VARCHAR(128) PRIMARY KEY,
  `admin_id` INT NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL,
  INDEX `idx_session_admin` (`admin_id`),
  INDEX `idx_session_expiry` (`expires_at`),
  CONSTRAINT `fk_session_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Categories Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(100) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category_active` (`active`),
  INDEX `idx_category_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Products Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `subtitle` VARCHAR(255) NULL,
  `category_id` VARCHAR(64) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `rating` DECIMAL(3, 1) NOT NULL DEFAULT 5.0,
  `review_count` INT NOT NULL DEFAULT 0,
  `prep_time` VARCHAR(50) NOT NULL DEFAULT '15-20 mins',
  `calories` VARCHAR(50) NULL,
  `description` TEXT NOT NULL,
  `image` TEXT NOT NULL,
  `images_json` TEXT NULL,
  `spicy_level` INT NOT NULL DEFAULT 0,
  `portion_weight` VARCHAR(50) NULL,
  `is_veg` TINYINT(1) NOT NULL DEFAULT 0,
  `popular` TINYINT(1) NOT NULL DEFAULT 0,
  `featured` TINYINT(1) NOT NULL DEFAULT 0,
  `available` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_product_category` (`category_id`),
  INDEX `idx_product_available` (`available`),
  INDEX `idx_product_featured` (`featured`),
  INDEX `idx_product_popular` (`popular`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Option Group Templates (Portion size, Curries, Add-ons, Patty counts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `option_group_templates` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `group_data_json` LONGTEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. Product Option Groups (Assigned to specific products)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_option_groups` (
  `id` VARCHAR(64) PRIMARY KEY,
  `product_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` VARCHAR(255) NULL,
  `required` TINYINT(1) NOT NULL DEFAULT 0,
  `selection_type` ENUM('single', 'multiple') NOT NULL DEFAULT 'single',
  `min_selections` INT NOT NULL DEFAULT 0,
  `max_selections` INT NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_optgroup_product` (`product_id`),
  CONSTRAINT `fk_optgroup_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. Product Options (Individual choices within an Option Group)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_options` (
  `id` VARCHAR(64) PRIMARY KEY,
  `group_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `price_type` ENUM('fixed', 'adjustment') NOT NULL DEFAULT 'adjustment',
  `available` TINYINT(1) NOT NULL DEFAULT 1,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `description` VARCHAR(255) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  INDEX `idx_option_group` (`group_id`),
  CONSTRAINT `fk_option_group` FOREIGN KEY (`group_id`) REFERENCES `product_option_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. Customization Master Items (Toppings & Sides for Burger Customizer)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `customization_toppings` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(100) NOT NULL,
  `image` VARCHAR(500) NULL,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `available` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `customization_sides` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(100) NOT NULL,
  `image` VARCHAR(500) NULL,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `available` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. Customers Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `customers` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NOT NULL,
  `address` TEXT NOT NULL,
  `avatar` VARCHAR(500) NULL,
  `total_orders` INT NOT NULL DEFAULT 0,
  `total_spent` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  `registered_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_customer_email` (`email`),
  INDEX `idx_customer_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. Orders Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(64) PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `customer_id` VARCHAR(64) NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_email` VARCHAR(191) NOT NULL,
  `customer_phone` VARCHAR(30) NOT NULL,
  `delivery_address` TEXT NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `tax` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `delivery_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'Cash on Delivery',
  `payment_status` ENUM('Pending', 'Paid', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
  `order_status` ENUM('Pending', 'Confirmed', 'Preparing', 'On the Way', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
  `notes` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_order_number` (`order_number`),
  INDEX `idx_order_customer` (`customer_id`),
  INDEX `idx_order_status` (`order_status`),
  INDEX `idx_order_date` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11. Order Items Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` VARCHAR(64) PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `product_image` TEXT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `total_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `customization_json` LONGTEXT NULL,
  INDEX `idx_orderitem_order` (`order_id`),
  CONSTRAINT `fk_orderitem_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 12. Payments Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(64) PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL,
  `order_number` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(50) NOT NULL,
  `status` ENUM('Pending', 'Paid', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
  `transaction_ref` VARCHAR(100) NULL,
  `details` VARCHAR(255) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_payment_order` (`order_id`),
  INDEX `idx_payment_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 13. Customer Support Conversations Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `support_conversations` (
  `id` VARCHAR(64) PRIMARY KEY,
  `customer_id` VARCHAR(64) NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_email` VARCHAR(191) NOT NULL,
  `customer_avatar` VARCHAR(500) NULL,
  `order_id` VARCHAR(64) NULL,
  `order_number` VARCHAR(50) NULL,
  `status` ENUM('Open', 'Resolved') NOT NULL DEFAULT 'Open',
  `last_message` TEXT NULL,
  `unread_count_customer` INT NOT NULL DEFAULT 0,
  `unread_count_admin` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_support_email` (`customer_email`),
  INDEX `idx_support_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 14. Support Messages Table (Text & Voice Notes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `support_messages` (
  `id` VARCHAR(64) PRIMARY KEY,
  `conversation_id` VARCHAR(64) NOT NULL,
  `sender` ENUM('agent', 'user') NOT NULL,
  `sender_type` ENUM('admin', 'customer', 'staff') NOT NULL DEFAULT 'customer',
  `sender_name` VARCHAR(150) NOT NULL,
  `message_type` ENUM('text', 'audio', 'image') NOT NULL DEFAULT 'text',
  `text` TEXT NULL,
  `audio_url` LONGTEXT NULL,
  `audio_duration` DECIMAL(6, 2) NULL,
  `image_url` TEXT NULL,
  `time_str` VARCHAR(50) NOT NULL,
  `timestamp_ms` BIGINT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_msg_conversation` (`conversation_id`),
  CONSTRAINT `fk_msg_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `support_conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 15. Store & Payment Settings Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_settings` (
  `setting_key` VARCHAR(64) PRIMARY KEY,
  `setting_value` LONGTEXT NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 16. Admin Activity Audit Logs Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_activity_logs` (
  `id` VARCHAR(64) PRIMARY KEY,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT NOT NULL,
  `admin_username` VARCHAR(100) NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_admin` (`admin_username`),
  INDEX `idx_audit_date` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
