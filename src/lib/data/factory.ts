import { FirebaseProvider } from './firebase-provider';
import { MockProvider } from './provider';

const useMock = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_USE_MOCK : 'true') === 'true';

export const dataProvider = useMock ? new MockProvider() : new FirebaseProvider();
