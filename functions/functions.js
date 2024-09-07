const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { GENERAL, INFO, LINK, USAGE, USER } = require("./constants");

initializeApp();
const db = getFirestore();
const auth = getAuth();

const mail = "@ulink.mehmetuysal.dev";

exports.indexIncrease = async () => {
  const index = db.collection(GENERAL).doc(INFO);
  await index
    .update({ index: FieldValue.increment(1) })
    .catch(async () => await index.set({ index: 1 }));
  return true;
};
/** @param {string} id */
exports.usageIncrease = async (id) => {
  const link = db.collection(LINK).doc(id);
  await link
    .update({ "data.usage": FieldValue.increment(1) })
    .catch(async () => await link.set({ "data.usage": 1 }));
  return true;
};
/** @param {string} id */
exports.userVisitIncrease = async (id) => {
  const user = db.collection(USER).doc(id);
  await user
    .update({ visit: FieldValue.increment(1) })
    .catch(async () => await user.set({ visit: 1 }));
  return true;
};

/**
 * @param {string} id
 * @param {string} password
 */
exports.createAuth = async (id, password) => {
  await auth.createUser({
    uid: id,
    email: `${id}${mail}`,
    password: password,
  });
  return true;
};

/** @param {string} id */
exports.removeAuth = async (id) => {
  await auth.deleteUser(id);
  return true;
};

/** @param {string} id */
exports.removeLink = async (id) => {
  await db.collection(LINK).doc(id).delete();
  return true;
};

exports.removeOldLinks = async () => {
  const month = Date.now() - 30 * 24 * 60 * 60;
  const snapshot = await db
    .collection(LINK)
    .where("utimestamp", "<", month)
    .get();
  for (let index = 0; index < snapshot.docs.length; index++) {
    await this.removeLink.pLogger(snapshot.docs[index].id).catch(() => false);
  }
  return true;
};

/** @param {string} id */
exports.removeUsage = async (id) => {
  await db.collection(USAGE).doc(id).delete();
  return true;
};

/**
 * @typedef {Object} UDLink
 * @property {string} id
 * @property {string} uid
 * @property {ULink} data
 * @property {boolean} timestamp
 * @property {boolean} utimestamp
 */

/**
 * @typedef {Object} ULink
 * @property {string} url
 * @property {string} backgroundUrl
 * @property {number} timer
 * @property {boolean} showRedirectButton
 * @property {number} usage
 * @property {number} usageLimit
 * @property {boolean} isActive
 * @property {boolean} isProtected
 * @property {string} password
 * @property {EditorResult} content
 */

/**
 * @typedef {Object} ULink
 * @property {string} url
 * @property {string} backgroundUrl
 * @property {number} timer
 * @property {boolean} showRedirectButton
 * @property {number} usage
 * @property {number} usageLimit
 * @property {boolean} isActive
 * @property {boolean} isProtected
 * @property {string} password
 * @property {EditorResult} content
 */

/**
 * @typedef {Object} EditorBlock
 * @property {string} id
 * @property {string} type
 * @property {any} data
 */

/**
 * @typedef {Object} EditorResult
 * @property {Array<EditorBlock>} blocks
 * @property {number} time
 * @property {string} version
 */
