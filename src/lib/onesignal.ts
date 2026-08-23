import { apiFetch, getSession } from './api';

/**
 * OneSignal Web Push — modular façade for Student_portal.
 *
 * Site: https://westin-student.vercel.app (own OneSignal app — browser same-origin
 * policy forbids sharing the faculty portal's app across origins).
 *
 * External IDs: student_<users.id> via getOneSignalExternalId().
 * This helper is the single source of truth — inline construction elsewhere is forbidden.
 * The backend imports an identical helper from
 * westin-api/src/modules/notifications/notifications.service.ts; they must stay in sync.
 *
 * Permission model:
 * - OneSignal.init() in index.html does NOT auto-prompt (prompts: [], notifyButton: false,
 *   autoResubscribe: false).
 * - The native permission prompt is requested IMMEDIATELY AFTER A SUCCESSFUL LOGIN, from
 *   the login click's transient-activation window (browsers require a gesture; supported
 *   browsers are Chrome/Edge/Firefox — Safari/iOS is out of scope).
 * - Fallbacks: the post-login banner button and the Settings toggle both call
 *   subscribeOneSignal() from a direct click handler.
 * - Never prompt on page load or session restore (no gesture available there).
 * - Browsers grant the Notification permission ONCE per profile. On later logins
 *   identifyOneSignalUser() silently re-subscribes if permission is 'granted' but the
 *   device is not opted in.
 * - Identity operations (logout/login/optIn) are serialized so a pending logout() can
 *   never resolve after the next login() and unlink the new user.
 */

/** Single shared helper — call this everywhere an external_id is needed. */
export function getOneSignalExternalId(user: { id: string }): string {
  return `student_${user.id}`;
}

type OneSignalApi = {
  init: (opts: Record<string, unknown>) => Promise<void>;
  login: (externalId: string) => Promise<void>;
  logout: () => Promise<void>;
  User: {
    addTags?: (tags: Record<string, string>) => Promise<void> | void;
    addTag?: (key: string, value: string) => Promise<void> | void;
    onesignalId?: string;
    externalId?: string;
    PushSubscription: {
      id?: string | null;
      token?: string | null;
      optedIn: boolean;
      optIn: () => Promise<void>;
      optOut: () => Promise<void>;
      addEventListener?: (event: string, cb: (e: unknown) => void) => void;
      removeEventListener?: (event: string, cb: (e: unknown) => void) => void;
    };
  };
  Notifications: {
    requestPermission: () => Promise<boolean | void>;
    permission: boolean;
    permissionNative?: string; // 'granted' | 'denied' | 'default'
    isPushSupported: () => boolean;
    addEventListener?: (event: string, cb: (...args: unknown[]) => void) => void;
    removeEventListener?: (event: string, cb: (...args: unknown[]) => void) => void;
  };
  Slidedown: {
    promptPush: (opts?: unknown) => Promise<void>;
  };
  Debug?: { setLogLevel: (level: string) => void };
};

declare global {
  interface Window {
    OneSignalDeferred?: Array<(oneSignal: OneSignalApi) => void | Promise<void>>;
    OneSignal?: OneSignalApi;
  }
}

const LAST_EXTERNAL_ID_KEY = 'student-portal.onesignal:lastExternalId';

function readLastExternalId(): string | null {
  try {
    return window.localStorage.getItem(LAST_EXTERNAL_ID_KEY);
  } catch {
    return null;
  }
}

function writeLastExternalId(id: string | null): void {
  try {
    if (id === null) window.localStorage.removeItem(LAST_EXTERNAL_ID_KEY);
    else window.localStorage.setItem(LAST_EXTERNAL_ID_KEY, id);
  } catch {}
}

// Identity ops must never interleave: a logout() still in flight when the next
// login(externalId) runs would unlink the freshly identified user. Chain every
// identity mutation.
let identityChain: Promise<unknown> = Promise.resolve();
function enqueueIdentity<T>(fn: () => Promise<T>): Promise<T> {
  const run = identityChain.then(fn, fn);
  identityChain = run.catch(() => undefined);
  return run;
}

/** Resolve the live OneSignal instance, waiting for the Deferred queue if needed. */
function getOneSignalSync(): OneSignalApi | null {
  try {
    const w = window as unknown as Window;
    if (w.OneSignal && typeof (w.OneSignal as OneSignalApi).login === 'function') return w.OneSignal as OneSignalApi;
  } catch {}
  return null;
}

