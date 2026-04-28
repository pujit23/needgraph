import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { USE_FIREBASE, getFirebaseAuth, getDb } from '../lib/firebase';

// ── types ──────────────────────────────────────────────
export type UserRole =
  | 'super_admin'
  | 'coordinator'
  | 'ngo_admin'
  | 'volunteer'
  | 'field_worker'
  | 'read_only';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  wardAssignments: string[];
  language: 'en' | 'te' | 'hi' | 'ur';
  fcmToken: string;
  isActive: boolean;
  createdAt: any;
  lastLoginAt: any;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, displayName: string, role: UserRole, wards: string[]) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  isCoordinator: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── mock profile for dev without Firebase ──────────────
const MOCK_PROFILE: UserProfile = {
  uid: 'mock-user-1',
  email: 'anika@needgraph.org',
  displayName: 'Anika Coordinator',
  photoURL: '',
  role: 'coordinator',
  wardAssignments: [],
  language: 'en',
  fcmToken: '',
  isActive: true,
  createdAt: null,
  lastLoginAt: null,
};

// ── provider ───────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(
    USE_FIREBASE ? null : MOCK_PROFILE,
  );
  const [loading, setLoading] = useState(USE_FIREBASE);

  // Listen for auth state changes
  useEffect(() => {
    if (!USE_FIREBASE) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          const db = getDb();
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            // First sign-in — create profile
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || '',
              photoURL: fbUser.photoURL || '',
              role: 'super_admin',
              wardAssignments: [],
              language: 'en',
              fcmToken: '',
              isActive: true,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
            };
            await setDoc(doc(db, 'users', fbUser.uid), newProfile);
            setProfile(newProfile);
          }
          // Update last login
          await setDoc(
            doc(db, 'users', fbUser.uid),
            { lastLoginAt: serverTimestamp() },
            { merge: true },
          );
        } catch (err) {
          console.error('[Auth] Error loading profile:', err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!USE_FIREBASE) {
      setProfile(MOCK_PROFILE);
      return;
    }
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!USE_FIREBASE) {
      setProfile(MOCK_PROFILE);
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(getFirebaseAuth(), provider);
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      role: UserRole,
      wards: string[],
    ) => {
      if (!USE_FIREBASE) {
        setProfile({
          ...MOCK_PROFILE,
          email,
          displayName,
          role,
          wardAssignments: wards,
        });
        return;
      }
      const cred = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password,
      );
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email,
        displayName,
        photoURL: '',
        role,
        wardAssignments: wards,
        language: 'en',
        fcmToken: '',
        isActive: role === 'read_only', // non-read_only needs admin approval
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };
      await setDoc(doc(getDb(), 'users', cred.user.uid), newProfile);
    },
    [],
  );

  const logout = useCallback(async () => {
    if (USE_FIREBASE) {
      await signOut(getFirebaseAuth());
    }
    setProfile(USE_FIREBASE ? null : MOCK_PROFILE);
  }, []);

  const updateProfileFn = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!USE_FIREBASE || !user) return;
      await setDoc(doc(getDb(), 'users', user.uid), data, { merge: true });
      setProfile((prev) => (prev ? { ...prev, ...data } : prev));
    },
    [user],
  );

  const isCoordinator =
    profile?.role === 'super_admin' || profile?.role === 'coordinator';
  const isSuperAdmin = profile?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile: updateProfileFn,
        isCoordinator,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
