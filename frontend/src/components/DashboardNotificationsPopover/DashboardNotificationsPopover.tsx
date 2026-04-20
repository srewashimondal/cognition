import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@radix-ui/themes";
import type { DocumentReference, QueryDocumentSnapshot } from "firebase/firestore";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import bell from "../../assets/icons/bell.svg";
import { db } from "../../firebase";
import type { EmployeeUserType, EmployerUserType, GenericModuleAttempt } from "../../types/User/UserType";
import type { WorkspaceType } from "../../types/User/WorkspaceType";
import { isBadgeMap } from "../../utils/streaks";
import "./DashboardNotificationsPopover.css";

const NOTIF_STORAGE_VER = "v1";

type DashboardNotification = {
  id: string;
  kind: "achievement" | "module" | "performance" | "workspace";
  title: string;
  body: string;
  href?: string;
};

type ModuleAttemptSummary = {
  attemptId: string;
  title: string;
  kind: "simulation" | "standard";
};

type EmployeeNotifState = {
  readIds: string[];
  seenAssignedModuleIds: string[];
  seenNewModuleAttemptIds: string[];
  moduleAttemptNotifySeeded: boolean;
  perfAck: Record<string, string>;
  seeded: boolean;
};

type EmployerNotifState = {
  readIds: string[];
  lastAckSim: number;
  lastAckStd: number;
  seeded: boolean;
};

function employeeNotifKey(uid: string) {
  return `cognition_dashboard_notif_${NOTIF_STORAGE_VER}_emp_${uid}`;
}

function employerNotifKey(uid: string) {
  return `cognition_dashboard_notif_${NOTIF_STORAGE_VER}_empr_${uid}`;
}

function attemptDigest(a: GenericModuleAttempt): string {
  return `${a.status ?? ""}|${a.percent ?? 0}|${a.score ?? 0}|${a.completionDate ?? ""}`;
}

function achievementNotifId(entry: EmployeeUserType["achievements"][number]): string {
  if (isBadgeMap(entry)) return `achievement:${entry.id}`;
  const ref = entry as DocumentReference;
  return `achievement:ref:${ref.path}`;
}

function loadEmployeeNotifState(uid: string): EmployeeNotifState {
  try {
    const raw = localStorage.getItem(employeeNotifKey(uid));
    if (!raw) {
      return {
        readIds: [],
        seenAssignedModuleIds: [],
        seenNewModuleAttemptIds: [],
        moduleAttemptNotifySeeded: false,
        perfAck: {},
        seeded: false,
      };
    }
    const p = JSON.parse(raw) as Partial<EmployeeNotifState>;
    return {
      readIds: Array.isArray(p.readIds) ? p.readIds : [],
      seenAssignedModuleIds: Array.isArray(p.seenAssignedModuleIds) ? p.seenAssignedModuleIds : [],
      seenNewModuleAttemptIds: Array.isArray(p.seenNewModuleAttemptIds) ? p.seenNewModuleAttemptIds : [],
      moduleAttemptNotifySeeded: !!p.moduleAttemptNotifySeeded,
      perfAck: p.perfAck && typeof p.perfAck === "object" ? p.perfAck : {},
      seeded: !!p.seeded,
    };
  } catch {
    return {
      readIds: [],
      seenAssignedModuleIds: [],
      seenNewModuleAttemptIds: [],
      moduleAttemptNotifySeeded: false,
      perfAck: {},
      seeded: false,
    };
  }
}

function saveEmployeeNotifState(uid: string, state: EmployeeNotifState) {
  localStorage.setItem(employeeNotifKey(uid), JSON.stringify(state));
}

function seedEmployeeNotifBaselineIfNeeded(uid: string, user: EmployeeUserType): void {
  const state = loadEmployeeNotifState(uid);
  if (state.seeded) return;

  const perfAck: Record<string, string> = {};
  const attempts = [...(user.modulesInProgress ?? []), ...(user.completedModules ?? [])];
  for (const a of attempts) {
    perfAck[a.id] = attemptDigest(a);
  }

  const readIds = (user.achievements ?? []).map(achievementNotifId);
  const seenAssignedModuleIds = (user.assignedModules ?? []).map((m) => m.id);

  saveEmployeeNotifState(uid, {
    ...state,
    readIds,
    seenAssignedModuleIds,
    perfAck,
    seeded: true,
  });
}

function seedEmployeeModuleAttemptBaselineIfNeeded(uid: string, attemptIds: string[]): void {
  const state = loadEmployeeNotifState(uid);
  if (state.moduleAttemptNotifySeeded) return;
  const unique = [...new Set(attemptIds)];
  saveEmployeeNotifState(uid, {
    ...state,
    seenNewModuleAttemptIds: unique,
    moduleAttemptNotifySeeded: true,
  });
}

