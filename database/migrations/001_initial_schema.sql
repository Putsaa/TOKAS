-- ============================================
-- TOKAS Database Schema - Initial Migration
-- SQL Server
-- ============================================

-- Create Database (run separately if needed)
-- CREATE DATABASE TOKAS;
-- GO
-- USE TOKAS;
-- GO

-- ============================================
-- 1. ROLES
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'roles')
BEGIN
    CREATE TABLE roles (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(50) NOT NULL UNIQUE,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END
GO

-- ============================================
-- 2. USERS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        role_id INT NOT NULL,
        name NVARCHAR(100) NOT NULL,
        username NVARCHAR(50) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NULL,
        CONSTRAINT FK_users_roles FOREIGN KEY (role_id) REFERENCES roles(id)
    );
END
GO

CREATE INDEX IX_users_username ON users(username) WHERE is_active = 1;
GO

-- ============================================
-- 3. CATEGORIES
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'categories')
BEGIN
    CREATE TABLE categories (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NULL
    );
END
GO

-- ============================================
-- 4. PRODUCTS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'products')
BEGIN
    CREATE TABLE products (
        id INT IDENTITY(1,1) PRIMARY KEY,
        category_id INT NOT NULL,
        code NVARCHAR(50) NULL,
        name NVARCHAR(200) NOT NULL,
        purchase_price DECIMAL(18,2) NOT NULL DEFAULT 0,
        selling_price DECIMAL(18,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        minimum_stock INT NOT NULL DEFAULT 0,
        unit NVARCHAR(20) NOT NULL DEFAULT N'pcs',
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NULL,
        CONSTRAINT FK_products_categories FOREIGN KEY (category_id) REFERENCES categories(id),
        CONSTRAINT CK_products_selling_price CHECK (selling_price >= 0),
        CONSTRAINT CK_products_purchase_price CHECK (purchase_price >= 0),
        CONSTRAINT CK_products_stock CHECK (stock >= 0),
        CONSTRAINT CK_products_minimum_stock CHECK (minimum_stock >= 0)
    );
END
GO

CREATE UNIQUE INDEX IX_products_code ON products(code) WHERE code IS NOT NULL;
GO
CREATE INDEX IX_products_category ON products(category_id);
GO
CREATE INDEX IX_products_active ON products(is_active) INCLUDE (name, selling_price, stock);
GO

-- ============================================
-- 5. STOCK_TRANSACTIONS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'stock_transactions')
BEGIN
    CREATE TABLE stock_transactions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        product_id INT NOT NULL,
        type NVARCHAR(20) NOT NULL, -- 'in', 'out', 'adjustment'
        quantity INT NOT NULL,
        stock_before INT NOT NULL DEFAULT 0,
        stock_after INT NOT NULL DEFAULT 0,
        reason NVARCHAR(500) NULL,
        reference_id INT NULL, -- references sale_id for 'out' type
        user_id INT NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_stock_transactions_products FOREIGN KEY (product_id) REFERENCES products(id),
        CONSTRAINT FK_stock_transactions_users FOREIGN KEY (user_id) REFERENCES users(id),
        CONSTRAINT CK_stock_type CHECK (type IN ('in', 'out', 'adjustment'))
    );
END
GO

CREATE INDEX IX_stock_transactions_product ON stock_transactions(product_id, created_at DESC);
GO

-- ============================================
-- 6. SALES
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sales')
BEGIN
    CREATE TABLE sales (
        id INT IDENTITY(1,1) PRIMARY KEY,
        transaction_no NVARCHAR(50) NOT NULL UNIQUE,
        user_id INT NOT NULL,
        subtotal DECIMAL(18,2) NOT NULL,
        discount DECIMAL(18,2) NOT NULL DEFAULT 0,
        total DECIMAL(18,2) NOT NULL,
        payment_amount DECIMAL(18,2) NOT NULL,
        change_amount DECIMAL(18,2) NOT NULL,
        payment_method NVARCHAR(20) NOT NULL DEFAULT 'cash',
        notes NVARCHAR(500) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_sales_users FOREIGN KEY (user_id) REFERENCES users(id),
        CONSTRAINT CK_sales_total CHECK (total >= 0),
        CONSTRAINT CK_sales_payment CHECK (payment_amount >= 0)
    );
END
GO

CREATE INDEX IX_sales_created ON sales(created_at DESC);
CREATE INDEX IX_sales_transaction_no ON sales(transaction_no);
GO

-- ============================================
-- 7. SALE_DETAILS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sale_details')
BEGIN
    CREATE TABLE sale_details (
        id INT IDENTITY(1,1) PRIMARY KEY,
        sale_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name NVARCHAR(200) NOT NULL,
        price DECIMAL(18,2) NOT NULL,
        quantity INT NOT NULL,
        subtotal DECIMAL(18,2) NOT NULL,
        CONSTRAINT FK_sale_details_sales FOREIGN KEY (sale_id) REFERENCES sales(id),
        CONSTRAINT FK_sale_details_products FOREIGN KEY (product_id) REFERENCES products(id),
        CONSTRAINT CK_sale_details_quantity CHECK (quantity > 0)
    );
END
GO

CREATE INDEX IX_sale_details_sale ON sale_details(sale_id);
GO

-- ============================================
-- SEED DATA
-- ============================================

-- Roles
IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Owner')
BEGIN
    INSERT INTO roles (name) VALUES ('Owner');
    INSERT INTO roles (name) VALUES ('Kasir');
END
GO

-- Default Owner account
-- Password: admin123 (BCrypt hash)
IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')
BEGIN
    INSERT INTO users (role_id, name, username, password_hash, is_active)
    VALUES (1, 'Administrator', 'admin', '$2a$11$KmXRGJq5G4Kz8v.vpGmxXOYl5VZwKQk5aJ5K3K8rF9XGzHqMfJ3Ym', 1);
END
GO

-- Sample Categories
IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Makanan')
BEGIN
    INSERT INTO categories (name) VALUES (N'Makanan');
    INSERT INTO categories (name) VALUES (N'Minuman');
    INSERT INTO categories (name) VALUES (N'Snack');
    INSERT INTO categories (name) VALUES (N'Lainnya');
END
GO

PRINT 'TOKAS database schema created successfully.';
GO
