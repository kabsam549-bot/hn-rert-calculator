const Redis = require('ioredis');
const path = require('path');
const fs = require('fs');

// Simple parser for .env.local
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error('Failed to load .env.local', e);
}

const CONTENT_KEY = 'hn-rert:content';
const AUDIT_KEY = 'hn-rert:audit';

const defaultContent = {
  oarConstraints: [
    { name: "Spinal cord", tier: 1, limitEQD2: 50, alphaBeta: 2, complication: "Myelopathy", description: "Max point dose" },
    { name: "Brainstem", tier: 1, limitEQD2: 54, alphaBeta: 2, complication: "Brainstem necrosis", description: "Max point dose" },
    { name: "Optic chiasm", tier: 1, limitEQD2: 50, alphaBeta: 2, complication: "Blindness", description: "Max point dose" },
    { name: "Optic nerves", tier: 1, limitEQD2: 55, alphaBeta: 2, complication: "Blindness", description: "Max point dose" },
    { name: "Carotid vessels", tier: 2, limitEQD2: 120, alphaBeta: 3, complication: "Carotid blowout", description: "Max dose to vessel wall" },
    { name: "Temporal lobe", tier: 2, limitEQD2: 60, alphaBeta: 3, complication: "Temporal lobe necrosis", description: "Max dose" },
    { name: "Mandible", tier: 2, limitEQD2: 70, alphaBeta: 3, complication: "Osteoradionecrosis", description: "Max dose to bone" },
    { name: "Brachial plexus", tier: 2, limitEQD2: 60, alphaBeta: 2, complication: "Brachial plexopathy", description: "Max point dose" },
    { name: "Pharyngeal constrictors", tier: 3, limitEQD2: 55, alphaBeta: 3, complication: "Dysphagia", description: "Mean dose" },
    { name: "Cranial nerves (IX, X, XI, XII)", tier: 3, limitEQD2: 60, alphaBeta: 3, complication: "Neuropathy", description: "Max dose" },
    { name: "Parotid gland", tier: 3, limitEQD2: 26, alphaBeta: 3, complication: "Xerostomia", description: "Mean dose" },
    { name: "Larynx", tier: 3, limitEQD2: 50, alphaBeta: 3, complication: "Voice changes, aspiration", description: "Mean dose" },
    { name: "Esophagus", tier: 3, limitEQD2: 55, alphaBeta: 3, complication: "Stricture, dysphagia", description: "Mean dose" },
  ],
  doseRegimens: [
    { name: "Full dose", dose: 66, fractions: 33, intent: "curative", description: "Standard definitive re-RT" },
    { name: "Moderate hypofractionation", dose: 60, fractions: 30, intent: "curative", description: "Commonly used re-RT regimen" },
    { name: "SBRT 40/5", dose: 40, fractions: 5, intent: "hypofractionated", description: "Stereotactic re-RT" },
    { name: "SBRT 32/4", dose: 32, fractions: 4, intent: "hypofractionated", description: "Stereotactic re-RT" },
    { name: "Palliative 27/3", dose: 27, fractions: 3, intent: "palliative", description: "Short course palliative" },
    { name: "Palliative 20/5", dose: 20, fractions: 5, intent: "palliative", description: "Palliative regimen" },
  ],
  guidelines: [
    {
      id: "rpa-class-1",
      title: "RPA Class I Management",
      content: "Favorable prognosis with 61.9% 2-year OS. Full-dose re-RT reasonable with modern techniques.",
      category: "rpa"
    },
    {
      id: "rpa-class-2", 
      title: "RPA Class II Management",
      content: "Intermediate prognosis with 40% 2-year OS. Consider dose de-escalation and MDT discussion.",
      category: "rpa"
    },
    {
      id: "rpa-class-3",
      title: "RPA Class III Management", 
      content: "Poor prognosis with 16.8% 2-year OS. Consider alternatives to re-RT, palliative care consult.",
      category: "rpa"
    },
  ],
  references: [
    {
      id: "phan-2025",
      citation: "Phan J, Spiotto MT, Goodman CD, et al. Reirradiation for Locally Recurrent Head and Neck Cancer: State-of-the-Art and Future Directions. Semin Radiat Oncol. 2025.",
      doi: "10.1016/j.semradonc.2025.02.009",
      category: "primary"
    },
    {
      id: "hytec",
      citation: "Marks LB, et al. Use of normal tissue complication probability models in the clinic. Int J Radiat Oncol Biol Phys. 2010;76(3 Suppl):S10-19.",
      category: "supporting"
    },
  ],
  lastUpdated: new Date().toISOString(),
  updatedBy: "system"
};

async function seed() {
  if (!process.env.REDIS_URL) {
    console.error('Missing REDIS_URL environment variable');
    process.exit(1);
  }

  const redis = new Redis(process.env.REDIS_URL);

  try {
    console.log('Connecting to Redis...');
    
    // Check if content exists
    const existing = await redis.get(CONTENT_KEY);
    if (existing) {
      console.log('Content key already exists. Skipping seed.');
      const parsed = JSON.parse(existing);
      console.log(`Current content last updated: ${parsed.lastUpdated || 'Never'}`);
    } else {
      console.log('Seeding initial content...');
      const initialContent = {
        ...defaultContent,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'Seed Script',
      };
      
      await redis.set(CONTENT_KEY, JSON.stringify(initialContent));
      console.log('Content seeded successfully.');
      
      // Initialize audit log
      await redis.set(AUDIT_KEY, JSON.stringify([]));
      console.log('Audit log initialized.');
    }

  } catch (error) {
    console.error('Failed to seed KV:', error);
    process.exit(1);
  } finally {
    redis.disconnect();
  }
}

seed();
