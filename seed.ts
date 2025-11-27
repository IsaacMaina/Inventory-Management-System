import { db } from './src/lib/db';
import { users } from './drizzle/schema';
import { hashPassword } from './src/lib/auth/utils';
import { eq } from 'drizzle-orm';

async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // Create admin user - use a strong password that meets validation requirements
    const hashedPassword = await hashPassword('Admin123@Secure'); // Meets validation: 8 chars, upper, lower, number, special char

    // Check if admin user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, 'admin@example.com'));

    if (existingUser.length > 0) {
      console.log('Admin user already exists, updating...');
      await db.update(users)
        .set({
          name: 'Admin User',
          password: hashedPassword,
          role: 'admin'
        })
        .where(eq(users.email, 'admin@example.com'));
    } else {
      console.log('Creating admin user...');
      await db.insert(users).values({
        id: 'admin-123', // We'll use a fixed ID for consistency
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
      });
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();