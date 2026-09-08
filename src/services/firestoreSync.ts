import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { MemoryItem } from "../types";

export interface CompactionRecord {
  id: string;
  userId: string;
  activeGoal: string;
  originalTokens: number;
  compressedTokens: number;
  engine: string;
  synthesizedMemory: string;
  createdAt: string;
}

/**
 * Saves or updates a memory item in Firestore for the given user.
 */
export async function saveMemoryToFirestore(userId: string, memory: MemoryItem): Promise<void> {
  const path = `users/${userId}/memories`;
  const memoryId = memory.id || `mem-${Date.now()}`;
  const docRef = doc(db, path, memoryId);

  const payload = {
    id: memoryId,
    userId,
    type: memory.type,
    title: memory.title,
    content: memory.content,
    tags: memory.tags || [],
    confidence: memory.confidence ?? 0.9,
    createdAt: memory.createdAt || new Date().toISOString(),
    sourceFile: memory.sourceFile || "",
  };

  try {
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${memoryId}`);
  }
}

/**
 * Deletes a memory item from Firestore.
 */
export async function deleteMemoryFromFirestore(userId: string, memoryId: string): Promise<void> {
  const path = `users/${userId}/memories/${memoryId}`;
  const docRef = doc(db, `users/${userId}/memories`, memoryId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Sets up a realtime snapshot listener for the user's memories.
 */
export function subscribeToUserMemories(
  userId: string,
  onUpdate: (memories: MemoryItem[]) => void
): () => void {
  const path = `users/${userId}/memories`;
  const colRef = collection(db, path);

  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      const items: MemoryItem[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: d.id || docSnap.id,
          userId: d.userId,
          type: d.type,
          title: d.title,
          content: d.content,
          tags: d.tags || [],
          confidence: d.confidence ?? 0.9,
          createdAt: d.createdAt,
          sourceFile: d.sourceFile,
        });
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  return unsubscribe;
}

/**
 * Records a context compaction session run in Firestore.
 */
export async function recordCompactionSession(
  userId: string,
  record: Omit<CompactionRecord, "userId">
): Promise<void> {
  const path = `users/${userId}/compaction_sessions`;
  const docRef = doc(db, path, record.id);
  const payload = {
    ...record,
    userId,
  };

  try {
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${record.id}`);
  }
}

/**
 * Fetches recent compaction session logs.
 */
export async function fetchUserCompactionHistory(userId: string): Promise<CompactionRecord[]> {
  const path = `users/${userId}/compaction_sessions`;
  try {
    const q = query(collection(db, path), orderBy("createdAt", "desc"), limit(20));
    const snapshot = await getDocs(q);
    const records: CompactionRecord[] = [];
    snapshot.forEach((docSnap) => {
      records.push(docSnap.data() as CompactionRecord);
    });
    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Creates or updates a basic user profile record upon authentication.
 */
export async function syncUserProfile(user: { uid: string; email: string | null; displayName: string | null }) {
  const path = `users/${user.uid}`;
  const docRef = doc(db, "users", user.uid);
  try {
    await setDoc(
      docRef,
      {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "Developer",
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
