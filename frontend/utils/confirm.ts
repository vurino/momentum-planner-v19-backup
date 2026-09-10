// frontend/utils/confirm.ts
//
// notify() and confirmAsync() keep their original call signatures — every
// existing call site across the app (settings.tsx, routine.tsx, etc.) calls
// them exactly as before. What changed is where the message renders: instead
// of the OS's native Alert.alert / window.alert / window.confirm (a plain
// white system dialog with no access to the app's theme), they now hand off
// to MessageOverlay, a single themed modal mounted once in the root layout.
// registerMessageHandlers() is how that mounted component plugs itself in.
type NotifyHandler = (title: string, message: string) => void;
type ConfirmHandler = (title: string, message: string) => Promise<boolean>;

let notifyHandler: NotifyHandler | null = null;
let confirmHandler: ConfirmHandler | null = null;

export function registerMessageHandlers(handlers: {
  notify: NotifyHandler;
  confirm: ConfirmHandler;
}) {
  notifyHandler = handlers.notify;
  confirmHandler = handlers.confirm;
}

export function notify(title: string, message: string) {
  if (notifyHandler) {
    notifyHandler(title, message);
  } else {
    console.warn("notify() called before MessageOverlay mounted:", title, message);
  }
}

export function confirmAsync(title: string, message: string): Promise<boolean> {
  if (confirmHandler) {
    return confirmHandler(title, message);
  }
  console.warn("confirmAsync() called before MessageOverlay mounted:", title, message);
  return Promise.resolve(false);
}
