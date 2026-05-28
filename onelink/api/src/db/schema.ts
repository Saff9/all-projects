import { pgTable, serial, text, timestamp, integer, jsonb, boolean, varchar, foreignKey } from 'drizzle-orm/pg-core';

// Users (Clerk syncs automatically, but add custom fields)
export const users = pgTable('users', {
  id: varchar('id', { length: 191 }).primaryKey(), // Clerk user ID
  email: varchar('email', { length: 191 }).notNull().unique(),
  username: varchar('username', { length: 50 }).unique(),
  displayName: varchar('display_name', { length: 100 }),
  photoURL: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Profiles  
export const profiles = pgTable('profiles', {
  id: varchar('id', { length: 191 }).primaryKey(),
  userId: varchar('user_id', { length: 191 }).references(() => users.id),
  username: varchar('username', { length: 50 }).unique(),
  displayName: varchar('display_name', { length: 100 }),
  bio: text('bio'),
  avatarURL: text('avatar_url'),
  coverImageURL: text('cover_image_url'),
  templateId: varchar('template_id', { length: 50 }).default('minimal'),
  themeSettings: jsonb('theme_settings'),
  socialLinks: jsonb('social_links'),
  seoSettings: jsonb('seo_settings'),
  stats: jsonb('stats'),
  isPublished: boolean('is_published').default(false),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Links
export const links = pgTable('links', {
  id: serial('id').primaryKey(),
  profileId: varchar('profile_id', { length: 191 }).references(() => profiles.id),
  url: text('url').notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  iconURL: text('icon_url'),
  order: integer('order').notNull(),
  isActive: boolean('is_active').default(true),
  clickCount: integer('click_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Analytics
export const analytics = pgTable('analytics', {
  id: serial('id').primaryKey(),
  profileId: varchar('profile_id', { length: 191 }).references(() => profiles.id),
  type: varchar('type', { length: 10 }).notNull(), // 'view' | 'click'
  linkId: integer('link_id'),
  visitorData: jsonb('visitor_data'),
  date: varchar('date', { length: 10 }),
  hour: integer('hour'),
  createdAt: timestamp('created_at').defaultNow(),
});

