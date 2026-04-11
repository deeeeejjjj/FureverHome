-- ═══════════════════════════════════════════════════════════════
--  FUREVER HOME — Normalized MySQL Schema (3NF / BCNF)
--  Database: furever_home
--
--  Changes from original (see bottom for full diff summary):
--  1.  municipalities lookup table  → replaces repeated ENUM in 6 tables
--  2.  rescuers merged with rescuer_applications
--  3.  donations.donor_name / donor_email columns removed
--  4.  pets.age_label and pets.age_group columns removed (derived)
--  5.  user_notification_prefs extracted from users
--  6.  rescuers.avatar_initials / avatar_color columns removed (derived)
--  7.  pets.image_url removed — pet_images is the single source of truth,
--      with a sort_order=0 row serving as the primary image
-- ═══════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS furever_home
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE furever_home;

-- ─────────────────────────────────────────────────────────────
-- 0. MUNICIPALITIES  (lookup / reference table)
--    FIX A: was a raw ENUM repeated across 6 tables.
--    Now a single source of truth. Adding a new municipality
--    is one INSERT, not six ALTER TABLE statements.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE municipalities (
  id    TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(60) NOT NULL UNIQUE
);

INSERT INTO municipalities (name) VALUES
  ('Boac'), ('Gasan'), ('Mogpog'),
  ('Santa Cruz'), ('Buenavista'), ('Torrijos');

-- ─────────────────────────────────────────────────────────────
-- 1. USERS
--    FIX E: notification preferences extracted to own table.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(60)     NOT NULL,
  last_name     VARCHAR(60)     NOT NULL,
  email         VARCHAR(180)    NOT NULL UNIQUE,
  password_hash VARCHAR(255)    NOT NULL,
  phone         VARCHAR(30),
  age           TINYINT UNSIGNED,
  municipality_id TINYINT UNSIGNED,
  about_me      TEXT,
  avatar_url    VARCHAR(500),
  role          ENUM('user','admin','rescuer') NOT NULL DEFAULT 'user',
  is_active     TINYINT(1)      NOT NULL DEFAULT 1,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login    DATETIME,
  FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_role  (role)
);

