-- SERTEK BİLİŞİM MERKEZİ — Veritabanı Şeması (PostgreSQL 16)
-- Aşama 1 çıktısıdır: mimari planlama amaçlıdır. Aşama 2'de Alembic migration'larına
-- dönüştürülecek, gerekirse alan eklenip çıkarılacaktır.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- 1. KULLANICI / YETKİLENDİRME
-- =========================================================

CREATE TYPE user_role AS ENUM ('admin', 'yonetici', 'satis_personeli', 'urun_yoneticisi', 'salt_goruntuleme');

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    role            user_role NOT NULL DEFAULT 'satis_personeli',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(100) NOT NULL,
    entity_id       VARCHAR(100),
    before_data     JSONB,
    after_data      JSONB,
    ip_address      INET,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- =========================================================
-- 2. MARKA / KATEGORİ / ÜRÜN
-- =========================================================

CREATE TABLE brands (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL UNIQUE,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_categories_parent ON categories(parent_id);

CREATE TYPE product_status AS ENUM ('taslak', 'aktif', 'pasif');

CREATE TABLE suppliers ( -- ileride tanımlanacak, forward reference için önce boş tanım
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);

CREATE TABLE products (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku                     VARCHAR(100) NOT NULL UNIQUE,
    barcode                 VARCHAR(100) UNIQUE,
    name                    VARCHAR(500) NOT NULL,
    brand_id                UUID REFERENCES brands(id) ON DELETE SET NULL,
    category_id             UUID REFERENCES categories(id) ON DELETE SET NULL,
    description             TEXT,
    short_description       TEXT,
    technical_specs         JSONB NOT NULL DEFAULT '{}'::jsonb,
    youtube_url             VARCHAR(500),
    purchase_price          NUMERIC(14,2) NOT NULL DEFAULT 0,
    vat_rate                NUMERIC(5,2) NOT NULL DEFAULT 20,
    min_sale_price          NUMERIC(14,2),
    critical_stock_level    INTEGER NOT NULL DEFAULT 5,
    supplier_id             UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    xml_product_code        VARCHAR(100),
    status                  product_status NOT NULL DEFAULT 'taslak',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_status ON products(status);

CREATE TABLE product_images (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url             VARCHAR(1000) NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_images_product ON product_images(product_id);

-- =========================================================
-- 3. SATIŞ KANALLARI (pazaryerleri + WooCommerce siteleri)
-- =========================================================

CREATE TYPE channel_type AS ENUM ('trendyol', 'hepsiburada', 'teknosa', 'ciceksepeti', 'n11', 'woocommerce');
CREATE TYPE connection_status AS ENUM ('baglanmadi', 'bagli', 'hatali');

CREATE TABLE sales_channels (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type                    channel_type NOT NULL,
    name                    VARCHAR(255) NOT NULL, -- örn. "Trendyol" veya "techburda.com"
    is_active               BOOLEAN NOT NULL DEFAULT FALSE,
    credentials_encrypted   BYTEA, -- Fernet/AES ile şifrelenmiş JSON (API key/secret, token vb.)
    config                  JSONB NOT NULL DEFAULT '{}'::jsonb, -- base_url, store_id, site_url vb.
    connection_status       connection_status NOT NULL DEFAULT 'baglanmadi',
    last_sync_at            TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE channel_commission_rates (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id              UUID NOT NULL REFERENCES sales_channels(id) ON DELETE CASCADE,
    category_id             UUID REFERENCES categories(id) ON DELETE CASCADE,
    commission_percent      NUMERIC(5,2) NOT NULL,
    estimated_shipping_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(channel_id, category_id)
);

CREATE TYPE channel_listing_status AS ENUM ('gonderilmedi', 'gonderiliyor', 'onay_bekliyor', 'yayinda', 'reddedildi', 'pasif', 'hata');

CREATE TABLE product_channel_listings (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id              UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    channel_id              UUID NOT NULL REFERENCES sales_channels(id) ON DELETE CASCADE,
    external_product_id     VARCHAR(255), -- kanaldaki karşılık gelen ürün ID'si
    channel_price           NUMERIC(14,2),
    channel_description     TEXT,
    channel_category        VARCHAR(255),
    status                  channel_listing_status NOT NULL DEFAULT 'gonderilmedi',
    last_error              TEXT,
    last_synced_at          TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(product_id, channel_id)
);
CREATE INDEX idx_pcl_channel ON product_channel_listings(channel_id);

CREATE TABLE channel_sync_logs (
    id              BIGSERIAL PRIMARY KEY,
    channel_id      UUID NOT NULL REFERENCES sales_channels(id) ON DELETE CASCADE,
    sync_type       VARCHAR(50) NOT NULL, -- product | stock | price | order
    status          VARCHAR(20) NOT NULL, -- basarili | basarisiz | kismi
    started_at      TIMESTAMPTZ NOT NULL,
    finished_at     TIMESTAMPTZ,
    error_message   TEXT,
    payload_snapshot JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_channel_sync_logs_channel ON channel_sync_logs(channel_id, created_at DESC);

-- =========================================================
-- 4. STOK
-- =========================================================

CREATE TABLE warehouses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stock_items (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id        UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    physical_stock      INTEGER NOT NULL DEFAULT 0 CHECK (physical_stock >= 0),
    reserved_stock      INTEGER NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(product_id, warehouse_id),
    CHECK (reserved_stock <= physical_stock)
);

CREATE TYPE stock_movement_type AS ENUM (
    'satis', 'iptal_iadesi', 'iade', 'manuel_duzeltme', 'xml_senkron', 'ilk_giris', 'sayim'
);

CREATE TABLE stock_movements (
    id              BIGSERIAL PRIMARY KEY,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id    UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    movement_type   stock_movement_type NOT NULL,
    quantity_delta  INTEGER NOT NULL, -- pozitif: giriş, negatif: çıkış
    balance_after   INTEGER NOT NULL,
    reference_type  VARCHAR(50), -- order | manual | supplier_sync
    reference_id    VARCHAR(100),
    note            TEXT,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id, created_at DESC);

CREATE TABLE channel_stock (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id              UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    channel_id              UUID NOT NULL REFERENCES sales_channels(id) ON DELETE CASCADE,
    channel_stock_quantity  INTEGER NOT NULL DEFAULT 0,
    last_synced_at          TIMESTAMPTZ,
    UNIQUE(product_id, channel_id)
);

-- =========================================================
-- 5. TEDARİKÇİ / XML
-- =========================================================

CREATE TYPE out_of_stock_behavior AS ENUM ('pasif_yap', 'stok_sifir_goster', 'satisa_kapat');

ALTER TABLE suppliers
    ADD COLUMN name                    VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN xml_url                 VARCHAR(1000),
    ADD COLUMN xml_username            VARCHAR(255),
    ADD COLUMN xml_password_encrypted  BYTEA,
    ADD COLUMN xml_format              VARCHAR(50) NOT NULL DEFAULT 'generic_xml',
    ADD COLUMN update_frequency_minutes INTEGER NOT NULL DEFAULT 60,
    ADD COLUMN out_of_stock_behavior   out_of_stock_behavior NOT NULL DEFAULT 'stok_sifir_goster',
    ADD COLUMN is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN last_sync_at            TIMESTAMPTZ,
    ADD COLUMN last_sync_status        VARCHAR(20),
    ADD COLUMN created_at              TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE supplier_products (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id         UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    product_id          UUID REFERENCES products(id) ON DELETE SET NULL, -- eşleştirilene kadar NULL
    external_code       VARCHAR(255) NOT NULL,
    barcode             VARCHAR(100),
    name                VARCHAR(500),
    brand               VARCHAR(255),
    category            VARCHAR(255),
    purchase_price      NUMERIC(14,2),
    suggested_sale_price NUMERIC(14,2),
    xml_stock_quantity  INTEGER NOT NULL DEFAULT 0,
    raw_data            JSONB,
    is_matched          BOOLEAN NOT NULL DEFAULT FALSE,
    last_seen_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(supplier_id, external_code)
);
CREATE INDEX idx_supplier_products_matched ON supplier_products(is_matched);

CREATE TABLE supplier_sync_logs (
    id                      BIGSERIAL PRIMARY KEY,
    supplier_id             UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    started_at              TIMESTAMPTZ NOT NULL,
    finished_at             TIMESTAMPTZ,
    status                  VARCHAR(20) NOT NULL,
    new_products_count      INTEGER NOT NULL DEFAULT 0,
    updated_products_count  INTEGER NOT NULL DEFAULT 0,
    error_message           TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- 6. SİPARİŞLER
-- =========================================================

CREATE TYPE order_status AS ENUM (
    'yeni', 'onaylandi', 'hazirlaniyor', 'kargoya_verildi', 'teslim_edildi', 'iptal', 'iade', 'tamamlandi'
);

CREATE TABLE customers ( -- forward reference: CRM bölümünde tam tanımlanacak
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);

CREATE TABLE orders (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id              UUID NOT NULL REFERENCES sales_channels(id),
    external_order_id       VARCHAR(255) NOT NULL,
    customer_id             UUID REFERENCES customers(id) ON DELETE SET NULL,
    status                  order_status NOT NULL DEFAULT 'yeni',
    order_date              TIMESTAMPTZ NOT NULL,
    subtotal                NUMERIC(14,2) NOT NULL DEFAULT 0,
    vat_total               NUMERIC(14,2) NOT NULL DEFAULT 0,
    commission_total        NUMERIC(14,2) NOT NULL DEFAULT 0,
    shipping_cost           NUMERIC(14,2) NOT NULL DEFAULT 0,
    discount_total          NUMERIC(14,2) NOT NULL DEFAULT 0,
    grand_total             NUMERIC(14,2) NOT NULL DEFAULT 0,
    estimated_cost          NUMERIC(14,2) NOT NULL DEFAULT 0,
    estimated_profit        NUMERIC(14,2) NOT NULL DEFAULT 0,
    shipping_tracking_number VARCHAR(255),
    raw_payload             JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(channel_id, external_order_id)
);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);

CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(14,2) NOT NULL,
    vat_rate        NUMERIC(5,2) NOT NULL,
    commission_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    cost_price      NUMERIC(14,2) NOT NULL DEFAULT 0
);

CREATE TABLE order_status_history (
    id              BIGSERIAL PRIMARY KEY,
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status          order_status NOT NULL,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- 7. CRM
-- =========================================================

ALTER TABLE customers
    ADD COLUMN full_name       VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN phone           VARCHAR(50),
    ADD COLUMN email           VARCHAR(255),
    ADD COLUMN city            VARCHAR(100),
    ADD COLUMN district        VARCHAR(100),
    ADD COLUMN tags            TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN merged_into_id  UUID REFERENCES customers(id) ON DELETE SET NULL,
    ADD COLUMN created_at      TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE INDEX idx_customers_phone ON customers(phone);

CREATE TABLE lead_stages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_won          BOOLEAN NOT NULL DEFAULT FALSE,
    is_lost         BOOLEAN NOT NULL DEFAULT FALSE,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE lead_source AS ENUM (
    'facebook', 'instagram', 'whatsapp', 'website', 'phone', 'manual', 'google_ads'
);

CREATE TABLE leads (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id             UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    source                  lead_source NOT NULL,
    campaign_name           VARCHAR(255),
    ad_set_name             VARCHAR(255),
    ad_name                 VARCHAR(255),
    utm_source              VARCHAR(255),
    utm_medium              VARCHAR(255),
    utm_campaign            VARCHAR(255),
    interested_product_id   UUID REFERENCES products(id) ON DELETE SET NULL,
    interested_category_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
    stage_id                UUID NOT NULL REFERENCES lead_stages(id),
    assigned_user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    estimated_amount        NUMERIC(14,2),
    actual_amount           NUMERIC(14,2),
    quote_number            VARCHAR(50),
    lost_reason             TEXT,
    next_follow_up_at       TIMESTAMPTZ,
    last_contacted_at       TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_stage ON leads(stage_id);
CREATE INDEX idx_leads_assigned ON leads(assigned_user_id);
CREATE INDEX idx_leads_follow_up ON leads(next_follow_up_at);

CREATE TABLE lead_notes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    note            TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE lead_activity_type AS ENUM ('call', 'whatsapp', 'meeting', 'email', 'other');

CREATE TABLE lead_activities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    type            lead_activity_type NOT NULL,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    note            TEXT
);

CREATE TABLE quotes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    quote_number    VARCHAR(50) NOT NULL UNIQUE,
    items           JSONB NOT NULL, -- [{product_id, quantity, unit_price}, ...]
    total           NUMERIC(14,2) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'taslak',
    valid_until     DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meta_lead_forms (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id             VARCHAR(100) NOT NULL,
    form_id             VARCHAR(100) NOT NULL UNIQUE,
    form_name           VARCHAR(255),
    field_mapping       JSONB NOT NULL DEFAULT '{}'::jsonb, -- Meta alan adı -> CRM alan adı
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- 8. AYARLAR
-- =========================================================

CREATE TABLE system_settings (
    key             VARCHAR(100) PRIMARY KEY,
    value           JSONB NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE currency_rates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    currency        VARCHAR(3) NOT NULL, -- USD, EUR
    rate_to_try     NUMERIC(10,4) NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(currency)
);
