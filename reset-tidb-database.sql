-- Complete Database Reset Script for TiDB Cloud
-- Run this to drop ALL remaining tables

SET FOREIGN_KEY_CHECKS = 0;

-- Drop all remaining tables from SHOW TABLES result
DROP TABLE IF EXISTS orderitem;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS users;

-- Also drop tables from original schema (if still exist)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS gallery_photos;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS cartitem;
DROP TABLE IF EXISTS category;

SET FOREIGN_KEY_CHECKS = 1;

-- Verify all tables are gone
SHOW TABLES;
