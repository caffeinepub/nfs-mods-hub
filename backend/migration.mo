import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  type OldMod = {
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
  };

  type OldActor = {
    modsById : Map.Map<Nat, OldMod>;
    modsByAuthor : Map.Map<Text, List.List<Nat>>;
    modsByCategory : Map.Map<Text, List.List<Nat>>;
    nextModId : Nat;
  };

  type NewMod = {
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
  };

  type NewActor = {
    modsById : Map.Map<Nat, NewMod>;
    modsByAuthor : Map.Map<Text, List.List<Nat>>;
    modsByCategory : Map.Map<Text, List.List<Nat>>;
    nextModId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newMods = old.modsById.map<Nat, OldMod, NewMod>(func(_id, oldMod) { oldMod });
    {
      modsById = newMods;
      modsByAuthor = old.modsByAuthor;
      modsByCategory = old.modsByCategory;
      nextModId = old.nextModId;
    };
  };
};
