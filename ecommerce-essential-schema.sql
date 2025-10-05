CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- DESIGN: BIGINT PK untuk skalabilitas jutaan user, unique email/username untuk login,
-- soft delete dengan is_active, password hash untuk security

CREATE TABLE user_addresses (
    address_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
-- DESIGN: Normalized addresses (1:N dengan users), is_default untuk alamat utama,
-- CASCADE delete karena alamat langsung milik user

CREATE TABLE categories (
    category_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_category_id BIGINT NULL,
    category_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (parent_category_id) REFERENCES categories(category_id)
);
-- DESIGN: Self-referencing untuk hierarchy (Electronics > Smartphones > iPhone),
-- NULL parent untuk root categories, soft delete dengan is_active

CREATE TABLE products (
    product_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(15,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    CONSTRAINT chk_price_positive CHECK (price > 0),
    CONSTRAINT chk_stock_non_negative CHECK (stock_quantity >= 0)
);
-- DESIGN: SKU untuk business identifier, price constraints untuk validasi,
-- stock_quantity untuk inventory, DECIMAL(15,2) untuk monetary precision

CREATE TABLE product_variants (
    variant_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    variant_value VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(15,2) DEFAULT 0,
    stock_quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_variant (product_id, variant_name, variant_value)
);
-- DESIGN: Support variants (Size: Large, Color: Red), price_adjustment untuk harga berbeda,
-- separate stock per variant, unique constraint untuk prevent duplicate variants

CREATE TABLE shopping_cart (
    cart_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    variant_id BIGINT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, product_id, variant_id)
);
-- DESIGN: Persistent cart per user, support variants, unique constraint mencegah
-- duplicate items (same product+variant), NULL variant_id untuk produk tanpa varian

CREATE TABLE orders (
    order_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    order_status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    
    -- Denormalized shipping address
    shipping_address VARCHAR(255) NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    shipping_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT chk_order_total CHECK (total_amount = subtotal + tax_amount + shipping_cost - discount_amount)
);
-- DESIGN: order_number untuk human-readable ID, ENUMs untuk status tracking,
-- denormalized address untuk historical data, financial breakdown dengan constraint validation

CREATE TABLE order_items (
    order_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    variant_id BIGINT NULL,
    product_name VARCHAR(255) NOT NULL,  -- denormalized
    sku VARCHAR(100) NOT NULL, -- denormalized
    quantity INT NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT chk_item_total CHECK (total_price = quantity * unit_price)
);
-- DESIGN: Denormalized product info untuk historical snapshot (harga bisa berubah),
-- constraint untuk validasi calculation, CASCADE delete dengan order

CREATE TABLE payment_methods (
    payment_method_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    method_name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    processing_fee_percentage DECIMAL(5,4) DEFAULT 0
);
-- DESIGN: Master data untuk payment options, processing_fee untuk cost calculation,
-- is_active untuk enable/disable payment methods

CREATE TABLE payment_transactions (
    transaction_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    payment_method_id BIGINT NOT NULL,
    transaction_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    amount DECIMAL(15,2) NOT NULL,
    processing_fee DECIMAL(15,2) DEFAULT 0,
    gateway_response JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id)
);
-- DESIGN: Support multiple payments per order, JSON field untuk gateway flexibility,
-- processing_fee tracking, status untuk payment lifecycle

CREATE TABLE coupons (
    coupon_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    coupon_code VARCHAR(50) NOT NULL UNIQUE,
    discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
    discount_value DECIMAL(15,2) NOT NULL,
    minimum_order_amount DECIMAL(15,2) DEFAULT 0,
    usage_limit INT,
    usage_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- DESIGN: Flexible discount system (percentage/fixed), usage tracking dengan limit,
-- minimum_order untuk business rules, expiry date untuk time-limited offers

CREATE TABLE product_reviews (
    review_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    rating INT NOT NULL,
    review_text TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5),
    UNIQUE KEY unique_review (user_id, product_id, order_id)
);
-- DESIGN: Verified purchase reviews (linked to order), rating constraint 1-5,
-- moderation dengan is_approved, unique constraint untuk prevent spam reviews

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_category_active_price ON products(category_id, is_active, price);
CREATE INDEX idx_products_search ON products(product_name);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_user_status_date ON orders(user_id, order_status, created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_reviews_product_approved ON product_reviews(product_id, is_approved);

-- INDEXING STRATEGY: 
-- 1. Single column indexes untuk lookup (email, status)
-- 2. Composite indexes untuk common filter combinations (category+active+price)
-- 3. Foreign key indexes untuk join performance
-- 4. Search indexes untuk text search (product_name)



DELIMITER //
CREATE TRIGGER update_stock_after_order
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    IF NEW.variant_id IS NOT NULL THEN
        UPDATE product_variants 
        SET stock_quantity = stock_quantity - NEW.quantity 
        WHERE variant_id = NEW.variant_id;
    ELSE
        UPDATE products 
        SET stock_quantity = stock_quantity - NEW.quantity 
        WHERE product_id = NEW.product_id;
    END IF;
END//
DELIMITER ;

-- TRIGGER PURPOSE: Automatic inventory management saat order dibuat,
-- support untuk product variants, ensures data consistency tanpa application logic


INSERT INTO payment_methods (method_name, processing_fee_percentage) VALUES
('Credit Card', 0.029),
('Bank Transfer', 0.005),
('E-Wallet', 0.015);

INSERT INTO categories (category_name) VALUES
('Electronics'),
('Fashion'),
('Books');

-- SAMPLE DATA: Essential payment methods dengan realistic processing fees,
-- basic categories untuk testing dan development

CREATE VIEW product_summary AS
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    p.stock_quantity,
    c.category_name,
    COALESCE(AVG(pr.rating), 0) as average_rating,
    COUNT(pr.review_id) as review_count
FROM products p
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN product_reviews pr ON p.product_id = pr.product_id AND pr.is_approved = TRUE
WHERE p.is_active = TRUE
GROUP BY p.product_id;

-- VIEW PURPOSE: Aggregate common product data dengan rating untuk catalog display,
-- simplifies frontend queries, pre-computed average ratings untuk performance

CREATE VIEW order_summary AS
SELECT 
    o.order_id,
    o.order_number,
    CONCAT(u.first_name, ' ', u.last_name) as customer_name,
    o.order_status,
    o.total_amount,
    o.created_at,
    COUNT(oi.order_item_id) as item_count
FROM orders o
JOIN users u ON o.user_id = u.user_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id;

-- VIEW PURPOSE: Order overview dengan customer info untuk admin dashboard,
-- item count calculation, simplified order management queries