function moduleHref(m: { id: string; kind?: string }): string {
  return m.kind === "standard" ? `/employee/standard-modules/${m.id}` : `/employee/simulations/${m.id}`;
}

function perfCopy(a: GenericModuleAttempt): { title: string; body: string } {
  const title = a.moduleInfo?.title ?? "Module";
  if (a.status === "completed") {
    return {
      title: "Module performance",
      body: `You completed “${title}”.${typeof a.score === "number" ? ` Score: ${Math.round(a.score)}%.` : ""}`,
    };
  }
  const pct = typeof a.percent === "number" ? Math.round(a.percent) : 0;
  return {
    title: "Module progress",
    body: `You are ${pct}% through “${title}”.`,
  };
}

function buildEmployeeNotifications(
  uid: string,
  user: EmployeeUserType,
  moduleAttemptSummaries: ModuleAttemptSummary[] = []
): DashboardNotification[] {
  seedEmployeeNotifBaselineIfNeeded(uid, user);
  const state = loadEmployeeNotifState(uid);
  const readSet = new Set(state.readIds);
  const seenAssigned = new Set(state.seenAssignedModuleIds);
  const seenModuleAttempts = new Set(state.seenNewModuleAttemptIds);
  const items: DashboardNotification[] = [];

  for (const e of user.achievements ?? []) {
    const nid = achievementNotifId(e);
    if (!readSet.has(nid)) {
      const name = isBadgeMap(e) ? e.name : "Achievement";
      const desc = isBadgeMap(e) ? e.description : "You have a new achievement linked to your workspace.";
      items.push({
        id: nid,
        kind: "achievement",
        title: "Achievement",
        body: `${name} — ${desc}`,
        href: "/employee",
      });
    }
  }

  for (const m of user.assignedModules ?? []) {
    if (!seenAssigned.has(m.id)) {
      items.push({
        id: `assign:${m.id}`,
        kind: "module",
        title: "New module",
        body: `“${m.title}” was assigned to you.`,
        href: moduleHref(m),
      });
    }
  }

  for (const s of moduleAttemptSummaries) {
    if (!seenModuleAttempts.has(s.attemptId)) {
      items.push({
        id: `newmod:${s.attemptId}`,
        kind: "module",
        title: s.kind === "simulation" ? "New simulation module" : "New standard module",
        body: `“${s.title}” is ready — open it from ${s.kind === "simulation" ? "Simulations" : "Standard Modules"}.`,
        href: s.kind === "simulation" ? `/employee/simulations/${s.attemptId}` : `/employee/standard-modules/${s.attemptId}`,
      });
    }
  }

  const byAttemptId = new Map<string, GenericModuleAttempt>();
  for (const a of [...(user.completedModules ?? []), ...(user.modulesInProgress ?? [])]) {
    byAttemptId.set(a.id, a);
  }
  for (const a of byAttemptId.values()) {
    const cur = attemptDigest(a);
    const ack = state.perfAck[a.id];
    if (cur === ack) continue;
    const nid = `perf:${a.id}:${cur}`;
    if (readSet.has(nid)) continue;
    const copy = perfCopy(a);
    items.push({
      id: nid,
      kind: "performance",
      title: copy.title,
      body: copy.body,
      href: moduleHref(a.moduleInfo),
    });
  }

  return items;
}

function acknowledgeEmployeeNotifications(
  uid: string,
  user: EmployeeUserType,
  moduleAttemptSummaries: ModuleAttemptSummary[] = []
): void {
  seedEmployeeNotifBaselineIfNeeded(uid, user);
  const state = loadEmployeeNotifState(uid);
  const readSet = new Set(state.readIds);

  for (const e of user.achievements ?? []) {
    readSet.add(achievementNotifId(e));
  }

  const seenAssigned = new Set(state.seenAssignedModuleIds);
  for (const m of user.assignedModules ?? []) {
    seenAssigned.add(m.id);
  }

  const seenModuleAttempts = new Set(state.seenNewModuleAttemptIds);
  for (const s of moduleAttemptSummaries) {
    seenModuleAttempts.add(s.attemptId);
  }

  const perfAck = { ...state.perfAck };
  const attempts = [...(user.modulesInProgress ?? []), ...(user.completedModules ?? [])];
  for (const a of attempts) {
    const cur = attemptDigest(a);
    perfAck[a.id] = cur;
    readSet.add(`perf:${a.id}:${cur}`);
  }

  saveEmployeeNotifState(uid, {
    readIds: [...readSet],
    seenAssignedModuleIds: [...seenAssigned],
    seenNewModuleAttemptIds: [...seenModuleAttempts],
    moduleAttemptNotifySeeded: state.moduleAttemptNotifySeeded,
    perfAck,
    seeded: true,
  });
}