-- FIX E: notification preferences are their own concern, not user identity.
--        Extracted to a child table (1-to-1 with users).
--        Makes it trivial to add new notification types without ALTER TABLE users.
CREATE TABLE user_notification_prefs (
  user_id           INT UNSIGNED NOT NULL PRIMARY KEY,
  notif_applications TINYINT(1)  NOT NULL DEFAULT 1,
  notif_new_pets     TINYINT(1)  NOT NULL DEFAULT 1,
  notif_newsletter   TINYINT(1)  NOT NULL DEFAULT 0,
  notif_donations    TINYINT(1)  NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 2. SHELTERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE shelters (
  id               INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(120)   NOT NULL,
  municipality_id  TINYINT UNSIGNED NOT NULL,
  address          VARCHAR(255),
  phone            VARCHAR(30),
  email            VARCHAR(180),
  established_year YEAR,
  description      TEXT,
  is_active        TINYINT(1)     NOT NULL DEFAULT 1,
  created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (municipality_id) REFERENCES municipalities(id)
);

-- ─────────────────────────────────────────────────────────────
-- 3. PETS
--    FIX D: age_label and age_group removed — both are derived
--           from age_years and can be computed in a query or
--           in PHP. Storing them creates update anomalies
--           (age_years changes → must also update age_label
--           and age_group manually).
--    FIX G: image_url removed — pet_images is the single
--           source of truth; use sort_order = 0 for primary.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE pets (
  id               INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(80)     NOT NULL,
  type             ENUM('Dog','Cat') NOT NULL,
  breed            VARCHAR(100),
  age_years        DECIMAL(3,1),          -- age_group / age_label derived in app layer
  gender           ENUM('Male','Female')  NOT NULL,
  size             ENUM('Small','Medium','Large'),
  weight_kg        DECIMAL(5,2),
  municipality_id  TINYINT UNSIGNED NOT NULL,
  shelter_id       INT UNSIGNED,
  description      TEXT,
  status           ENUM('available','pending','adopted') NOT NULL DEFAULT 'available',
  is_vaccinated    TINYINT(1) NOT NULL DEFAULT 0,
  is_neutered      TINYINT(1) NOT NULL DEFAULT 0,
  is_house_trained TINYINT(1) NOT NULL DEFAULT 0,
  is_microchipped  TINYINT(1) NOT NULL DEFAULT 0,
  is_featured      TINYINT(1) NOT NULL DEFAULT 0,
  created_by       INT UNSIGNED,
  created_at       DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (municipality_id) REFERENCES municipalities(id),
  FOREIGN KEY (shelter_id)      REFERENCES shelters(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by)      REFERENCES users(id)    ON DELETE SET NULL,
  INDEX idx_type         (type),
  INDEX idx_status       (status),
  INDEX idx_municipality (municipality_id),
  INDEX idx_featured     (is_featured)
);

-- Pet images  (sort_order = 0 is the primary / thumbnail image)
CREATE TABLE pet_images (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pet_id     INT UNSIGNED NOT NULL,
  url        VARCHAR(500) NOT NULL,
  sort_order TINYINT UNSIGNED DEFAULT 0,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  INDEX idx_pet_order (pet_id, sort_order)
);

-- Pet tags
CREATE TABLE pet_tags (
  id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pet_id INT UNSIGNED NOT NULL,
  tag    VARCHAR(60)  NOT NULL,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  UNIQUE KEY uq_pet_tag (pet_id, tag)
);

-- ─────────────────────────────────────────────────────────────
-- 4. SAVED PETS (favourites) — unchanged, already correct
-- ─────────────────────────────────────────────────────────────
CREATE TABLE saved_pets (
  id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id  INT UNSIGNED NOT NULL,
  pet_id   INT UNSIGNED NOT NULL,
  saved_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pet_id)  REFERENCES pets(id)  ON DELETE CASCADE,
  UNIQUE KEY uq_user_pet (user_id, pet_id)
);

-- ─────────────────────────────────────────────────────────────
-- 5. ADOPTION REQUESTS
--    NOTE: full_name / email / phone / address are intentional
--    snapshots of the applicant's details AT THE TIME of
--    application (users may change their profile later).
--    This is accepted practice for audit/legal records and
--    does NOT violate normalization — it is a historical fact,
--    not a redundant derived value.
--    municipality_id still replaced with FK for consistency.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE adoption_requests (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  pet_id          INT UNSIGNED NOT NULL,
  shelter_id      INT UNSIGNED,
  -- Snapshot of applicant info at submission time (intentional)
  full_name       VARCHAR(120) NOT NULL,
  email           VARCHAR(180) NOT NULL,
  phone           VARCHAR(30)  NOT NULL,
  address         TEXT         NOT NULL,
  municipality_id TINYINT UNSIGNED NOT NULL,
  -- Home info
  home_type       ENUM('House','Apartment','Condo','Farm') NOT NULL,
  has_yard        TINYINT(1)   NOT NULL DEFAULT 0,
  has_other_pets  TINYINT(1)   NOT NULL DEFAULT 0,
  other_pets_desc VARCHAR(255),
  has_children    TINYINT(1)   NOT NULL DEFAULT 0,
  adults_in_home  TINYINT UNSIGNED,
  reason          TEXT         NOT NULL,
  experience      TEXT,
  -- Status
  status          ENUM('pending','approved','rejected','withdrawn') NOT NULL DEFAULT 'pending',
  admin_notes     TEXT,
  reviewed_by     INT UNSIGNED,
  reviewed_at     DATETIME,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)         REFERENCES users(id)          ON DELETE CASCADE,
  FOREIGN KEY (pet_id)          REFERENCES pets(id)           ON DELETE CASCADE,
  FOREIGN KEY (shelter_id)      REFERENCES shelters(id)       ON DELETE SET NULL,
  FOREIGN KEY (municipality_id) REFERENCES municipalities(id),
  FOREIGN KEY (reviewed_by)     REFERENCES users(id)          ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_pet_id  (pet_id),
  INDEX idx_status  (status)
);

