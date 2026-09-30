import { PrismaClient, LeadStatus } from '@prisma/client';

const prisma = new PrismaClient();

const seedLeads = [
  {
    externalLeadId: 'seed_meta_001',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@example.com',
    phone: '9876543210',
    source: 'META_ADS',
    campaignId: 'camp_diwali_2026',
    adId: 'ad_flex_001',
    status: LeadStatus.NEW,
  },
  {
    externalLeadId: 'seed_meta_002',
    firstName: 'Arjun',
    lastName: 'Mehta',
    email: 'arjun.mehta@example.com',
    phone: '9123456789',
    source: 'META_ADS',
    campaignId: 'camp_diwali_2026',
    adId: 'ad_carousel_002',
    status: LeadStatus.CONTACTED,
  },
  {
    externalLeadId: 'seed_meta_003',
    firstName: 'Kavya',
    lastName: 'Reddy',
    email: 'kavya.reddy@example.com',
    phone: '8765432109',
    source: 'META_ADS',
    campaignId: 'camp_q4_2026',
    adId: 'ad_video_003',
    status: LeadStatus.QUALIFIED,
  },
  {
    externalLeadId: 'seed_meta_004',
    firstName: 'Rohan',
    lastName: 'Gupta',
    email: 'rohan.gupta@example.com',
    phone: '7654321098',
    source: 'META_ADS',
    campaignId: 'camp_q4_2026',
    adId: 'ad_image_004',
    status: LeadStatus.CONVERTED,
  },
  {
    externalLeadId: 'seed_meta_005',
    firstName: 'Sneha',
    lastName: 'Patel',
    email: 'sneha.patel@example.com',
    phone: '6543210987',
    source: 'META_ADS',
    campaignId: 'camp_q3_2026',
    adId: 'ad_story_005',
    status: LeadStatus.LOST,
  },
];

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // Clear existing seed data (idempotent)
  await prisma.activity.deleteMany({
    where: { lead: { externalLeadId: { startsWith: 'seed_' } } },
  });
  await prisma.lead.deleteMany({
    where: { externalLeadId: { startsWith: 'seed_' } },
  });

  for (const leadData of seedLeads) {
    const lead = await prisma.lead.create({
      data: leadData,
    });

    // Create "Lead Created" activity for each seed lead
    await prisma.activity.create({
      data: {
        leadId: lead.id,
        action: 'Lead Created',
        newValue: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          source: lead.source,
          status: lead.status,
        },
        metadata: { source: 'seed' },
      },
    });

    // If not NEW, also create a Status Changed activity
    if (lead.status !== LeadStatus.NEW) {
      await prisma.activity.create({
        data: {
          leadId: lead.id,
          action: 'Status Changed',
          previousValue: { status: LeadStatus.NEW },
          newValue: { status: lead.status },
          metadata: { source: 'seed' },
        },
      });
    }

    console.log(`  ✓ Created lead: ${lead.firstName} ${lead.lastName} (${lead.status})`);
  }

  console.log(`\n✅ Seeded ${seedLeads.length} leads with activities`);
}

main()
  .catch((e: unknown) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
