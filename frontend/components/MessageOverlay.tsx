// frontend/components/MessageOverlay.tsx — this is a NEW file, create it
//
// The single themed modal that backs notify() and confirmAsync() (see
// utils/confirm.ts). Mounted once in the root layout so it's available from
// any screen without each call site needing its own state or modal markup.
// Visually it mirrors ConfirmModal — same overlay/backdrop/card styling —
// but is driven by a small internal queue instead of a `visible` prop, since
// it can be triggered from anywhere, including outside React event handlers.
import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSimpleTheme } from "../context/SimpleTheme";
import { registerMessageHandlers } from "../utils/confirm";

type Queued =
  | { kind: "notify"; title: string; message: string }
  | { kind: "confirm"; title: string; message: string; resolve: (v: boolean) => void };

export default function MessageOverlay() {
  const { T } = useSimpleTheme();
  const [current, setCurrent] = useState<Queued | null>(null);
  const queueRef = useRef<Queued[]>([]);

  useEffect(() => {
    const enqueue = (item: Queued) => {
      queueRef.current.push(item);
      setCurrent(prev => prev ?? queueRef.current.shift() ?? null);
    };

    registerMessageHandlers({
      notify: (title, message) => enqueue({ kind: "notify", title, message }),
      confirm: (title, message) =>
        new Promise<boolean>(resolve => enqueue({ kind: "confirm", title, message, resolve })),
    });
  }, []);

  const dismiss = (result?: boolean) => {
    if (current?.kind === "confirm") current.resolve(!!result);
    const next = queueRef.current.shift() ?? null;
    setCurrent(next);
  };

  if (!current) return null;
  const isConfirm = current.kind === "confirm";

  return (
    <View style={s.overlay}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => dismiss()} />
      <View style={[s.card, { backgroundColor: T.surface, borderColor: T.border }]}>
        <Text style={[s.title, { color: T.t1 }]}>{current.title}</Text>
        <Text style={[s.message, { color: T.t2 }]}>{current.message}</Text>
        <View style={s.actions}>
          {isConfirm && (
            <TouchableOpacity style={[s.btn, { backgroundColor: T.border }]} onPress={() => dismiss(false)}>
              <Text style={[s.btnText, { color: T.t2 }]}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[s.btn, { backgroundColor: T.orange }]} onPress={() => dismiss(true)}>
            <Text style={[s.btnText, { color: "#fff" }]}>{isConfirm ? "Confirm" : "OK"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center",
    zIndex: 2000, elevation: 2000,
  },
  backdrop: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  card: { width: "84%", maxWidth: 340, borderWidth: 1, borderRadius: 16, padding: 20 },
  title: { fontFamily: "Montserrat_700Bold", fontSize: 16, marginBottom: 8 },
  message: { fontFamily: "Montserrat_500Medium", fontSize: 13, lineHeight: 19, marginBottom: 20 },
  actions: { flexDirection: "row", gap: 8 },
  btn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  btnText: { fontFamily: "Montserrat_700Bold", fontSize: 13 },
});
