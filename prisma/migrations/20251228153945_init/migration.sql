-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CabinClass" AS ENUM ('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST');

-- CreateTable
CREATE TABLE "travelers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "company" TEXT,
    "department" TEXT,
    "date_of_birth" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travelers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "traveler_id" TEXT NOT NULL,
    "booking_reference" TEXT,
    "status" "BookingStatus" NOT NULL,
    "source_email_id" TEXT,
    "raw_email_content" TEXT,
    "total_cost" DECIMAL(10,2),
    "currency" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight_segments" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "airline_code" TEXT,
    "flightNumber" TEXT,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departure_datetime" TIMESTAMPTZ NOT NULL,
    "arrival_datetime" TIMESTAMPTZ NOT NULL,
    "cabin_class" "CabinClass",
    "seat_number" TEXT,
    "price" DECIMAL(10,2),
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flight_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_profiles" (
    "id" TEXT NOT NULL,
    "traveler_id" TEXT NOT NULL,
    "travel_frequency" TEXT,
    "spend_tier" TEXT,
    "avg_booking_lead_time" INTEGER,
    "preferred_airlines" JSONB NOT NULL DEFAULT '[]',
    "preferred_hotels" JSONB NOT NULL DEFAULT '[]',
    "common_routes" JSONB NOT NULL DEFAULT '[]',
    "loyalty_programs" JSONB NOT NULL DEFAULT '{}',
    "total_trips" INTEGER NOT NULL DEFAULT 0,
    "ytd_spend" DECIMAL(10,2) DEFAULT 0,
    "last_trip_date" DATE,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_queue" (
    "id" TEXT NOT NULL,
    "email_id" TEXT NOT NULL,
    "traveler_email" TEXT,
    "subject" TEXT,
    "sender" TEXT,
    "received_date" TIMESTAMP(3),
    "processing_status" TEXT NOT NULL DEFAULT 'PENDING',
    "processed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "traveler_id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "travelers_email_key" ON "travelers"("email");

-- CreateIndex
CREATE INDEX "bookings_traveler_id_idx" ON "bookings"("traveler_id");

-- CreateIndex
CREATE INDEX "bookings_created_at_idx" ON "bookings"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_reference_traveler_id_key" ON "bookings"("booking_reference", "traveler_id");

-- CreateIndex
CREATE INDEX "flight_segments_booking_id_idx" ON "flight_segments"("booking_id");

-- CreateIndex
CREATE INDEX "flight_segments_departure_datetime_idx" ON "flight_segments"("departure_datetime");

-- CreateIndex
CREATE UNIQUE INDEX "travel_profiles_traveler_id_key" ON "travel_profiles"("traveler_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_queue_email_id_key" ON "email_queue"("email_id");

-- CreateIndex
CREATE INDEX "email_queue_processing_status_idx" ON "email_queue"("processing_status");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_traveler_id_fkey" FOREIGN KEY ("traveler_id") REFERENCES "travelers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_segments" ADD CONSTRAINT "flight_segments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_profiles" ADD CONSTRAINT "travel_profiles_traveler_id_fkey" FOREIGN KEY ("traveler_id") REFERENCES "travelers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_traveler_id_fkey" FOREIGN KEY ("traveler_id") REFERENCES "travelers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