-- ─────────────────────────────────────────────────────────────
-- 6. RESCUERS  (merged with rescuer_applications)
--    FIX C: Original schema had two nearly-identical tables
--    (rescuers + rescuer_applications) with 8 duplicated
--    columns. A rescuer_application that gets approved simply
--    becomes a verified rescuer — same entity, different
--    status. Merged into one table with application_status
--    and is_verified columns.
--    FIX F: avatar_initials / avatar_color removed — initials
--    are derived from full_name (LEFT 1 of each word) and
--    color can be deterministically derived from id % palette.
--    Storing derived presentation data in the DB is an
--    anti-pattern that causes stale data on name changes.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE rescuers (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNSIGNED,                -- NULL until application is approved & linked
  full_name         VARCHAR(120) NOT NULL,
  email             VARCHAR(180) NOT NULL,
  phone             VARCHAR(30),
  municipality_id   TINYINT UNSIGNED NOT NULL,
  experience_level  ENUM('beginner','intermediate','experienced') NOT NULL DEFAULT 'beginner',
  pet_focus         ENUM('dogs','cats','both')   NOT NULL DEFAULT 'both',
  bio               TEXT,
  has_foster_space  ENUM('yes','no','limited')   NOT NULL DEFAULT 'no',
  -- Application workflow (replaces rescuer_applications table)
  application_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  reviewed_by       INT UNSIGNED,
  reviewed_at       DATETIME,
  -- Stats (populated after approval)
  rescued_count     SMALLINT UNSIGNED DEFAULT 0,
  adopted_count     SMALLINT UNSIGNED DEFAULT 0,
  years_active      TINYINT UNSIGNED  DEFAULT 0,
  is_verified       TINYINT(1) NOT NULL DEFAULT 0,
  created_at        DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (municipality_id) REFERENCES municipalities(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_municipality (municipality_id),
  INDEX idx_verified    (is_verified),
  INDEX idx_app_status  (application_status)
);

-- ─────────────────────────────────────────────────────────────
-- 7. DONATIONS
--    FIX B: donor_name and donor_email removed.
--    When is_anonymous = 0, the donor's name and email are
--    already in users (via user_id FK) — storing them here
--    is a transitive dependency and creates update anomalies
--    (user changes name → donations show stale name).
--    When is_anonymous = 1, user_id is still stored (for
--    internal tracking); the app layer simply suppresses
--    display of the name. donor_name / donor_email were
--    never needed in the DB at all.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE donations (
  id              INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED,                   -- nullable for truly guest donations
  amount          DECIMAL(10,2)  NOT NULL,
  currency        VARCHAR(5)     NOT NULL DEFAULT 'PHP',
  payment_method  ENUM('gcash','maya','bank','cash','online') DEFAULT 'online',
  transaction_ref VARCHAR(120),
  message         TEXT,
  is_anonymous    TINYINT(1)     NOT NULL DEFAULT 0,
  status          ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'completed',
  donated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id    (user_id),
  INDEX idx_status     (status),
  INDEX idx_donated_at (donated_at)
);

-- ─────────────────────────────────────────────────────────────
-- 8. NOTIFICATIONS — unchanged, already correct
-- ─────────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  type       ENUM('application_approved','application_rejected','new_pet',
                  'message','system','donation') NOT NULL,
  title      VARCHAR(150) NOT NULL,
  body       TEXT,
  link       VARCHAR(300),
  is_read    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_unread (user_id, is_read)
);

