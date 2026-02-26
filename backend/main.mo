import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";



actor {
  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Mod Types
  type Mod = {
    id : Nat;
    title : Text;
    description : Text;
    game : Text;
    category : Text;
    author : Text;
    uploadTimestamp : Time.Time;
    downloadCount : Nat;
    fileName : Text;
    fileSize : Nat;
    previewImage : ?Storage.ExternalBlob;
  };

  type ModUpload = {
    title : Text;
    description : Text;
    game : Text;
    category : Text;
    author : Text;
    fileName : Text;
    fileSize : Nat;
    previewImage : ?Storage.ExternalBlob;
  };

  module Mod {
    public func compareByDownloadCount(mod1 : Mod, mod2 : Mod) : Order.Order {
      Nat.compare(mod1.downloadCount, mod2.downloadCount);
    };
  };

  // Persistent Data
  var nextModId = 0;
  let modsById = Map.empty<Nat, Mod>();
  let modsByAuthor = Map.empty<Text, List.List<Nat>>();
  let modsByCategory = Map.empty<Text, List.List<Nat>>();

  // Mod Upload — only authenticated users can upload
  public shared ({ caller }) func uploadMod(upload : ModUpload) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload mods");
    };

    let modId = nextModId;
    nextModId += 1;

    let newMod : Mod = {
      id = modId;
      title = upload.title;
      description = upload.description;
      game = upload.game;
      category = upload.category;
      author = upload.author;
      uploadTimestamp = Time.now();
      downloadCount = 0;
      fileName = upload.fileName;
      fileSize = upload.fileSize;
      previewImage = upload.previewImage;
    };

    modsById.add(modId, newMod);

    // By author
    switch (modsByAuthor.get(upload.author)) {
      case (null) {
        let newList = List.singleton<Nat>(modId);
        modsByAuthor.add(upload.author, newList);
      };
      case (?list) { list.add(modId) };
    };

    // By category
    switch (modsByCategory.get(upload.category)) {
      case (null) {
        let newList = List.singleton<Nat>(modId);
        modsByCategory.add(upload.category, newList);
      };
      case (?list) { list.add(modId) };
    };

    modId;
  };

  // Get Mod by Id — public read, no auth required
  public query func getModById(modId : Nat) : async Mod {
    switch (modsById.get(modId)) {
      case (null) { Runtime.trap("Mod not found") };
      case (?mod) { mod };
    };
  };

  // List Mods (pagination) — public read, no auth required
  public query func listMods(offset : Nat, limit : Nat) : async [Mod] {
    let allMods = modsById.values().toArray();
    let slicedMods = allMods.sliceToArray(offset, offset + limit);
    slicedMods;
  };

  // Increment Download Count — public action, no auth required
  public shared func incrementDownloadCount(modId : Nat) : async () {
    switch (modsById.get(modId)) {
      case (null) { Runtime.trap("Mod not found") };
      case (?mod) {
        let updatedMod : Mod = {
          mod with
          downloadCount = mod.downloadCount + 1;
        };
        modsById.add(modId, updatedMod);
      };
    };
  };

  // Delete Mod — only admin users can delete mods
  public shared ({ caller }) func deleteMod(modId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Not authorized: Only admins can delete mods");
    };

    switch (modsById.get(modId)) {
      case (null) { Runtime.trap("Mod not found") };
      case (?_) { modsById.remove(modId) };
    };
  };

  // Get Mods by Author — public read, no auth required
  public query func getModsByAuthor(author : Text) : async [Mod] {
    switch (modsByAuthor.get(author)) {
      case (null) { [] };
      case (?idList) {
        let filteredAuthorMods = idList.values().toArray().filter(
          func(id) {
            modsById.containsKey(id);
          }
        );
        filteredAuthorMods.map(
          func(id) {
            switch (modsById.get(id)) {
              case (null) { Runtime.trap("Unexpected null mod value") };
              case (?mod) { mod };
            };
          }
        );
      };
    };
  };

  // Get Mods by Category — public read, no auth required
  public query func getModsByCategory(category : Text) : async [Mod] {
    switch (modsByCategory.get(category)) {
      case (null) { [] };
      case (?idList) {
        let filteredCategoryMods = idList.values().toArray().filter(
          func(id) {
            modsById.containsKey(id);
          }
        );
        filteredCategoryMods.map(
          func(id) {
            switch (modsById.get(id)) {
              case (null) { Runtime.trap("Unexpected null mod value") };
              case (?mod) { mod };
            };
          }
        );
      };
    };
  };

  // Get Popular Mods — public read, no auth required
  public query func getPopularMods(limit : Nat) : async [Mod] {
    let allMods = modsById.values().toArray();
    let sortedMods = allMods.sort(Mod.compareByDownloadCount);
    sortedMods.sliceToArray(0, limit);
  };

  // Get Mod Preview Image — public read, no auth required
  public query func getModPreviewImage(modId : Nat) : async ?Storage.ExternalBlob {
    switch (modsById.get(modId)) {
      case (null) { Runtime.trap("Mod not found") };
      case (?mod) { mod.previewImage };
    };
  };
};