function withOneSignal<T>(fn: (os: OneSignalApi) => Promise<T> | T): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const sync = getOneSignalSync();
    if (sync) {
      Promise.resolve(fn(sync)).then(resolve).catch(reject);
      return;
    }
    const w = window as unknown as Window;
    w.OneSignalDeferred = w.OneSignalDeferred || [];
    w.OneSignalDeferred.push(async (os: OneSignalApi) => {
      try {
        resolve(await fn(os));
      } catch (e) {
        reject(e);
      }
    });
    // Do not hang login on OneSignal if SDK never loads (offline / blocked).
    // Callers swallow errors, same as the faculty portal façade.
    window.setTimeout(() => {
      // no-op: we do not reject here to avoid breaking auth
    }, 5000);
  });
}

// ---------- Public helpers (modular, easy to change/remove) ----------

export type PushState = {
  isSupported: boolean;
  permission: boolean; // Notifications.permission === true
  permissionNative: 'granted' | 'denied' | 'default';
  optedIn: boolean; // PushSubscription.optedIn
  subscriptionId: string | null;
};

/** Snapshot of current push state — safe to call before init. */
export async function getOneSignalState(): Promise<PushState> {
  const fallback: PushState = {
    isSupported: false,
    permission: false,
    permissionNative: (typeof Notification !== 'undefined' ? (Notification.permission as PushState['permissionNative']) : 'default') || 'default',
    optedIn: false,
    subscriptionId: null,
  };
  try {
    return await withOneSignal((os) => {
      const isSupported = (() => {
        try {
          return os.Notifications.isPushSupported();
        } catch {
          return typeof Notification !== 'undefined' && 'serviceWorker' in navigator;
        }
      })();
      let permission = false;
      let permissionNative: PushState['permissionNative'] = 'default';
      try {
        permission = !!os.Notifications.permission;
        const raw = (os.Notifications.permissionNative as string) || (typeof Notification !== 'undefined' ? Notification.permission : 'default');
        if (raw === 'granted' || raw === 'denied' || raw === 'default') permissionNative = raw as PushState['permissionNative'];
      } catch {
        permissionNative = (typeof Notification !== 'undefined' ? (Notification.permission as string) : 'default') as PushState['permissionNative'];
        permission = permissionNative === 'granted';
      }
      let optedIn = false;
      let subscriptionId: string | null = null;
      try {
        optedIn = !!os.User.PushSubscription.optedIn;
        subscriptionId = (os.User.PushSubscription.id as string | null) ?? null;
      } catch {}
      return { isSupported, permission, permissionNative, optedIn, subscriptionId };
    });
  } catch {
    return fallback;
  }
}

/**
 * Subscribe this browser for push.
 * MUST be called from a user gesture (button click / login click) — otherwise the
 * browser may block the native permission prompt. Returns true if subscribed,
 * false if blocked/denied/unsupported/already-subscribed.
 */
export async function subscribeOneSignal(): Promise<boolean> {
  try {
    const state = await getOneSignalState();
    if (!state.isSupported) return false;
    if (state.permissionNative === 'denied') return false; // cannot prompt again until user resets in browser
    if (state.optedIn && state.permission) {
      // Already subscribed (e.g. permission granted on an earlier visit) — still say
      // thanks once: browsers that subscribed before this feature existed never got it.
      void sendSubscriptionThanksOnce();
      return true; // nothing to ask
    }

    await withOneSignal(async (os) => {
      // optIn() triggers the native permission prompt when needed and must be called
      // with transient activation (from a click).
      if (os.User?.PushSubscription?.optIn) {
        await os.User.PushSubscription.optIn();
      } else if (os.Notifications?.requestPermission) {
        await os.Notifications.requestPermission();
      } else if (os.Slidedown?.promptPush) {
        await os.Slidedown.promptPush({ force: true } as unknown);
      }
    });

    const after = await getOneSignalState();
    if (after.optedIn && after.permission) void sendSubscriptionThanksOnce();
    return after.optedIn && after.permission;
  } catch (err) {
    console.debug('[OneSignal] subscribe blocked/failed', err);
    return false;
  }
}

/** Unsubscribe this browser (optOut). Always succeeds locally. */
export async function unsubscribeOneSignal(): Promise<void> {
  try {
    await withOneSignal(async (os) => {
      if (os.User?.PushSubscription?.optOut) {
        await os.User.PushSubscription.optOut();
      }
    });
  } catch (err) {
    console.debug('[OneSignal] unsubscribe failed', err);
  }
}

