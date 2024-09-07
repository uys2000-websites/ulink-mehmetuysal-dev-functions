const { info, warn, error } = require("firebase-functions/logger");
const { setULogger } = require("u-logger");

const {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} = require("firebase-functions/v2/firestore");
const {
  indexIncrease,
  createAuth,
  removeAuth,
  clearOldLinks,
  usageIncrease,
  removeLink,
  removeUsage,
  userVisitIncrease,
} = require("./functions");
const { LINK, USAGE } = require("./constants");
const { onSchedule } = require("firebase-functions/v2/scheduler");

setULogger(
  true,
  false,
  (type, status, name, args) => info(name, type, status, args),
  (...args) => warn(...args),
  (type, status, name, args) => error(name, type, status, args)
);

exports.onLinkCreated = onDocumentCreated(`/${LINK}/{id}`, async (event) => {
  /** @type {UDLink} */
  const link = event.data.data();
  await indexIncrease.pLogger({}).catch(() => false);
  if (link.data.password)
    await createAuth.pLogger(link.id, link.data.password).catch(() => false);
});

exports.onLinkUpdated = onDocumentUpdated(`/${LINK}/{id}`, async (event) => {
  /** @type {UDLink} */
  const oldLink = event.data.before.data();
  /** @type {UDLink} */
  const link = event.data.after.data();
  if (!oldLink.data.password && link.data.password)
    await createAuth.pLogger(link.id, link.data.password).catch(() => false);
  if (oldLink.data.password && !link.data.password)
    await removeAuth.pLogger(link.id).catch(() => false);
  if (link.data.usageLimit != 0 && link.data.usageLimit <= link.data.usage) {
    if (link.data.password)
      await removeAuth.pLogger(link.id).catch(() => false);
    await removeLink.pLogger(link.id).catch(() => false);
  }
});

exports.onLinkDeleted = onDocumentDeleted(`/${LINK}/{id}`, async (event) => {
  /** @type {UDLink} */
  const link = event.data.data();
  if (link.data.password) await removeAuth.pLogger(link.id).catch(() => false);
});

exports.onUsageCreated = onDocumentCreated(`/${USAGE}/{id}`, async (event) => {
  /** @type {UUsage} */
  const usage = event.data.data();
  await usageIncrease.pLogger(usage.id).catch(() => false);
  await userVisitIncrease.pLogger(usage.uid).catch(() => false);
  await removeUsage.pLogger(event.params.id).catch(() => false);
});

//exports.scheduledClean = onSchedule("every day 21:20", (event) => {
//  clearOldLinks.pLogger().catch(() => false);
//});

/**
 * @typedef {Object} UUsage
 * @property {string} id
 * @property {string} uid
 */
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
