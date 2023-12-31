import { Pk, VaultPk, Model, ModelDict } from "../models/types"
import Vault from "../models/Vault"
import SS, { StoredType } from "../services/StorageService"


type Objects = {Pk?: Model}

abstract class TypeManager<T extends Model> {
    storedType: StoredType
    typeModel: any 

    private _vault: Vault
    private _objects: {[Pk: string]: T}

    constructor(vault: Vault, objects: {[Pk: string]: T} = {}, storedType: StoredType, typeModel: any) {
        this._vault = vault
        this._objects = objects
        this.storedType = storedType
        this.typeModel = typeModel
    }
    // abstract create(name: string, description: string): T
    clear() { this._objects = {}; }
    async delete(object: T): Promise<void> {
        await SS.delete(object.pk)
        delete this._objects[object.pk]
    }
    async save(object: T): Promise<void> {
        await SS.save(object.pk, object.toDict())
        this._objects[object.pk] = object
    }
    async saveAll(): Promise<void[]> {
        return await Promise.all(
            Object.values(this._objects).map(
                o => this.save(o))
        )
    }
    async load(): Promise<{[Pk: string]: T}> {
        const objects = {}
        const objectsData = await SS.getAll(this.storedType, this._vault.pk)
        for (let objData of Object.values(objectsData)) {
            const obj = this.typeModel.fromDict(objData)
            objects[obj.pk] = obj
        }
        this._objects = objects
        return this._objects
    }
    setAll(objects: {[Pk: string]: T}) {
        this._objects = objects
    }
    get(pk: Pk): T {
        return this._objects[pk]
    }
    getAll(): {[Pk: string]: T} {
        return this._objects
    }
    getAllArray(): T[] {
        return Object.values(this._objects)
    }
    get vault(): Vault {
        return this._vault
    }
    get index(): Pk[] {
        return Object.keys(this._objects)
    }
    get length(): number {
        return this.index.length
    }
}

export default TypeManager