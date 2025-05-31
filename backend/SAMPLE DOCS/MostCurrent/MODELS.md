*Most current models based on app flow, to be reviewed by Claire and Evelyn and worked into DB upon approval*



<!-- USERS -->
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role TEXT CHECK (role IN ('landlord', 'advertiser')) NOT NULL,
    business_name VARCHAR(255),  -- Only for landlords
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);





<!-- LISTINGS -->

CREATE TABLE listings (
    listing_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,  -- Base rental price
    price_type TEXT CHECK (price_type IN ('week', 'month')) NOT NULL,  -- Weekly or monthly pricing
    installation_fee DECIMAL(10, 2) DEFAULT 0,  -- Optional
    size_width DECIMAL(10, 2) NOT NULL,  -- Width in feet/meters
    size_height DECIMAL(10, 2) NOT NULL,  -- Height in feet/meters
    location VARCHAR(255) NOT NULL,  -- E.g., SoHo, Times Square
    traffic TEXT CHECK (traffic IN ('5000+', '10000+', '15000+', '20000+')) NOT NULL,
    availability_status TEXT CHECK (availability_status IN ('available_now', 'available_from')) NOT NULL,
    available_from DATE,  -- If available_from is chosen
    
    -- Technical Specifications
    material TEXT,  -- Written by the landlord
    restrictions TEXT DEFAULT 'none',  -- Written by the landlord (or 'none')
    min_booking_weeks INT DEFAULT 1,  -- Minimum booking duration in weeks
    installation_options TEXT,  -- "Professional installation" or "Other options"
    permit_required BOOLEAN DEFAULT FALSE,  -- Yes or No

    -- Document URLs (stored in Supabase Storage)
    technical_specifications_pdf_url TEXT,  -- URL to Technical Specifications PDF
    traffic_analysis_report_pdf_url TEXT,  -- URL to Traffic Analysis Report PDF

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);





<!-- REVIEWS -->

CREATE TABLE reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(listing_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,  -- Star rating (1 to 5)
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




<!-- MESSAGES -->
CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(listing_id) ON DELETE CASCADE,
    sender_user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'file')) NOT NULL,  -- Message type
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_status TEXT CHECK (read_status IN ('read', 'unread')) DEFAULT 'unread'
);




<!-- FAVORITES -->

CREATE TABLE favorites (
    favorite_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(listing_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




<!-- VISIBILITY SCORES -->

CREATE TABLE visibility_scores (
    visibility_score_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(listing_id) ON DELETE CASCADE,
    foot_traffic INT CHECK (foot_traffic BETWEEN 0 AND 100) NOT NULL,
    vehicle_traffic INT CHECK (vehicle_traffic BETWEEN 0 AND 100) NOT NULL,
    visibility_angle INT CHECK (visibility_angle BETWEEN 0 AND 100) NOT NULL,
    location_quality INT CHECK (location_quality BETWEEN 0 AND 100) NOT NULL,
    average_score DECIMAL(5, 2) GENERATED ALWAYS AS (
        (foot_traffic + vehicle_traffic + visibility_angle + location_quality) / 4
    ) STORED,  -- Automatically calculated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




<!-- BOOKINGS -->

CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(listing_id) ON DELETE CASCADE,
    renter_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_weeks INT NOT NULL,  -- Duration in weeks
    rental_price DECIMAL(10, 2) NOT NULL,
    installation_fee DECIMAL(10, 2),
    total_price DECIMAL(10, 2) NOT NULL,  -- Rental + Installation Fee + Service Fee
    service_fee DECIMAL(10, 2) NOT NULL,  -- 5% service fee
    booking_status TEXT CHECK (booking_status IN ('pending', 'confirmed', 'cancelled')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);