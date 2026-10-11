import { User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile, Address } from "../types";

export function formatAuthError(error: any): string {
  if (!error) return "An unexpected error occurred.";
  const code = error.code || "";
  const msg = error.message || "";

  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
      return "No account found with this email. Please sign up.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again or reset your password.";
    case "auth/invalid-credential":
      return "Incorrect credentials. Please verify your email and password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in instead.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Google sign-in popup was closed before completion.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups for this site.";
    case "auth/cancelled-popup-request":
      return "Another login attempt is already in progress.";
    case "auth/invalid-phone-number":
      return "Invalid phone number format. Please enter a valid 10-digit mobile number.";
    case "auth/missing-phone-number":
      return "Please provide a valid phone number.";
    case "auth/quota-exceeded":
      return "SMS quota exceeded for today. Please continue with Google or Email login.";
    case "auth/invalid-verification-code":
      return "Incorrect OTP code. Please check the SMS and try again.";
    case "auth/code-expired":
      return "Verification code has expired. Please request a new OTP.";
    case "auth/too-many-requests":
      return "Too many requests. Please wait a few moments before trying again.";
    case "auth/network-request-failed":
      return "Network connection error. Please check your internet connection.";
    case "auth/requires-recent-login":
      return "Please sign in again to complete this sensitive action.";
    default:
      if (msg.includes("reCAPTCHA")) {
        return "reCAPTCHA verification failed. Please try again.";
      }
      return msg.replace(/^Firebase:\s*/, "") || "Authentication failed. Please try again.";
  }
}

/**
 * Syncs the Firebase User object with Firestore /users/{uid} document.
 * Returns the consolidated UserProfile.
 */
export async function syncUserProfileWithFirestore(
  user: User,
  additionalData?: { name?: string; phone?: string; scentPreference?: string }
): Promise<UserProfile> {
  const userRef = doc(db, "users", user.uid);
  let existingData: any = null;

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      existingData = snap.data();
    }
  } catch (err) {
    console.warn("Could not read user profile from Firestore:", err);
  }

  const resolvedName =
    additionalData?.name?.trim() ||
    user.displayName ||
    existingData?.name ||
    (user.email ? user.email.split("@")[0] : "") ||
    "Mijaz Customer";

  const resolvedEmail = user.email || existingData?.email || "";
  const resolvedPhone = additionalData?.phone?.trim() || user.phoneNumber || existingData?.phone || "";
  const resolvedPhoto = user.photoURL || existingData?.photoURL || "";
  const resolvedScent = additionalData?.scentPreference || existingData?.scentPreference || "Oud & Smoky";
  const resolvedAddresses: Address[] = existingData?.addresses || [];
  const resolvedOrders = existingData?.orders || [];

  const profileData: UserProfile = {
    uid: user.uid,
    name: resolvedName,
    email: resolvedEmail,
    phone: resolvedPhone,
    photoURL: resolvedPhoto,
    scentPreference: resolvedScent,
    addresses: resolvedAddresses,
    orders: resolvedOrders
  };

  try {
    await setDoc(
      userRef,
      {
        uid: user.uid,
        name: resolvedName,
        email: resolvedEmail,
        phone: resolvedPhone,
        photoURL: resolvedPhoto,
        scentPreference: resolvedScent,
        updatedAt: serverTimestamp(),
        ...(!existingData ? { createdAt: serverTimestamp() } : {})
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Could not write user profile to Firestore:", err);
  }

  return profileData;
}

/**
 * Updates user profile details in Firestore
 */
export async function updateFirestoreUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  if (!uid) return;
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(
      userRef,
      {
        ...updates,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Failed to update user profile in Firestore:", err);
  }
}
