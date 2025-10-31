import { FirebaseProvider } from './firebase-provider';
import { dataProvider as FirebaseDataProvider } from './provider';

const useMock = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_USE_MOCK : 'true') === 'true';

export const dataProvider = useMock ? FirebaseDataProvider : new FirebaseProvider();
