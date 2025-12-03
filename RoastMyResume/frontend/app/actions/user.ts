"use server";

import { sql } from "../lib/db";

/**
 * Fetches the user's subscription tier from Neon DB.
 * If the user does not exist in our custom users table, we create a record for them.
 */
export async function fetchUserTier(userId: string, email?: string | null, name?: string | null): Promise<string> {
  try {
    const rows = await sql`SELECT tier FROM users WHERE id = ${userId}`;
    
    if (rows.length === 0) {
      const userEmail = email || `${userId}@temp.com`;
      const userName = name || "User";
      
      // Auto-insert user into our application users table
      await sql`
        INSERT INTO users (id, email, name, tier) 
        VALUES (${userId}, ${userEmail}, ${userName}, 'free')
      `;
      return "free";
    }
    
    return rows[0].tier || "free";
  } catch (error) {
    console.error("Error fetching user tier:", error);
    return "free";
  }
}

/**
 * Upgrades the user's tier to pro.
 */
export async function upgradeUserToPro(userId: string): Promise<boolean> {
  try {
    await sql`
      UPDATE users 
      SET tier = 'pro' 
      WHERE id = ${userId}
    `;
    return true;
  } catch (error) {
    console.error("Error upgrading user to pro:", error);
    return false;
  }
}
