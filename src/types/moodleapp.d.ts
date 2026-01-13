// Typings d'intégration pour les plugins natifs utilisés par Moodle App.

// API attendue par le code pour le plugin "secureStorage".
// Voir usages: CoreNative.plugin('secureStorage')?.get([...], siteId) / .store({...}, siteId)
interface MoodleAppSecureStoragePlugin {
    get(keys: string[], namespace: string): Promise<Record<string, string>>;
    store(data: Record<string, string>, namespace: string): Promise<void>;
    deleteCollection(collection: string): Promise<void>;
}

// API minimale pour le plugin "diagnostic" (utilisé pour ouvrir les réglages iOS).
interface MoodleAppDiagnosticPlugin {
    switchToSettings(): Promise<void> | void;
    // Permissions audio (utilisée par l'enregistreur audio)
    requestMicrophoneAuthorization: () => Promise<string | number>;
    permissionStatus: Record<string, string | number> & {
        deniedOnce?: string | number;
        deniedAlways?: string | number;
        restricted?: string | number;
    };
}

// Plugin Android Install Referrer (utilisé uniquement sur Android via guard dans CoreNativeService)
interface MoodleAppInstallReferrerPlugin {
    // API principale utilisée
    getReferrer: () => Promise<{ referrer?: string; installReferrer?: string }>;
}

// Registre des plugins accessibles via CoreNative.plugin('<name>').
interface MoodleAppPlugins {
    secureStorage: MoodleAppSecureStoragePlugin;
    diagnostic: MoodleAppDiagnosticPlugin;
    installReferrer: MoodleAppInstallReferrerPlugin;
}

// Déclaration de window.cordova pour Capacitor / navigateur
interface Window {
    cordova?: {
        MoodleApp?: Partial<MoodleAppPlugins>;
    };
}

// Types globaux minimaux manquants dans certains contextes de build.
// InAppBrowserEvent (plugin InAppBrowser)
interface InAppBrowserEvent {
    type: string;
    url: string;
    code?: number;
    message?: string;
}

// FileError (plugin File) – constants utilisées dans le code comme FileError.NOT_FOUND_ERR
declare const FileError: {
    NOT_FOUND_ERR: number;
    SECURITY_ERR: number;
    ENCODING_ERR: number;
    [key: string]: number;
};

// File Transfer (types minimaux requis par CoreWS/CoreFilepool)
interface FileUploadOptions {
    fileKey?: string;
    fileName?: string;
    mimeType?: string;
    params?: Record<string, unknown> | FormData | any;
    headers?: Record<string, string>;
    httpMethod?: 'POST' | 'PUT';
    chunkedMode?: boolean;
}

interface FileUploadResult {
    bytesSent: number;
    responseCode: number;
    response: string;
    headers?: Record<string, string>;
}

// Déclaration compatible avec
// - instanceof FileTransferError (valeur/constructeur)
// - utilisation comme type/interface dans les callbacks
declare class FileTransferError {
    static readonly FILE_NOT_FOUND_ERR: number;
    static readonly INVALID_URL_ERR: number;
    static readonly CONNECTION_ERR: number;
    static readonly ABORT_ERR: number;
    static readonly NOT_MODIFIED_ERR: number;

    constructor(
        code: number,
        source: string,
        target: string,
        http_status: number,
        body: string,
        exception: string,
    );

    code: number;
    source: string;
    target: string;
    http_status: number;
    body: string;
    exception: string;
}

interface FileTransferError {
    code: number;
    source: string;
    target: string;
    http_status: number;
    body: string;
    exception: string;
}

// Déclarations minimales du plugin File (Cordova) utilisées dans l'émulateur et services.
// Entrées/sorties de fichiers
interface FileEntry {
    isFile: true;
    isDirectory: false;
    name: string;
    fullPath: string;
    filesystem?: FileSystem;
}

interface DirectoryEntry {
    isFile: false;
    isDirectory: true;
    name: string;
    fullPath: string;
    filesystem?: FileSystem;
}

interface FileWriter {
    onwriteend: ((this: FileWriter, ev: ProgressEvent) => any) | null;
    onerror: ((this: FileWriter, ev: ProgressEvent) => any) | null;
    write(data: Blob | string | ArrayBuffer): void;
    // Propriétés/méthodes utilisées par l'émulateur
    error?: any;
    length: number;
    seek(offset: number): void;
    truncate(size: number): void;
}

type Flags = { create?: boolean; exclusive?: boolean };

declare const LocalFileSystem: { PERSISTENT: number; TEMPORARY: number };
// Type alias to match emulator typings that use 'LocalFileSystem' as a type for the numeric mode.
type LocalFileSystem = number;

// Étendre l'objet window pour les mocks côté navigateur
interface Window {
    FileTransfer: new () => any;
    FileTransferError: typeof FileTransferError;
    resolveLocalFileSystemURL: (url: string, success?: (entry: FileEntry | DirectoryEntry) => void, error?: (e: any) => void) => void;
    requestFileSystem: (
        type: number,
        size: number,
        success: (fs: FileSystem) => void,
        error?: (e: any) => void,
    ) => void;
}

// Cordova objets/augmentations minimales
interface CordovaInAppBrowser {
    open: (url: string, target?: string, options?: string) => any;
}

interface Cordova {
    InAppBrowser?: CordovaInAppBrowser;
    file?: { applicationDirectory?: string };
}

// Push notification (clé publique FCM/WebPush)
declare const PushNotification: {
    getPublicKey: (resolve: (key: string) => void, reject: (e: any) => void) => void;
};

// Exposer FileEntry/DirectoryEntry sous globalThis.* si nécessaire
declare namespace globalThis {
    interface FileEntry extends FileEntry {}
    interface DirectoryEntry extends DirectoryEntry {}
}

// Fournir le type importé par l'émulateur pour SecureStorage.
declare module 'cordova-plugin-moodleapp' {
    export interface SecureStorage {
        get(names: string | string[], collection: string): Promise<Record<string, string>>;
        store(data: Record<string, string>, collection: string): Promise<void>;
        delete(names: string | string[], collection: string): Promise<void>;
        deleteCollection(collection: string): Promise<void>;
    }
}
