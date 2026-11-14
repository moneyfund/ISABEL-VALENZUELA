import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db, firebaseReady } from "./firebase";
import { type Property, type SiteContent, defaultSite, normalizeSiteContent } from "./models";

/** The public catalog contains only real, published Firestore listings. */
export function subscribeProperties(
  next: (items: Property[]) => void, fail: (error: Error) => void
): () => void {
  if (!firebaseReady || !db) {
    next([]);
    return () => {};
  }
  return onSnapshot(
    query(collection(db, "properties"), where("published", "==", true)),
    snapshot => {
      const listings = snapshot.docs
        // Protect against old sample documents accidentally stored in Firestore.
        .filter(entry => !entry.id.startsWith("demo-") && entry.data().demo !== true)
        .map(entry => ({ ...entry.data(), id: entry.id } as Property))
        .sort((a, b) => b.createdAt - a.createdAt);
      next(listings);
    },
    error => { next([]); fail(error); }
  );
}

export function subscribeSite(next: (content: SiteContent) => void, fail: (error: Error) => void): () => void {
  if (!firebaseReady || !db) {
    next(defaultSite);
    return () => {};
  }
  return onSnapshot(doc(db, "site", "public"),
    snapshot => next(normalizeSiteContent(snapshot.exists() ? snapshot.data() : null)),
    error => fail(error)
  );
}

export async function getProperty(id: string): Promise<Property | null> {
  // Never expose legacy sample identifiers, including through direct URLs.
  if (id.startsWith("demo-") || !firebaseReady || !db) return null;
  const snapshot = await getDoc(doc(db, "properties", id));
  if (!snapshot.exists() || snapshot.data().demo === true) return null;
  const data = { ...snapshot.data(), id: snapshot.id } as Property;
  return data.published ? data : null;
}