function loadEmployerNotifState(uid: string): EmployerNotifState {
  try {
    const raw = localStorage.getItem(employerNotifKey(uid));
    if (!raw) {
      return { readIds: [], lastAckSim: 0, lastAckStd: 0, seeded: false };
    }
    const p = JSON.parse(raw) as Partial<EmployerNotifState> & {
      lastSimCount?: number;
      lastStdCount?: number;
    };
    const lastAckSim =
      typeof p.lastAckSim === "number"
        ? p.lastAckSim
        : typeof p.lastSimCount === "number"
          ? p.lastSimCount
          : 0;
    const lastAckStd =
      typeof p.lastAckStd === "number"
        ? p.lastAckStd
        : typeof p.lastStdCount === "number"
          ? p.lastStdCount
          : 0;
    return {
      readIds: Array.isArray(p.readIds) ? p.readIds : [],
      lastAckSim,
      lastAckStd,
      seeded: !!p.seeded,
    };
  } catch {
    return { readIds: [], lastAckSim: 0, lastAckStd: 0, seeded: false };
  }
}

function saveEmployerNotifState(uid: string, state: EmployerNotifState) {
  localStorage.setItem(employerNotifKey(uid), JSON.stringify(state));
}

function seedEmployerNotifBaselineIfNeeded(uid: string, workspace: WorkspaceType): void {
  const state = loadEmployerNotifState(uid);
  if (state.seeded) return;
  const sim = workspace.simulationModules?.length ?? 0;
  const std = workspace.standardModules?.length ?? 0;
  saveEmployerNotifState(uid, {
    readIds: [],
    lastAckSim: sim,
    lastAckStd: std,
    seeded: true,
  });
}

function buildEmployerNotifications(uid: string, workspace: WorkspaceType): DashboardNotification[] {
  seedEmployerNotifBaselineIfNeeded(uid, workspace);
  const state = loadEmployerNotifState(uid);
  const readSet = new Set(state.readIds);
  const items: DashboardNotification[] = [];

  const sim = workspace.simulationModules?.length ?? 0;
  const std = workspace.standardModules?.length ?? 0;
  const nid = `workspace:v${sim}_${std}`;
  if (state.seeded && (sim > state.lastAckSim || std > state.lastAckStd) && !readSet.has(nid)) {
    const added = Math.max(0, sim - state.lastAckSim) + Math.max(0, std - state.lastAckStd);
    items.push({
      id: nid,
      kind: "workspace",
      title: "New workspace modules",
      body:
        added > 0
          ? `Your workspace has new training content (${added} module reference${added === 1 ? "" : "s"}). Open Modules to review.`
          : "Your workspace training catalog was updated. Open Modules to review.",
      href: "/employer/modules",
    });
  }

  return items;
}

function acknowledgeEmployerNotifications(uid: string, workspace: WorkspaceType): void {
  seedEmployerNotifBaselineIfNeeded(uid, workspace);
  const state = loadEmployerNotifState(uid);
  const sim = workspace.simulationModules?.length ?? 0;
  const std = workspace.standardModules?.length ?? 0;
  const readSet = new Set(state.readIds);
  readSet.add(`workspace:v${sim}_${std}`);
  saveEmployerNotifState(uid, {
    readIds: [...readSet],
    lastAckSim: sim,
    lastAckStd: std,
    seeded: true,
  });
}

type AppUser = EmployeeUserType | EmployerUserType;

type Props = {
  user: AppUser;
  workspace: WorkspaceType | null;
};

