import PouchDB from "pouchdb-browser";

const db = new PouchDB("syncboard_local");

const BOARD_DOC_ID = "board_snapshot";
const QUEUE_DOC_ID = "pending_actions";

export async function saveBoardSnapshot(board, stats) {
  try {
    const existing = await db.get(BOARD_DOC_ID).catch(() => null);
    await db.put({
      _id: BOARD_DOC_ID,
      _rev: existing?._rev,
      board,
      stats,
      savedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to cache board locally:", err);
  }
}

export async function getBoardSnapshot() {
  try {
    const doc = await db.get(BOARD_DOC_ID);
    return { board: doc.board, stats: doc.stats };
  } catch {
    return null;
  }
}

export async function getPendingActions() {
  try {
    const doc = await db.get(QUEUE_DOC_ID);
    return doc.actions;
  } catch {
    return [];
  }
}

export async function addPendingAction(action) {
  const existing = await db.get(QUEUE_DOC_ID).catch(() => null);
  const actions = existing ? existing.actions : [];
  actions.push({ ...action, queuedAt: new Date().toISOString() });
  await db.put({
    _id: QUEUE_DOC_ID,
    _rev: existing?._rev,
    actions,
  });
}

export async function clearPendingActions() {
  const existing = await db.get(QUEUE_DOC_ID).catch(() => null);
  if (!existing) return;
  await db.put({ _id: QUEUE_DOC_ID, _rev: existing._rev, actions: [] });
}