-- ─────────────────────────────────────────────────────────────
-- 9. CONTACT MESSAGES — unchanged, already correct
-- ─────────────────────────────────────────────────────────────
CREATE TABLE contact_messages (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(180) NOT NULL,
  topic       VARCHAR(80),
  message     TEXT         NOT NULL,
  consent     TINYINT(1)   NOT NULL DEFAULT 1,
  is_resolved TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- 10. NEWSLETTER SUBSCRIBERS — unchanged, already correct
-- ─────────────────────────────────────────────────────────────
CREATE TABLE newsletter_subscribers (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(180) NOT NULL UNIQUE,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  subscribed_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- ═══════════════════════════════════════════════════════════════
--  SEED DATA
-- ═══════════════════════════════════════════════════════════════

-- Users
INSERT INTO users (first_name, last_name, email, password_hash, phone, municipality_id, role) VALUES
  ('Admin', 'User',  'admin@fureverhome.ph', '$2a$11$placeholder_bcrypt_hash_here', '+63912345678', 1, 'admin'),
  ('Maria', 'Reyes', 'maria@fureverhome.ph', '$2a$11$placeholder_bcrypt_hash_here', '+63912345679', 1, 'user');

-- Notification prefs (one row per user)
INSERT INTO user_notification_prefs (user_id) VALUES (1), (2);

-- Shelters (municipality_id matches municipalities table: 1=Boac, 2=Gasan, etc.)
INSERT INTO shelters (name, municipality_id, phone, email, established_year) VALUES
  ('Boac Animal Shelter',    1, '+63912111001', 'boac@fureverhome.ph',       2018),
  ('Gasan PAWS Center',      2, '+63912222002', 'gasan@fureverhome.ph',      2020),
  ('Santa Cruz Rescue Hub',  4, '+63912333003', 'santacruz@fureverhome.ph',  2021),
  ('Mogpog Animal Care',     3, '+63912444004', 'mogpog@fureverhome.ph',     2022),
  ('Buenavista Pet Haven',   5, '+63912555005', 'buenavista@fureverhome.ph', 2023),
  ('Torrijos Animal Rescue', 6, '+63912666006', 'torrijos@fureverhome.ph',   2023);

-- Pets  (age_label / age_group / image_url removed — computed in app or stored in pet_images)
INSERT INTO pets (name, type, breed, age_years, gender, size, weight_kg, municipality_id, shelter_id, status, is_vaccinated, is_house_trained, is_featured, description) VALUES
  ('Max',    'Dog', 'Golden Retriever',   2.0, 'Male',   'Large',  28.0, 1, 1, 'available', 1, 1, 1, 'Max is a gentle and affectionate Golden Retriever who loves cuddles and outdoor walks.'),
  ('Buddy',  'Dog', 'Labrador Mix',       3.0, 'Male',   'Medium', 22.0, 2, 2, 'available', 1, 0, 1, 'Buddy is a lively and loving Labrador mix who thrives on attention and play.'),
  ('Rocky',  'Dog', 'Aspin Mix',          5.0, 'Male',   'Medium', 18.0, 5, 5, 'available', 0, 1, 0, 'Rocky is a calm and devoted Aspin who has lived as a house dog most of his life.'),
  ('Coco',   'Dog', 'Dachshund',          4.0, 'Female', 'Small',  7.0,  4, 3, 'available', 1, 0, 0, 'Coco is a charming little Dachshund with a big personality.'),
  ('Kiko',   'Dog', 'Shih Tzu Mix',       2.0, 'Male',   'Small',  5.0,  6, 6, 'available', 1, 0, 0, 'Kiko is an adorable Shih Tzu mix with a silky coat and a sweet temperament.'),
  ('Bruno',  'Dog', 'Labrador Retriever', 1.0, 'Male',   'Large',  20.0, 3, 4, 'pending',   1, 0, 0, 'Bruno is an enthusiastic young Labrador full of puppy energy.'),
  ('Luna',   'Cat', 'Domestic Shorthair', 1.0, 'Female', 'Small',  3.2,  2, 2, 'available', 1, 0, 1, 'Luna is a sweet and curious Domestic Shorthair who loves to explore.'),
  ('Nala',   'Cat', 'Persian Mix',        2.0, 'Female', 'Medium', 4.0,  1, 1, 'available', 1, 0, 1, 'Nala is a gorgeous Persian mix with a laid-back personality.'),
  ('Mochi',  'Cat', 'Siamese Mix',        1.0, 'Female', 'Small',  3.0,  3, 4, 'available', 0, 0, 0, 'Mochi is a chatty and playful Siamese mix.'),
  ('Shadow', 'Cat', 'Domestic Longhair',  4.0, 'Male',   'Medium', 5.0,  4, 3, 'available', 0, 0, 0, 'Shadow is a sleek, mysterious Domestic Longhair.'),
  ('Ginger', 'Cat', 'Orange Tabby',       3.0, 'Male',   'Medium', 4.5,  5, 5, 'available', 1, 0, 0, 'Ginger is an outgoing, social Orange Tabby.'),
  ('Bella',  'Cat', 'Calico',             5.0, 'Female', 'Medium', 4.8,  6, 6, 'pending',   0, 0, 0, 'Bella is a beautiful Calico with a gentle soul.');

-- Primary images (sort_order = 0) stored in pet_images
INSERT INTO pet_images (pet_id, url, sort_order) VALUES
  (1,  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80', 0),
  (2,  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&q=80', 0),
  (3,  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=500&q=80', 0),
  (4,  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80', 0),
  (5,  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&q=80', 0),
  (6,  'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=500&q=80', 0),
  (7,  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&q=80', 0),
  (8,  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=80', 0),
  (9,  'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=500&q=80', 0),
  (10, 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=500&q=80', 0),
  (11, 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=500&q=80', 0),
  (12, 'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=500&q=80', 0);

-- Pet tags (unchanged)
INSERT INTO pet_tags (pet_id, tag) VALUES
  (1,'Vaccinated'),(1,'House-trained'),(1,'Friendly'),
  (2,'Vaccinated'),(2,'Playful'),(2,'Energetic'),
  (3,'House-trained'),(3,'Calm'),(3,'Loyal'),
  (4,'Vaccinated'),(4,'Spayed'),(4,'Affectionate'),
  (5,'Vaccinated'),(5,'Kid-friendly'),(5,'Gentle'),
  (6,'Vaccinated'),(6,'Puppy'),(6,'High-energy'),
  (7,'Vaccinated'),(7,'Indoor'),(7,'Gentle'),
  (8,'Vaccinated'),(8,'Calm'),(8,'Lap cat'),
  (9,'Playful'),(9,'Kid-friendly'),(9,'Vocal'),
  (10,'Neutered'),(10,'Independent'),(10,'Calm'),
  (11,'Vaccinated'),(11,'Friendly'),(11,'Social'),
  (12,'Vaccinated');

-- Rescuers (merged from original rescuers + rescuer_applications; pre-approved rows)
-- avatar_initials / avatar_color removed — derive initials from full_name in PHP:
--   $initials = implode('', array_map(fn($w) => strtoupper($w[0]), explode(' ', $name, 2)));
-- color can be derived from: AVATAR_PALETTE[id % count($palette)]
INSERT INTO rescuers (full_name, email, phone, municipality_id, experience_level, pet_focus, bio, rescued_count, adopted_count, years_active, is_verified, application_status) VALUES
  ('Maria Reyes',   'maria.rescuer@email.com',  '+63912001001', 1, 'experienced',  'both', 'Passionate animal welfare advocate rescuing street dogs and abandoned cats in Boac for over 3 years.', 24, 18, 3, 1, 'approved'),
  ('Juan dela Cruz','juan.rescuer@email.com',   '+63912002002', 2, 'experienced',  'dogs', 'Volunteer rescuer specializing in finding homes for large-breed dogs in Gasan.',                       31, 25, 5, 1, 'approved'),
  ('Ana Santos',    'ana.rescuer@email.com',    '+63912003003', 4, 'intermediate', 'cats', 'Cat specialist and foster carer based in Santa Cruz.',                                                19, 15, 2, 1, 'approved'),
  ('Pedro Garcia',  'pedro.rescuer@email.com',  '+63912004004', 3, 'beginner',     'both', 'Community organizer and rescuer in Mogpog.',                                                          16, 12, 1, 1, 'approved'),
  ('Rosa Lopez',    'rosa.rescuer@email.com',   '+63912005005', 5, 'experienced',  'both', 'Teacher and weekend rescuer in Buenavista.',                                                          22, 20, 4, 1, 'approved'),
  ('Berto Mance',   'berto.rescuer@email.com',  '+63912006006', 6, 'experienced',  'dogs', 'Retired fisherman turned full-time animal rescuer in Torrijos.',                                      28, 22, 6, 1, 'approved');

-- ═══════════════════════════════════════════════════════════════
--  NORMALIZATION CHANGE SUMMARY
-- ═══════════════════════════════════════════════════════════════
--
--  FIX A — municipalities lookup table (BCNF)
--    PROBLEM : ENUM('Boac','Gasan','Mogpog','Santa Cruz','Buenavista','Torrijos')
--              was copy-pasted into 6 tables (users, shelters, pets,
--              adoption_requests, rescuers, rescuer_applications).
--              Adding or renaming a municipality required 6 ALTER TABLE statements.
--    FIX     : New `municipalities` table. All 6 tables now hold a
--              municipality_id (TINYINT FK) instead of a raw ENUM.
--
--  FIX B — donations.donor_name / donor_email removed (3NF)
--    PROBLEM : When is_anonymous = 0, donor_name and donor_email are
--              functionally determined by user_id (via the users table),
--              creating a transitive dependency: donation → user_id → name/email.
--              A user who changes their name would have stale donor_name values.
--    FIX     : Columns dropped. App layer reads name/email from users JOIN
--              when is_anonymous = 0. user_id is always stored for internal
--              record-keeping; the display logic controls anonymity.
--
--  FIX C — rescuers + rescuer_applications merged (3NF / DRY)
--    PROBLEM : Both tables shared 8 identical columns (full_name, email, phone,
--              municipality, experience_level, pet_focus, bio, has_foster_space).
--              An approved application was duplicated into rescuers manually,
--              violating the principle that one fact lives in one place.
--    FIX     : Single `rescuers` table with application_status + reviewed_by +
--              reviewed_at columns. A pending application is a row with
--              application_status='pending' and is_verified=0. Approval flips
--              those fields — no data is ever copied between tables.
--
--  FIX D — pets.age_label and pets.age_group removed (derived data / 3NF)
--    PROBLEM : age_label ("2 yrs") and age_group ("young") are both fully
--              determined by age_years alone. Storing all three creates update
--              anomalies: changing age_years requires also updating age_label
--              and age_group, or they go stale.
--    FIX     : age_label and age_group dropped. Computed in PHP:
--              age_label → "{$age} yr" . ($age == 1 ? '' : 's')
--              age_group → age < 1 ? 'puppy' : (age < 3 ? 'young' :
--                          (age < 8 ? 'adult' : 'senior'))
--
--  FIX E — user_notification_prefs extracted from users (design / extensibility)
--    PROBLEM : Four notif_* boolean columns embedded directly in users. While
--              not a strict normalization violation (they depend on the PK),
--              they mix identity/authentication data with preference data.
--              Adding a fifth notification type required ALTER TABLE users.
--    FIX     : New `user_notification_prefs` table (1-to-1 with users via FK).
--              New notification types are added as new columns in one place
--              without touching the users table.
--
--  FIX F — rescuers.avatar_initials / avatar_color removed (derived data)
--    PROBLEM : avatar_initials is fully determined by full_name (first letter
--              of each name word). Storing it creates an update anomaly: a
--              rescuer who changes their name will have stale initials.
--              avatar_color is an arbitrary UI presentation value.
--    FIX     : Both columns dropped. PHP derives initials at render time.
--              Color is deterministically assigned from rescuer id % palette.
--
--  FIX G — pets.image_url removed (single source of truth)
--    PROBLEM : pets.image_url and pet_images (sort_order=0) both stored the
--              primary image URL, creating a dual-write requirement. Updating
--              the primary image required two writes (UPDATE pets + INSERT/UPDATE
--              pet_images) and could get out of sync.
--    FIX     : pets.image_url dropped. pet_images with sort_order = 0 is the
--              canonical primary image. Query: SELECT url FROM pet_images
--              WHERE pet_id = ? ORDER BY sort_order LIMIT 1.
-- ═══════════════════════════════════════════════════════════════