/**
 * Identify the current student on this browser — call on EVERY login and on session
 * restore (page reload with an existing session), per OneSignal best practice.
 * If the browser permission is already 'granted' but the device is not opted in,
 * this silently re-subscribes; it never requests permission itself.
 */
export async function identifyOneSignalUser(user: { id: string }): Promise<void> {
  ensureFirstSubscriptionWatcher();
  const nextId = getOneSignalExternalId(user);
  const lastId = readLastExternalId();

  try {
    await enqueueIdentity(() =>
      withOneSignal(async (os) => {
        if (lastId && lastId !== nextId) {
          try {
            await os.logout();
          } catch {}
        }
        await os.login(nextId);
        try {
          const tags = { role: 'student', student_id: user.id };
          if (os.User?.addTags) await os.User.addTags(tags);
          else if (os.User?.addTag) {
            for (const [k, v] of Object.entries(tags)) await os.User.addTag(k, v);
          }
        } catch {}
        writeLastExternalId(nextId);

        // Permission already granted ⇒ optIn() needs no gesture and shows no prompt.
        try {
          const native =
            os.Notifications?.permissionNative ??
            (typeof Notification !== 'undefined' ? (Notification.permission as string | undefined) : undefined);
          if (native === 'granted' && os.User?.PushSubscription && !os.User.PushSubscription.optedIn) {
            await os.User.PushSubscription.optIn();
          }
        } catch {}

        // Thank the user once when this browser is (or just became) subscribed. This
        // catches the login-time permission grant — with the parallel subscribe the
        // subscription can land before the session is stored, and this retry fires
        // right after login()/setSession complete — and heals browsers that
        // subscribed before the thank-you feature existed.
        try {
          if (os.User?.PushSubscription?.optedIn) void sendSubscriptionThanksOnce();
        } catch {}
      }),
    );
  } catch (err) {
    console.debug('[OneSignal] identify failed', err);
  }
}

/** Unlink this device from the current identity. Call before clearing session on logout.
 * Keeps browser permission and the subscription itself — the next login() re-attaches it. */
export async function logoutOneSignalUser(): Promise<void> {
  try {
    await enqueueIdentity(() =>
      withOneSignal(async (os) => {
        try {
          await os.logout();
        } catch {}
        writeLastExternalId(null);
      }),
    );
  } catch {}
}

/** Best-effort: true if the OneSignal page SDK script is present. */
export function isOneSignalSupported(): boolean {
  try {
    return typeof window !== 'undefined' && (typeof window.OneSignal !== 'undefined' || Array.isArray(window.OneSignalDeferred));
  } catch {
    return false;
  }
}

// ---------- first-subscription thank-you ----------

// Exactly ONE thank-you push per browser (localStorage flag). It is sent the
// moment this browser is confirmed subscribed — permission granted at login
// (the common path), the banner / first Settings enable, or the subscription
// change event — whichever lands first. Settings off→on toggles never re-send
// (the flag survives them). The backend sends the push (POST
// /notifications/thanks); it is not recorded in the admin History.
const THANKED_KEY = 'westin:onesignal:thanked';

export async function sendSubscriptionThanksOnce(): Promise<void> {
  try {
    if (localStorage.getItem(THANKED_KEY)) return;
  } catch {
    return;
  }
  // The login flow subscribes in parallel with the verify request, so the
  // subscription can exist before the session is stored. Skip without setting
  // the flag — identifyOneSignalUser() retries right after the session lands.
  if (!getSession()) return;
  try {
    localStorage.setItem(THANKED_KEY, String(Date.now()));
  } catch {
    return;
  }
  try {
    await apiFetch('/notifications/thanks', { method: 'POST' });
  } catch {
    try {
      localStorage.removeItem(THANKED_KEY); // allow a later retry
    } catch {}
  }
}

let firstSubscriptionWatched = false;
export function ensureFirstSubscriptionWatcher(): void {
  if (firstSubscriptionWatched) return;
  firstSubscriptionWatched = true;
  void withOneSignal((os) => {
    os.User.PushSubscription.addEventListener?.('change', (e: unknown) => {
      const ev = e as {
        previous?: { id?: string | null; token?: string | null };
        current?: { id?: string | null; token?: string | null };
      };
      const wasNone = !ev.previous?.id && !ev.previous?.token;
      const hasNow = !!ev.current?.id && !!ev.current?.token;
      if (!wasNone || !hasNow) return;
      void sendSubscriptionThanksOnce();
    });
  }).catch(() => undefined);
}
