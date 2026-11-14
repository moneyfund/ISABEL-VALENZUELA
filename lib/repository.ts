import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db, firebaseReady } from "./firebase";
import { type Property, type SiteContent, defaultSite, normalizeSiteContent } from "./models";

/**
 * The public catalog only includes actual published Firestore listings.
 * Sample listings remain editable/removable under Admin > Properties > DEMO.
 */
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
        .map(item => ({ ...item.data(), id: item.id } as Property))
        .filter(item => !item.demo)
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
  // Do not expose fictitious property cards (even via direct /propiedades/demo-* URLs).
  if (id.startsWith("demo-") || !firebaseReady || !db) return null;
  const snapshot = await getDoc(doc(db, "properties", id));
  const data = snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as Property) : null;
  return data?.published && !data.demo ? data : null;
}