function useEmployeeModuleAttemptSummaries(employee: EmployeeUserType | null): ModuleAttemptSummary[] {
  const [summaries, setSummaries] = useState<ModuleAttemptSummary[]>([]);
  const simRef = useRef<ModuleAttemptSummary[]>([]);
  const stdRef = useRef<ModuleAttemptSummary[]>([]);
  const simReady = useRef(false);
  const stdReady = useRef(false);

  useEffect(() => {
    simReady.current = false;
    stdReady.current = false;
    simRef.current = [];
    stdRef.current = [];
    setSummaries([]);

    if (!employee?.workspaceID) return;

    const uid = employee.uid;
    const userRef = doc(db, "users", uid);

    async function mapSimulationDoc(d: QueryDocumentSnapshot): Promise<ModuleAttemptSummary | null> {
      const data = d.data();
      const modRef = data.moduleInfo;
      if (!modRef) return null;
      const modSnap = await getDoc(modRef);
      if (!modSnap.exists()) return null;
      const md = modSnap.data() as { title?: string; isDeleted?: boolean };
      if (md.isDeleted) return null;
      return {
        attemptId: d.id,
        title: typeof md.title === "string" ? md.title : "Simulation module",
        kind: "simulation",
      };
    }

    async function mapStandardDoc(d: QueryDocumentSnapshot): Promise<ModuleAttemptSummary | null> {
      const data = d.data();
      const modRef = data.moduleInfo;
      if (!modRef) return null;
      const modSnap = await getDoc(modRef);
      if (!modSnap.exists()) return null;
      const md = modSnap.data() as { title?: string; isDeleted?: boolean };
      if (md.isDeleted) return null;
      return {
        attemptId: d.id,
        title: typeof md.title === "string" ? md.title : "Standard module",
        kind: "standard",
      };
    }

    const flush = () => {
      const merged = [...simRef.current, ...stdRef.current];
      setSummaries(merged);
      if (simReady.current && stdReady.current) {
        seedEmployeeModuleAttemptBaselineIfNeeded(
          uid,
          merged.map((s) => s.attemptId)
        );
      }
    };

    const simQ = query(
      collection(db, "simulationModuleAttempts"),
      where("user", "==", userRef),
      where("workspaceRef", "==", employee.workspaceID)
    );
    const stdQ = query(
      collection(db, "standardModuleAttempts"),
      where("user", "==", userRef),
      where("workspaceRef", "==", employee.workspaceID)
    );

    const unsubSim = onSnapshot(simQ, async (snap) => {
      const list = (await Promise.all(snap.docs.map(mapSimulationDoc))).filter(
        (x): x is ModuleAttemptSummary => x !== null
      );
      simRef.current = list;
      simReady.current = true;
      flush();
    });

    const unsubStd = onSnapshot(stdQ, async (snap) => {
      const list = (await Promise.all(snap.docs.map(mapStandardDoc))).filter(
        (x): x is ModuleAttemptSummary => x !== null
      );
      stdRef.current = list;
      stdReady.current = true;
      flush();
    });

    return () => {
      unsubSim();
      unsubStd();
    };
  }, [employee?.uid, employee?.workspaceID]);

  return summaries;
}

export default function DashboardNotificationsPopover({ user, workspace }: Props) {
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const employee = user.role === "employee" ? user : null;
  const moduleAttemptSummaries = useEmployeeModuleAttemptSummaries(employee);

  const items = useMemo((): DashboardNotification[] => {
    if (user.role === "employee") {
      return buildEmployeeNotifications(user.uid, user, moduleAttemptSummaries);
    }
    if (!workspace) return [];
    return buildEmployerNotifications(user.uid, workspace);
  }, [user, workspace, moduleAttemptSummaries]);

  const hasUnread = items.length > 0;
  const showDot = hasUnread && !open;

  const closeAndAck = useCallback(() => {
    if (user.role === "employee") {
      acknowledgeEmployeeNotifications(user.uid, user, moduleAttemptSummaries);
    } else if (workspace) {
      acknowledgeEmployerNotifications(user.uid, workspace);
    }
    setOpen(false);
  }, [user, workspace, moduleAttemptSummaries]);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) {
        closeAndAck();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAndAck();
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, closeAndAck]);

  const onToggle = () => {
    if (open) {
      closeAndAck();
    } else {
      setOpen(true);
    }
  };

  const onItemActivate = (href?: string) => {
    closeAndAck();
    if (href) navigate(href);
  };

  return (
    <div className="dashboard-notif-wrap" ref={wrapRef}>
      <Tooltip content="Notifications">
        <button
          type="button"
          className="dashboard-notif-trigger"
          aria-label="Notifications"
          aria-expanded={open}
          onClick={onToggle}
        >
          <span className="dashboard-notif-bell">
            <img src={bell} alt="" width={24} height={24} />
            {showDot ? <span className="dashboard-notif-dot" aria-hidden /> : null}
          </span>
        </button>
      </Tooltip>

      {open ? (
        <div className="dashboard-notif-panel" role="dialog" aria-label="Notifications">
          <div className="dashboard-notif-panel-header">
            <h3>Notifications</h3>
            <button type="button" className="dashboard-notif-close" onClick={closeAndAck} aria-label="Close">
              ×
            </button>
          </div>
          <div className="dashboard-notif-list">
            {items.length === 0 ? (
              <p className="dashboard-notif-empty">You are all caught up.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className="dashboard-notif-row"
                  onClick={() => onItemActivate(n.href)}
                >
                  <span className={`dashboard-notif-kind dashboard-notif-kind-${n.kind}`}>{kindLabel(n.kind)}</span>
                  <span className="dashboard-notif-title">{n.title}</span>
                  <span className="dashboard-notif-body">{n.body}</span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function kindLabel(kind: DashboardNotification["kind"]): string {
  switch (kind) {
    case "achievement":
      return "Achievement";
    case "module":
      return "Module";
    case "performance":
      return "Performance";
    case "workspace":
      return "Workspace";
    default:
      return "Update";
  }
}
