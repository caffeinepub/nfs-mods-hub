import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface ModUpload {
    title: string;
    game: string;
    description: string;
    fileName: string;
    fileSize: bigint;
    author: string;
    category: string;
}
export interface Mod {
    id: bigint;
    title: string;
    game: string;
    description: string;
    fileName: string;
    fileSize: bigint;
    uploadTimestamp: Time;
    author: string;
    category: string;
    downloadCount: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteMod(modId: bigint): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getModById(modId: bigint): Promise<Mod>;
    getModsByAuthor(author: string): Promise<Array<Mod>>;
    getModsByCategory(category: string): Promise<Array<Mod>>;
    getPopularMods(limit: bigint): Promise<Array<Mod>>;
    incrementDownloadCount(modId: bigint): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listMods(offset: bigint, limit: bigint): Promise<Array<Mod>>;
    uploadMod(upload: ModUpload): Promise<bigint>;
}
