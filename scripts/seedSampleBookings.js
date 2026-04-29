const { Booking } = require('../src/Models');
const { sequelize } = require('../config/database');

// Use valid tier values: 'essential', 'signature', 'bespoke'
const sampleBookings = [
  {
    customerName: "Maria Santos",
    customerEmail: "maria.santos@email.com",
    customerPhone: "+63 912 345 6789",
    eventDate: "2026-06-15",
    guestCount: 150,
    venue: "Grand Ballroom, Manila Hotel",
    packageName: "Romantic Garden Package",
    tier: "signature",
    tierName: "Romantic Garden Package",
    status: "confirmed",
    estimatedPrice: 180000
  },
  {
    customerName: "Juan Dela Cruz",
    customerEmail: "juan.delacruz@company.com",
    customerPhone: "+63 917 234 5678",
    eventDate: "2026-05-20",
    guestCount: 80,
    venue: "Corporate Office, Makati",
    packageName: "Executive Lunch Package",
    tier: "essential",
    tierName: "Executive Lunch Package",
    status: "confirmed",
    estimatedPrice: 40000
  },
  {
    customerName: "Ana Reyes",
    customerEmail: "ana.reyes@email.com",
    customerPhone: "+63 918 345 6789",
    eventDate: "2026-07-10",
    guestCount: 50,
    venue: "Private Residence, Quezon City",
    packageName: "Milestone Celebration Package",
    tier: "signature",
    tierName: "Milestone Celebration Package",
    status: "completed",
    estimatedPrice: 45000
  },
  {
    customerName: "Roberto Garcia",
    customerEmail: "roberto.garcia@email.com",
    customerPhone: "+63 919 456 7890",
    eventDate: "2026-08-05",
    guestCount: 200,
    venue: "Beach Resort, Batangas",
    packageName: "Grand Ballroom Package",
    tier: "bespoke",
    tierName: "Grand Ballroom Package",
    status: "confirmed",
    estimatedPrice: 400000
  },
  {
    customerName: "Lisa Tan",
    customerEmail: "lisa.tan@company.com",
    customerPhone: "+63 920 567 8901",
    eventDate: "2026-05-25",
    guestCount: 120,
    venue: "Conference Center, BGC",
    packageName: "Team Building Package",
    tier: "signature",
    tierName: "Team Building Package",
    status: "confirmed",
    estimatedPrice: 84000
  },
  {
    customerName: "Pedro Martinez",
    customerEmail: "pedro.martinez@email.com",
    customerPhone: "+63 921 678 9012",
    eventDate: "2026-09-15",
    guestCount: 100,
    venue: "Garden Venue, Tagaytay",
    packageName: "Classic Filipino Wedding",
    tier: "essential",
    tierName: "Classic Filipino Wedding",
    status: "pending",
    estimatedPrice: 120000
  },
  {
    customerName: "Carmen Lopez",
    customerEmail: "carmen.lopez@email.com",
    customerPhone: "+63 922 789 0123",
    eventDate: "2026-06-30",
    guestCount: 30,
    venue: "Private Home, Pasig",
    packageName: "Intimate Gathering Package",
    tier: "essential",
    tierName: "Intimate Gathering Package",
    status: "pending",
    estimatedPrice: 18000
  },
  {
    customerName: "Miguel Ramos",
    customerEmail: "miguel.ramos@email.com",
    customerPhone: "+63 923 890 1234",
    eventDate: "2026-07-20",
    guestCount: 250,
    venue: "Community Center, Barangay Hall",
    packageName: "Barangay Fiesta Package",
    tier: "signature",
    tierName: "Barangay Fiesta Package",
    status: "pending",
    estimatedPrice: 85000
  },
  {
    customerName: "Sofia Cruz",
    customerEmail: "sofia.cruz@email.com",
    customerPhone: "+63 924 901 2345",
    eventDate: "2026-03-10",
    guestCount: 60,
    venue: "Restaurant, Alabang",
    packageName: "Family Reunion Package",
    tier: "essential",
    tierName: "Family Reunion Package",
    status: "completed",
    estimatedPrice: 33000,
    createdAt: new Date('2026-01-15')
  },
  {
    customerName: "David Fernandez",
    customerEmail: "david.fernandez@company.com",
    customerPhone: "+63 925 012 3456",
    eventDate: "2026-02-28",
    guestCount: 90,
    venue: "Hotel Conference Room",
    packageName: "Corporate Gala Package",
    tier: "signature",
    tierName: "Corporate Gala Package",
    status: "completed",
    estimatedPrice: 99000,
    createdAt: new Date('2025-12-20')
  },
  {
    customerName: "Isabella Torres",
    customerEmail: "isabella.torres@email.com",
    customerPhone: "+63 926 123 4567",
    eventDate: "2026-04-05",
    guestCount: 40,
    venue: "Kids Party Venue",
    packageName: "Kids Party Package",
    tier: "essential",
    tierName: "Kids Party Package",
    status: "completed",
    estimatedPrice: 16000,
    createdAt: new Date('2026-02-10')
  },
  {
    customerName: "Gabriel Santos",
    customerEmail: "gabriel.santos@email.com",
    customerPhone: "+63 927 234 5678",
    eventDate: "2026-01-20",
    guestCount: 180,
    venue: "Garden Reception, Antipolo",
    packageName: "Romantic Garden Package",
    tier: "signature",
    tierName: "Romantic Garden Package",
    status: "completed",
    estimatedPrice: 216000,
    createdAt: new Date('2025-11-05')
  },
  {
    customerName: "Elena Morales",
    customerEmail: "elena.morales@email.com",
    customerPhone: "+63 928 345 6789",
    eventDate: "2026-05-15",
    guestCount: 70,
    venue: "Hotel Ballroom",
    packageName: "Anniversary Celebration",
    tier: "signature",
    tierName: "Anniversary Celebration",
    status: "cancelled",
    estimatedPrice: 70000
  }
];

async function seedBookings() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.\n');

    console.log('=== CREATING SAMPLE BOOKINGS ===\n');

    let successCount = 0;

    for (const bookingData of sampleBookings) {
      try {
        await Booking.create(bookingData);
        successCount++;
        console.log(`✓ ${bookingData.customerName} - ${bookingData.packageName} (${bookingData.status})`);
      } catch (error) {
        console.error(`✗ ${bookingData.customerName}:`, error.message);
      }
    }

    console.log('\n=== COMPLETE ===');
    console.log(`Created: ${successCount}/${sampleBookings.length} bookings`);

    const totalRevenue = sampleBookings
      .filter(b => ['confirmed', 'completed'].includes(b.status))
      .reduce((sum, b) => sum + b.estimatedPrice, 0);

    console.log(`\nTotal Revenue: ₱${totalRevenue.toLocaleString()}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedBookings();
