import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db, firebaseReady } from "./firebase";
import { demoProperties } from "./demo";
import { defaultSite, type Property, type SiteContent } from "./models";

export function subscribeProperties(
  next: (items: Property[]) => void, fail: (error: Error) => void
): () => void {
  if (!firebaseReady || !db) {
    next(demoProperties);
    return () => {};
  }
  return onSnapshot(
    query(collection(db, "properties"), where("published", "==", true)),
    snapshot => {
      const items = snapshot.docs.map(item => ({ ...item.data(), id: item.id } as Property))
        .sort((a, b) => b.createdAt - a.createdAt);
      // Demo fichas remain visible until an actual listing is published.
      // No fictitious item is written to Firestore.
      next(items.length ? items : demoProperties);
    },
    error => { next(demoProperties); fail(error); }
  );
}

export function subscribeSite(next: (content: SiteContent) => void, fail: (error: Error) => void): () => void {
  if (!firebaseReady || !db) {
    next(defaultSite);
    return () => {};
  }
  return onSnapshot(doc(db, "site", "public"),
    snapshot => next({ ...defaultSite, ...(snapshot.exists() ? snapshot.data() : {}) }),
    error => fail(error)
  );
}

export async function getProperty(id: string): Promise<Property | null> {
  if (id.startsWith("demo-")) return demoProperties.find(p => p.id === id) || null;
  if (!firebaseReady || !db) return null;
  const snapshot = await getDoc(doc(db, "properties", id));
  const data = snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as Property) : null;
  return data?.published ? data : null;
}
