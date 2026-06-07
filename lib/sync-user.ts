import type { User as ClerkUser } from "@clerk/backend";
import { eq } from "drizzle-orm";

import { db, users } from "@/db";

export class MissingPrimaryEmailError extends Error {
  constructor() {
    super("The authenticated account does not have a primary email address.");
    this.name = "MissingPrimaryEmailError";
  }
}

function getUserName(user: ClerkUser) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return fullName || user.username || null;
}

export async function syncUser(user: ClerkUser) {
  const primaryEmail = user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId,
  )?.emailAddress;

  if (!primaryEmail) {
    throw new MissingPrimaryEmailError();
  }

  const values = {
    clerkId: user.id,
    name: getUserName(user),
    email: primaryEmail,
    profileImage: user.imageUrl || null,
  };

  const [existingByClerkId] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, user.id))
    .limit(1);

  if (existingByClerkId) {
    const [updatedUser] = await db
      .update(users)
      .set(values)
      .where(eq(users.id, existingByClerkId.id))
      .returning();

    return updatedUser;
  }

  const [existingByEmail] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, primaryEmail))
    .limit(1);

  if (existingByEmail) {
    const [linkedUser] = await db
      .update(users)
      .set(values)
      .where(eq(users.id, existingByEmail.id))
      .returning();

    return linkedUser;
  }

  const [syncedUser] = await db
    .insert(users)
    .values(values)
    .onConflictDoUpdate({
      target: users.email,
      set: values,
    })
    .returning();

  return syncedUser;
}
