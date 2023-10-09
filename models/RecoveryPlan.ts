
class RecoveryPlan {
    pk: string;
    vault_pk: string;
    _secret: string;

    name: string;
    description: string;
    date: string;
    status: string;
    type: string;
    constructor(pk: string, vault_pk: string,
            name: string, description: string, date: string, status: string, type: string) {
        this.pk = pk;
        this.name = name;
        this.description = description;
        this.date = date;
        this.status = status;
        this.type = type;
    }


}

export default RecoveryPlan;