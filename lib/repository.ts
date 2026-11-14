import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db, firebaseReady } from "./firebase";
import { demoProperties } from "./demo";
import { defaultSite, normalizeSiteContent, type Property, type SiteContent } from "./models";

export function subscribeProperties(
  next: (items: Property[]) => void, fail: (error: Error) => void
): () => void {
  if (!firebaseReady || !db) {
    next(demoProperties);
    return () => {};
  }

  let published: Property[] | null = null;
  let hiddenDemoIds: string[] | null = null;
  let active = true;

  function sendCatalog() {
    if (!active || published === null || hiddenDemoIds === null) return;
    // Demo cards are local examples, not Firestore properties. When there are
    // real published listings they are not mixed into the public catalog.
    const availableDemos = demoProperties.filter(item => !hiddenDemoIds!.includes(item.id));
    next(published.length ? published : availableDemos);
  }

  function failCatalog(error: Error) {
    if (!active) return;
    // Never reintroduce hidden demo cards when a Firestore read fails.
    next([]);
    fail(error);
  }

  const stopProperties = onSnapshot(
    query(collection(db, "properties"), where("published", "==", true)),
    snapshot => {
      published = snapshot.docs.map(item => ({ ...item.data(), id: item.id } as Property))
        .sort((a, b) => b.createdAt - a.createdAt);
      sendCatalog();
    },
    failCatalog
  );
  const stopSite = onSnapshot(
    doc(db, "site", "public"),
    snapshot => {
      hiddenDemoIds = normalizeSiteContent(snapshot.exists() ? snapshot.data() : null).hiddenDemoIds;
      sendCatalog();
    },
    failCatalog
  );

  return () => {
    active = false;
    stopProperties();
    stopSite();
  };
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
  if (id.startsWith("demo-")) {
    const demo = demoProperties.find(item => item.id === id);
    if (!demo) return null;
    if (!firebaseReady || !db) return demo;
    // An archived example must also disappear from its direct URL.
    const site = await getDoc(doc(db, "site", "public"));
    const hiddenIds = normalizeSiteContent(site.exists() ? site.data() : null).hiddenDemoIds;
    return hiddenIds.includes(id) ? null : demo;
  }
  if (!firebaseReady || !db) return null;
  const snapshot = await getDoc(doc(db, "properties", id));
  const data = snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as Property) : null;
  return data?.published ? data : null;
}
