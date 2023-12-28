import { Pk, VaultPk, Model, ModelDict } from "../models/types"
import Vault from "../models/Vault"
import SS, { StoredType } from "../services/StorageService"


type Objects = {Pk?: Model}

class TypeManager {
    storedType: StoredType
    typeModel: any 

    private _vault: Vault
    private _objects: Objects

    constructor(vault: Vault, objects: Objects = {}, storedType: StoredType, typeModel: any) {
        this._vault = vault
        this._objects = objects
        this.storedType = storedType
        this.typeModel = typeModel
    }
    clear() { this._objects = {}; }
    async delete(object: Model): Promise<void> {
        await SS.delete(object.pk)
        delete this._objects[object.pk]
    }
    async save(object: Model): Promise<void> {
        await SS.save(object.pk, object.toDict())
        this._objects[object.pk] = object
    }
    async saveAll(): Promise<void[]> {
        return await Promise.all(
            Object.values(this._objects).map(
                o => this.save(o))
        )
    }
    async load(): Promise<Objects> {
        const objects = {}
        const objectsData = await SS.getAll(this.storedType, this._vault.pk)
        for (let objData of Object.values(objectsData)) {
            const obj = this.typeModel.fromDict(objData)
            objects[obj.pk] = obj
        }
        this._objects = objects
        return this._objects
    }
    get(pk: Pk): Model {
        return this._objects[pk]
    }
    getAll(): Objects {
        return this._objects
    }
    getAllArray(): Model[] {
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